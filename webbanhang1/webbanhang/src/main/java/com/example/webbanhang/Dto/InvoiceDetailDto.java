package com.example.webbanhang.Dto;

import lombok.Data;

@Data
public class InvoiceDetailDto {
    private Long idchitiet;
    private Long idsanpham;
    private String tensanpham;      
    private Double soluong;
    private Double dongia;
    private Double thanhtien;
    private String ghichu;
    private Double tongthanhtoan;  
}
