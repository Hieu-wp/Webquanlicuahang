package com.example.webbanhang.Dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CategoryResponseDto {

    private Integer iddanhmuc;
    private String tendanhmuc;
    private String mota;
    private Integer trangthai;
    private LocalDate ngaytao;
    private Long tongsanpham;
}
