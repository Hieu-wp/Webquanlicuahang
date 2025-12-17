    package com.example.webbanhang.Service;

    import com.example.webbanhang.Dto.ProductRequestDto;
    import com.example.webbanhang.Model.Product;
    import com.example.webbanhang.Model.Promotion;
    import com.example.webbanhang.Repository.CategoryRepository;
    import com.example.webbanhang.Repository.ProductRepository;
    import com.example.webbanhang.Repository.PromotionRepository;
    import lombok.RequiredArgsConstructor;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import java.time.LocalDate;
    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class ProductServiceImpl implements ProductService {

        private final ProductRepository productRepository;
        private final PromotionRepository promotionRepository;
        private final CategoryRepository categoryRepository;

        /* ================== MAPPER: ENTITY -> DTO ================== */

        private ProductRequestDto toDto(Product p) {
            if (p == null) return null;

            ProductRequestDto dto = new ProductRequestDto();
            dto.setIdsanpham(p.getIdsanpham());
            dto.setTensanpham(p.getTensanpham());
            dto.setIddanhmuc(p.getIddanhmuc());
            dto.setDanhmuc(p.getDanhmuc());
            dto.setSoluong(p.getSoluong());
            dto.setGiaban(p.getGiaban());
            dto.setMota(p.getMota());
            dto.setHinhanhsanpham(p.getHinhanhsanpham());
            dto.setTrangthai(p.getTrangthai());
            dto.setIdkhuyenmai(p.getIdkhuyenmai());

            // Tính giá sau khuyến mãi (nếu có và đang active)
            if (p.getIdkhuyenmai() != null) {
                Promotion km = promotionRepository.findById(p.getIdkhuyenmai())
                        .filter(this::isPromotionActive)
                        .orElse(null);

                if (km != null && p.getGiaban() != null) {
                    Double finalPrice = calcDiscountedPrice(p.getGiaban(), km);
                    dto.setGiasaukhuyenmai(finalPrice);
                } else {
                    dto.setGiasaukhuyenmai(null);
                }
            } else {
                dto.setGiasaukhuyenmai(null);
            }

            return dto;
        }

        /* ================== MAPPER: DTO -> ENTITY ================== */

        private void applyDtoToEntity(ProductRequestDto dto, Product p) {
            p.setTensanpham(dto.getTensanpham());
            p.setIddanhmuc(dto.getIddanhmuc());

            // Lấy tên danh mục theo id
            if (dto.getIddanhmuc() != null) {
                categoryRepository.findById(dto.getIddanhmuc())
                        .ifPresent(cat -> p.setDanhmuc(cat.getTendanhmuc()));
            } else {
                p.setDanhmuc(dto.getDanhmuc());
            }

            p.setSoluong(dto.getSoluong());
            p.setGiaban(dto.getGiaban());
            p.setMota(dto.getMota());
            p.setHinhanhsanpham(dto.getHinhanhsanpham());
            p.setTrangthai(dto.getTrangthai());
            p.setIdkhuyenmai(dto.getIdkhuyenmai());
        }

        /* ================== KHUYẾN MÃI ================== */

        private boolean isPromotionActive(Promotion km) {
            if (km == null) return false;
            if (km.getTrangthai() == null || km.getTrangthai() != 1) return false;

            LocalDate now = LocalDate.now();

            boolean started =
                    km.getNgaybatdau() == null || !now.isBefore(km.getNgaybatdau()); // now >= start
            boolean notEnded =
                    km.getNgayketthuc() == null || !now.isAfter(km.getNgayketthuc()); // now <= end

            return started && notEnded;
        }

        private Double calcDiscountedPrice(Double basePrice, Promotion km) {
            if (basePrice == null || km == null || km.getLoai() == null) return basePrice;

            double price = basePrice;
            double value = km.getMucgiamgia() == null ? 0.0 : km.getMucgiamgia();

            switch (km.getLoai()) {
                case "percent" -> price = basePrice * (100.0 - value) / 100.0;
                case "fixed"   -> price = Math.max(0, basePrice - value);
                default        -> price = basePrice;
            }
            return price;
        }

        /* ================== SERVICE METHODS ================== */

        @Override
        public List<ProductRequestDto> getAllProducts() {
            return productRepository.findAll()
                    .stream()
                    .map(this::toDto)
                    .toList();
        }

        @Override
        public ProductRequestDto getProductbyId(Long id) {
            return productRepository.findById(id)
                    .map(this::toDto)
                    .orElse(null);
        }

        @Override
        @Transactional
        public ProductRequestDto saveProduct(ProductRequestDto dto) {
            if (dto == null) {
                throw new RuntimeException("Dữ liệu sản phẩm không hợp lệ!");
            }

            // ====== VALIDATE & CHUẨN HÓA TÊN SẢN PHẨM ======
            String rawName = dto.getTensanpham();
            if (rawName == null || rawName.isBlank()) {
                throw new RuntimeException("Tên sản phẩm không được để trống!");
            }
            String name = rawName.trim();

            // ====== CHẶN TRÙNG TÊN SẢN PHẨM ======
            if (dto.getIdsanpham() == null) {
                // THÊM MỚI
                if (productRepository.existsByTensanphamIgnoreCase(name)) {
                    throw new RuntimeException("Tên sản phẩm đã tồn tại, vui lòng chọn tên khác!");
                }
            } else {
                // CẬP NHẬT
                if (productRepository.existsByTensanphamIgnoreCaseAndIdsanphamNot(
                        name,
                        dto.getIdsanpham()
                )) {
                    throw new RuntimeException("Tên sản phẩm đã tồn tại cho sản phẩm khác!");
                }
            }

            // Gán lại tên đã trim vào dto để mapper dùng
            dto.setTensanpham(name);

            // ====== LẤY ENTITY (CẬP NHẬT / TẠO MỚI) ======
            Product entity;
            if (dto.getIdsanpham() != null) {
                entity = productRepository.findById(dto.getIdsanpham())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));
            } else {
                entity = new Product();
            }

            // Map dữ liệu từ DTO vào entity
            applyDtoToEntity(dto, entity);

            // Mặc định đang bán nếu chưa set
            if (entity.getTrangthai() == null) {
                entity.setTrangthai(1);
            }

            Product saved = productRepository.save(entity);
            return toDto(saved);
        }

        @Override
        @Transactional
        public ProductRequestDto toggleStatus(Long id) {
            Product p = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));

            Integer st = (p.getTrangthai() == null ? 1 : p.getTrangthai());
            p.setTrangthai(st == 1 ? 0 : 1);

            Product saved = productRepository.save(p);
            return toDto(saved);
        }

        @Override
        public long getProductsCount() {
            return productRepository.countByTrangthai(1);
        }
    }
