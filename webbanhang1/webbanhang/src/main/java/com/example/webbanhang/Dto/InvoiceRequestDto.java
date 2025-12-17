package com.example.webbanhang.Dto;

import lombok.Data;

import java.util.List;

@Data
public class InvoiceRequestDto {
    private Long idhoadon;        
    private Long idkhachhang;
    private Long idnhanvien;        
    private String ngaygiaodich;  
    private Double tongthanhtoan;  
    private List<InvoiceDetailDto> chitiet;
}
