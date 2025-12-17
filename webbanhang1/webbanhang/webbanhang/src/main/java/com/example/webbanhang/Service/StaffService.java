package com.example.webbanhang.Service;
import com.example.webbanhang.Dto.StaffRequestDto;
import com.example.webbanhang.Dto.StaffResponseDto;
import java.util.List;

public interface StaffService {
    List<StaffResponseDto> getAll();
    StaffResponseDto getById(Long id);
    StaffResponseDto save(StaffRequestDto dto);
    StaffResponseDto update(Long id, StaffRequestDto dto);
    void delete(Long id);
}
