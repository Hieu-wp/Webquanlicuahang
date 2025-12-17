package com.example.webbanhang.Service;

import java.util.List;

import com.example.webbanhang.Dto.CustomerRequestDto;
import com.example.webbanhang.Dto.CustomerResponseDto;

public interface CustomerService {
    List<CustomerResponseDto> getAll();
    CustomerResponseDto getById(Long id);
    List<CustomerResponseDto> search(String keyword);
    CustomerResponseDto create(CustomerRequestDto dto);
    CustomerResponseDto update( Long id, CustomerRequestDto dto);
    void delete(Long id);
}
