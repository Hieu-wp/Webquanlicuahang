package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.PromotionRequestDto;
import com.example.webbanhang.Dto.PromotionResponseDto;

import java.util.List;

public interface PromotionService {
    List<PromotionResponseDto> getAll();
    List<PromotionResponseDto> getAllActive();
    PromotionResponseDto getById(Long id);
    PromotionResponseDto create(PromotionRequestDto dto);
    PromotionResponseDto update(Long id, PromotionRequestDto dto);
    void delete(Long id);
}
