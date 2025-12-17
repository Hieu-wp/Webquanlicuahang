package com.example.webbanhang.Dto;

import java.time.LocalDate;

import lombok.Data;

@Data
public class CustomerResponseDto {

    private Integer idkhachhang;
    private String hoten;
    private LocalDate ngaysinh;
    private String sodienthoai;
    private String email;
    private String diachi;
    private String gioitinh;
    private LocalDate ngaytao;
    
}
