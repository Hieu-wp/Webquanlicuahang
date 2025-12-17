package com.example.webbanhang.Dto;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class AccountDto {
    private Long id;
    private String hoten;
    private String email;
    private String tendangnhap;
    private String matkhau;
    private String vaitro;
    private Integer trangthai;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate ngaytao;
}
