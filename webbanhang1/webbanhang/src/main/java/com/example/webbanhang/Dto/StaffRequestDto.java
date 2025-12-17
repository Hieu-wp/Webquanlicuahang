package com.example.webbanhang.Dto;
import java.time.LocalDate;

import lombok.Data;

@Data
public class StaffRequestDto {
    private String hoten;
    private String gioitinh;
    private LocalDate ngaysinh;
    private String sodienthoai;
    private String email;
    private String cccd;
    private Long idtaikhoan;   
    private String chucvu;
    private LocalDate ngayvaolam;
    private Integer trangthai; 
    private String tendangnhap;
    private String matkhau;
    
}