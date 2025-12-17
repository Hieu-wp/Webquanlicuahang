package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.CategoryRequestDto;
import com.example.webbanhang.Dto.CategoryResponseDto;
import com.example.webbanhang.Model.Category;
import com.example.webbanhang.Repository.CategoryRepository;
import com.example.webbanhang.Repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    // ===== MAPPING =====
    private CategoryResponseDto toDto(Category c) {
        CategoryResponseDto dto = new CategoryResponseDto();
        dto.setIddanhmuc(c.getIddanhmuc());
        dto.setTendanhmuc(c.getTendanhmuc());
        dto.setMota(c.getMota());
        dto.setTrangthai(c.getTrangthai());
        dto.setNgaytao(c.getNgaytao());

        long count = 0L;
        if (c.getIddanhmuc() != null) {
            count = productRepository.countByIddanhmuc(c.getIddanhmuc());
        }
        dto.setTongsanpham(count);
        return dto;
    }

    private void applyDtoToEntity(CategoryRequestDto dto, Category entity) {
        if (dto.getTendanhmuc() != null) {
            entity.setTendanhmuc(dto.getTendanhmuc().trim());
        }
        entity.setMota(dto.getMota());

        if (dto.getTrangthai() != null) {
            entity.setTrangthai(dto.getTrangthai());
        } else if (entity.getTrangthai() == null) {
            entity.setTrangthai(1);
        }
    }

    // ===== IMPLEMENTATION =====

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDto> getAll() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDto getById(Integer id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
        return toDto(c);
    }

    @Override
    public CategoryResponseDto create(CategoryRequestDto dto) {
        if (dto.getTendanhmuc() == null || dto.getTendanhmuc().isBlank()) {
            throw new RuntimeException("Tên danh mục không được trống!");
        }

        if (categoryRepository.existsByTendanhmucIgnoreCase(dto.getTendanhmuc().trim())) {
            throw new RuntimeException("Tên danh mục đã tồn tại!");
        }

        Category c = new Category();
        applyDtoToEntity(dto, c);
        Category saved = categoryRepository.save(c);
        return toDto(saved);
    }

    @Override
    public CategoryResponseDto update(Integer id, CategoryRequestDto dto) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        if (dto.getTendanhmuc() != null &&
            !dto.getTendanhmuc().trim().equalsIgnoreCase(c.getTendanhmuc())) {

            if (categoryRepository.existsByTendanhmucIgnoreCase(dto.getTendanhmuc().trim())) {
                throw new RuntimeException("Tên danh mục đã tồn tại!");
            }
        }

        applyDtoToEntity(dto, c);
        Category saved = categoryRepository.save(c);
        return toDto(saved);
    }

    @Override
    public void toggleStatus(Integer id) {
        Category c = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));
        Integer current = c.getTrangthai() == null ? 1 : c.getTrangthai();
        c.setTrangthai(current == 1 ? 0 : 1);
        categoryRepository.save(c);
    }
}
