package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.InvoiceDetailDto;
import com.example.webbanhang.Dto.InvoiceRequestDto;
import com.example.webbanhang.Dto.InvoiceResponseDto;
import com.example.webbanhang.Model.Invoice;
import com.example.webbanhang.Model.InvoiceDetail;
import com.example.webbanhang.Model.Product;
import com.example.webbanhang.Repository.CustomerRepository;
import com.example.webbanhang.Repository.InvoiceDetailRepository;
import com.example.webbanhang.Repository.InvoiceRepository;
import com.example.webbanhang.Repository.ProductRepository;
import com.example.webbanhang.Repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceDetailRepository invoiceDetailRepository;
    private final CustomerRepository customerRepository;
    private final StaffRepository staffRepository;
    private final ProductRepository productRepository;

    /* ================== MAPPER ================== */

    private InvoiceResponseDto toDto(Invoice invoice, List<InvoiceDetail> details) {
        if (invoice == null) return null;

        InvoiceResponseDto dto = new InvoiceResponseDto();
        dto.setIdhoadon(invoice.getIdhoadon());

        LocalDate ng = invoice.getNgaygiaodich();
        dto.setNgaygiaodich(ng != null ? ng.toString() : null);

        dto.setTongthanhtoan(invoice.getTongthanhtoan());
        dto.setIdkhachhang(invoice.getIdkhachhang());
        dto.setIdnhanvien(invoice.getIdnhanvien());

        // Thông tin khách hàng
        if (invoice.getIdkhachhang() != null) {
            customerRepository.findById(invoice.getIdkhachhang())
                    .ifPresent(kh -> {
                        dto.setTenkhachhang(kh.getHoten());
                        dto.setSodienthoai(kh.getSodienthoai());
                    });
        }

        // Thông tin nhân viên
        if (invoice.getIdnhanvien() != null) {
            staffRepository.findById(invoice.getIdnhanvien())
                    .ifPresent(nv -> dto.setTennhanvien(nv.getHoten()));
        }

        // Chi tiết
        List<InvoiceDetailDto> detailDtos = new ArrayList<>();
        int totalItems = 0;

        if (details != null) {
            for (InvoiceDetail d : details) {
                InvoiceDetailDto cd = new InvoiceDetailDto();
                cd.setIdchitiet(d.getIdchitiet());
                cd.setIdsanpham(d.getIdsanpham());
                cd.setSoluong(d.getSoluong());
                cd.setDongia(d.getDongia());
                cd.setThanhtien(d.getThanhtien());
                cd.setGhichu(d.getGhichu());

                // Tên sản phẩm
                if (d.getIdsanpham() != null) {
                    productRepository.findById(d.getIdsanpham())
                            .ifPresent(sp -> cd.setTensanpham(sp.getTensanpham()));
                }

                detailDtos.add(cd);
                totalItems += (d.getSoluong() != null) ? d.getSoluong().intValue() : 0;
            }
        }

        dto.setChitiet(detailDtos);
        dto.setSoluongSanPham(totalItems);

        return dto;
    }

    /* ================== HELPER: BUILD CHI TIẾT + TRỪ KHO ================== */

    /**
     * Tạo lại chi tiết hóa đơn và TRỪ tồn kho tương ứng.
     * Nếu sản phẩm bị khóa hoặc không đủ số lượng -> ném RuntimeException (rollback @Transactional).
     */
    private double buildDetailsAndUpdateStock(Invoice invoice, List<InvoiceDetailDto> detailDtos) {
        double giaGoc = 0.0;
        Long idhoadon = invoice.getIdhoadon();

        if (detailDtos == null) return 0.0;

        for (InvoiceDetailDto d : detailDtos) {
            if (d.getIdsanpham() == null) continue;

            // Lấy sản phẩm
            Product sp = productRepository.findById(d.getIdsanpham())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + d.getIdsanpham()));

            // Chặn sản phẩm đang khóa
            Integer trangthai = sp.getTrangthai();
            if (trangthai != null && trangthai != 1) {
                throw new RuntimeException("Sản phẩm \"" + sp.getTensanpham() + "\" đang bị khóa, không thể bán.");
            }

            // Số lượng bán
            int soLuongBan = d.getSoluong() != null ? d.getSoluong().intValue() : 0;
            if (soLuongBan <= 0) {
                throw new RuntimeException("Số lượng cho sản phẩm \"" + sp.getTensanpham() + "\" không hợp lệ.");
            }

            // Kiểm tra tồn kho
            int tonKho = sp.getSoluong() != null ? sp.getSoluong() : 0;
            if (tonKho < soLuongBan) {
                throw new RuntimeException("Sản phẩm \"" + sp.getTensanpham()
                        + "\" không đủ số lượng. Tồn kho: " + tonKho + ", yêu cầu: " + soLuongBan);
            }

            // Đơn giá: ưu tiên giá từ DB, nếu null thì mới lấy từ DTO
            double donGia = 0.0;
            if (sp.getGiaban() != null) {
                donGia = sp.getGiaban();
            } else if (d.getDongia() != null) {
                donGia = d.getDongia();
            }

            double thanhTien = soLuongBan * donGia;

            // Lưu chi tiết
            InvoiceDetail detail = new InvoiceDetail();
            detail.setIdhoadon(idhoadon);
            detail.setIdsanpham(sp.getIdsanpham());
            detail.setSoluong((double) soLuongBan);
            detail.setDongia(donGia);
            detail.setThanhtien(thanhTien);
            detail.setGhichu(d.getGhichu());

            invoiceDetailRepository.save(detail);

            // TRỪ tồn kho
            sp.setSoluong(tonKho - soLuongBan);
            productRepository.save(sp);

            giaGoc += thanhTien;
        }

        return giaGoc;
    }

    /**
     * Khi UPDATE hóa đơn: cộng lại stock từ chi tiết cũ.
     */
    private void restoreStockFromOldDetails(Long idhoadon) {
        List<InvoiceDetail> oldDetails = invoiceDetailRepository.findByIdhoadon(idhoadon);
        for (InvoiceDetail d : oldDetails) {
            if (d.getIdsanpham() == null || d.getSoluong() == null) continue;

            productRepository.findById(d.getIdsanpham()).ifPresent(sp -> {
                int tonKho = sp.getSoluong() != null ? sp.getSoluong() : 0;
                int soLuongCu = d.getSoluong().intValue();
                sp.setSoluong(tonKho + soLuongCu); // cộng lại
                productRepository.save(sp);
            });
        }
    }

    /* ================== CRUD ================== */

    @Override
    public List<InvoiceResponseDto> getAll() {
        List<Invoice> invoices = invoiceRepository.findAll();
        List<InvoiceResponseDto> list = new ArrayList<>();

        for (Invoice inv : invoices) {
            List<InvoiceDetail> details =
                    invoiceDetailRepository.findByIdhoadon(inv.getIdhoadon());
            list.add(toDto(inv, details));
        }
        return list;
    }

    @Override
    public InvoiceResponseDto getById(Long id) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

        List<InvoiceDetail> details = invoiceDetailRepository.findByIdhoadon(id);
        return toDto(inv, details);
    }

    @Override
    @Transactional
    public InvoiceResponseDto create(InvoiceRequestDto dto) {
        Invoice inv = new Invoice();

        // Ngày giao dịch
        LocalDate ngaygd;
        if (dto.getNgaygiaodich() != null && !dto.getNgaygiaodich().isBlank()) {
            ngaygd = LocalDate.parse(dto.getNgaygiaodich());
        } else {
            ngaygd = LocalDate.now();
        }

        inv.setNgaygiaodich(ngaygd);
        inv.setIdkhachhang(dto.getIdkhachhang());
        inv.setIdnhanvien(dto.getIdnhanvien());
        inv.setTongthanhtoan(0.0); // tạm, tí nữa set lại

        Invoice saved = invoiceRepository.save(inv);

        // TẠO CHI TIẾT + TRỪ KHO
        double giaGoc = buildDetailsAndUpdateStock(saved, dto.getChitiet());

        // TỔNG THANH TOÁN (SAU GIẢM) TỪ FE
        Double tongClient = dto.getTongthanhtoan();
        double tongThanhToan = (tongClient != null && tongClient > 0)
                ? tongClient
                : giaGoc;

        saved.setTongthanhtoan(tongThanhToan);
        invoiceRepository.save(saved);

        List<InvoiceDetail> details =
                invoiceDetailRepository.findByIdhoadon(saved.getIdhoadon());
        return toDto(saved, details);
    }

    @Override
    @Transactional
    public InvoiceResponseDto update(Long id, InvoiceRequestDto dto) {
        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hóa đơn!"));

        // Ngày giao dịch
        if (dto.getNgaygiaodich() != null && !dto.getNgaygiaodich().isBlank()) {
            inv.setNgaygiaodich(LocalDate.parse(dto.getNgaygiaodich()));
        }
        inv.setIdkhachhang(dto.getIdkhachhang());
        inv.setIdnhanvien(dto.getIdnhanvien());

        // 1) CỘNG LẠI TỒN KHO TỪ CHI TIẾT CŨ
        restoreStockFromOldDetails(id);

        // 2) XÓA CHI TIẾT CŨ
        invoiceDetailRepository.deleteByIdhoadon(id);

        // 3) TẠO CHI TIẾT MỚI + TRỪ KHO
        double giaGoc = buildDetailsAndUpdateStock(inv, dto.getChitiet());

        // 4) CẬP NHẬT TỔNG TIỀN
        Double tongClient = dto.getTongthanhtoan();
        double tongThanhToan =
                (tongClient != null && tongClient > 0) ? tongClient : giaGoc;

        inv.setTongthanhtoan(tongThanhToan);
        Invoice saved = invoiceRepository.save(inv);

        List<InvoiceDetail> details =
                invoiceDetailRepository.findByIdhoadon(saved.getIdhoadon());
        return toDto(saved, details);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        // XÓA HOÁ ĐƠN **không** tự động restore stock (tùy nghiệp vụ).
        // Nếu muốn khi xóa hóa đơn thì cộng lại tồn kho, có thể gọi restoreStockFromOldDetails(id) ở đây.

        Invoice inv = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hóa đơn không tồn tại!"));

        invoiceDetailRepository.deleteByIdhoadon(id);
        invoiceRepository.delete(inv);
    }

    @Override
    public List<InvoiceResponseDto> getByCustomer(Long customerId) {
        List<Invoice> invoices =
                invoiceRepository.findByIdkhachhangOrderByNgaygiaodichDesc(customerId);

        List<InvoiceResponseDto> result = new ArrayList<>();
        for (Invoice inv : invoices) {
            List<InvoiceDetail> details =
                    invoiceDetailRepository.findByIdhoadon(inv.getIdhoadon());
            result.add(toDto(inv, details));
        }
        return result;
    }
}
