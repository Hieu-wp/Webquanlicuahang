package com.example.webbanhang.Dto;

import java.time.LocalDate;

import lombok.Data;
@Data
public class StaffResponseDto {
    private Long idnhanvien;
    private String hoten;
    private String chucvu;
    private String gioitinh;
    private LocalDate ngaysinh;
    private String sodienthoai;
    private String email;
    private Long idtaikhoan;
    private String cccd;
    private LocalDate ngayvaolam;
    private Integer trangthai;
}
