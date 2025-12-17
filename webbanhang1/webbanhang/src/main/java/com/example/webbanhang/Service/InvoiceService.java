package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.InvoiceRequestDto;
import com.example.webbanhang.Dto.InvoiceResponseDto;

import java.util.List;

public interface InvoiceService {

    List<InvoiceResponseDto> getAll();

    InvoiceResponseDto getById(Long id);

    InvoiceResponseDto create(InvoiceRequestDto dto);

    InvoiceResponseDto update(Long id, InvoiceRequestDto dto);

    void delete(Long id); 
    
    List<InvoiceResponseDto> getByCustomer(Long customerId);
}
