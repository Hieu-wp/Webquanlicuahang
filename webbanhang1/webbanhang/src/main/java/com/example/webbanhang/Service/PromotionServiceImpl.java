package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.PromotionRequestDto;
import com.example.webbanhang.Dto.PromotionResponseDto;
import com.example.webbanhang.Model.Product;
import com.example.webbanhang.Model.Promotion;
import com.example.webbanhang.Repository.ProductRepository;
import com.example.webbanhang.Repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;

    /**
     * Client gửi dạng: "2025-12-09T00:00"
     * -> lấy phần trước 'T' -> LocalDate.parse("2025-12-09")
     */
    private LocalDate parseClientDate(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            String datePart = value.split("T")[0];      // "2025-12-09"
            return LocalDate.parse(datePart);           // ISO yyyy-MM-dd
        } catch (DateTimeParseException ex) {
            throw new RuntimeException(
                    "Định dạng ngày không hợp lệ, yêu cầu yyyy-MM-dd hoặc yyyy-MM-dd'T'HH:mm");
        }
    }

    /**
     * Gửi lại cho client để hiển thị trên input datetime-local
     * → format thành "yyyy-MM-ddT00:00"
     */
    private String toClientDate(LocalDate date) {
        if (date == null) return null;
        return date.toString() + "T00:00";   // ví dụ "2025-12-09T00:00"
    }

    private PromotionResponseDto toDto(Promotion e) {
        if (e == null) return null;

        PromotionResponseDto dto = new PromotionResponseDto();
        dto.setIdkhuyenmai(e.getIdkhuyenmai());
        dto.setTenkhuyenmai(e.getTenkhuyenmai());
        dto.setLoai(e.getLoai());
        dto.setApdungcho(e.getApdungcho());
        dto.setMucgiamgia(e.getMucgiamgia());
        dto.setDontoithieu(e.getDontoithieu());
        dto.setMota(e.getMota());
        dto.setTrangthai(e.getTrangthai());

        // dùng LocalDate -> convert sang "yyyy-MM-ddT00:00"
        dto.setNgaybatdau(toClientDate(e.getNgaybatdau()));
        dto.setNgayketthuc(toClientDate(e.getNgayketthuc()));

        if (e.getIdkhuyenmai() != null) {
            List<Product> products = productRepository.findByIdkhuyenmai(e.getIdkhuyenmai());

            dto.setSoLuongSanPham((long) products.size());
            dto.setTenSanPham(products.stream()
                    .map(Product::getTensanpham)
                    .toList());
            dto.setIdsanpham(products.stream()
                    .map(Product::getIdsanpham)
                    .toList());

            Set<Integer> catIds = products.stream()
                    .map(Product::getIddanhmuc)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            dto.setIddanhmuc(new ArrayList<>(catIds));
        } else {
            dto.setSoLuongSanPham(0L);
            dto.setTenSanPham(List.of());
            dto.setIdsanpham(List.of());
            dto.setIddanhmuc(List.of());
        }

        return dto;
    }

    private void applyDtoToEntity(PromotionRequestDto dto, Promotion e) {
        e.setTenkhuyenmai(dto.getTenkhuyenmai());
        e.setLoai(dto.getLoai());
        e.setApdungcho(dto.getApdungcho());
        e.setMucgiamgia(dto.getMucgiamgia());
        e.setDontoithieu(dto.getDontoithieu());
        e.setMota(dto.getMota());

        if (dto.getTrangthai() != null) {
            e.setTrangthai(dto.getTrangthai());
        }

        // parse từ string client -> LocalDate
        if (dto.getNgaybatdau() != null && !dto.getNgaybatdau().isBlank()) {
            e.setNgaybatdau(parseClientDate(dto.getNgaybatdau()));
        }
        if (dto.getNgayketthuc() != null && !dto.getNgayketthuc().isBlank()) {
            e.setNgayketthuc(parseClientDate(dto.getNgayketthuc()));
        }
    }

    private boolean isPromotionActive(Promotion km) {
        if (km == null) return false;
        if (km.getTrangthai() == null || km.getTrangthai() != 1) return false;

        LocalDate today = LocalDate.now();

        boolean started =
                km.getNgaybatdau() == null || !today.isBefore(km.getNgaybatdau()); // today >= start
        boolean notEnded =
                km.getNgayketthuc() == null || !today.isAfter(km.getNgayketthuc()); // today <= end

        return started && notEnded;
    }

    private double calcDiscountedPrice(double original, Promotion p) {
        if (p.getMucgiamgia() == null) return original;

        if ("percent".equalsIgnoreCase(p.getLoai())) {
            double v = original * (100.0 - p.getMucgiamgia()) / 100.0;
            return Math.max(0, Math.round(v));
        } else if ("fixed".equalsIgnoreCase(p.getLoai())) {
            double v = original - p.getMucgiamgia();
            return Math.max(0, v);
        }
        return original;
    }

    private void applyPromotionToProductList(Promotion promotion, List<Product> products) {
        if (promotion.getIdkhuyenmai() == null || products == null || products.isEmpty()) return;

        for (Product p : products) {
            p.setIdkhuyenmai(promotion.getIdkhuyenmai());
            if (p.getGiaban() != null) {
                double finalPrice = calcDiscountedPrice(p.getGiaban(), promotion);
                p.setGiasaukhuyenmai(finalPrice);
            }
        }
        productRepository.saveAll(products);
    }

    private void clearPromotionFromAllProducts(Long promotionId) {
        if (promotionId == null) return;
        List<Product> products = productRepository.findByIdkhuyenmai(promotionId);
        for (Product p : products) {
            p.setIdkhuyenmai(null);
            p.setGiasaukhuyenmai(null);
        }
        productRepository.saveAll(products);
    }

    private void applyRuleToProducts(Promotion promotion, PromotionRequestDto dto) {
        clearPromotionFromAllProducts(promotion.getIdkhuyenmai());

        if (promotion.getApdungcho() == null) return;

        String applyTo = promotion.getApdungcho();

        if ("all".equalsIgnoreCase(applyTo)) {
            List<Product> all = productRepository.findByTrangthai(1);
            applyPromotionToProductList(promotion, all);

        } else if ("category".equalsIgnoreCase(applyTo)) {
            List<Integer> catIds = dto.getIddanhmuc();
            if (catIds != null && !catIds.isEmpty()) {
                List<Product> products = productRepository.findByIddanhmucIn(catIds);
                applyPromotionToProductList(promotion, products);
            }

        } else if ("product".equalsIgnoreCase(applyTo)) {
            List<Long> prodIds = dto.getIdsanpham();
            if (prodIds != null && !prodIds.isEmpty()) {
                List<Product> products = prodIds.stream()
                        .filter(Objects::nonNull)
                        .map(id -> productRepository.findById(id)
                                .orElseThrow(() ->
                                        new RuntimeException("Không tìm thấy sản phẩm id = " + id)))
                        .toList();
                applyPromotionToProductList(promotion, products);
            }
        }
    }

    @Override
    public List<PromotionResponseDto> getAll() {
        return promotionRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public PromotionResponseDto getById(Long id) {
        Promotion e = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi!"));
        return toDto(e);
    }

    @Override
    public PromotionResponseDto create(PromotionRequestDto dto) {
        Promotion e = new Promotion();

        if (dto.getTrangthai() == null) {
            e.setTrangthai(1);
        }

        applyDtoToEntity(dto, e);

        if (e.getNgaybatdau() == null || e.getNgayketthuc() == null) {
            throw new RuntimeException("Ngày bắt đầu và ngày kết thúc là bắt buộc!");
        }
        if (!e.getNgayketthuc().isAfter(e.getNgaybatdau())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        Promotion saved = promotionRepository.save(e);
        applyRuleToProducts(saved, dto);

        return toDto(saved);
    }

    @Override
    public PromotionResponseDto update(Long id, PromotionRequestDto dto) {
        Promotion e = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi!"));

        applyDtoToEntity(dto, e);

        if (e.getNgaybatdau() == null || e.getNgayketthuc() == null) {
            throw new RuntimeException("Ngày bắt đầu và ngày kết thúc là bắt buộc!");
        }
        if (!e.getNgayketthuc().isAfter(e.getNgaybatdau())) {
            throw new RuntimeException("Ngày kết thúc phải sau ngày bắt đầu!");
        }

        Promotion saved = promotionRepository.save(e);
        applyRuleToProducts(saved, dto);

        return toDto(saved);
    }

    @Override
    public List<PromotionResponseDto> getAllActive() {
        return promotionRepository.findAll().stream()
                .filter(this::isPromotionActive)
                .map(this::toDto)
                .toList();
    }

    @Override
    public void delete(Long id) {
        Promotion e = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khuyến mãi!"));

        clearPromotionFromAllProducts(id);
        promotionRepository.delete(e);
    }
}
