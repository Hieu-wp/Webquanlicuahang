package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.CategoryRequestDto;
import com.example.webbanhang.Dto.CategoryResponseDto;

import java.util.List;

public interface CategoryService {

    List<CategoryResponseDto> getAll();

    CategoryResponseDto getById(Integer id);

    CategoryResponseDto create(CategoryRequestDto dto);

    CategoryResponseDto update(Integer id, CategoryRequestDto dto);

    void toggleStatus(Integer id);
}
