package com.example.webbanhang.Dto;

import lombok.Data;
import java.util.List;

@Data
public class PromotionResponseDto {
    private Long idkhuyenmai;
    private String tenkhuyenmai;
    private String loai;
    private String apdungcho;
    private Double mucgiamgia;
    private Double dontoithieu;
    private String mota;
    private Integer trangthai;
    private String ngaybatdau;
    private String ngayketthuc;
    private Long soLuongSanPham;      
    private List<String> tenSanPham;  
    private List<Long> idsanpham;    
    private List<Integer> iddanhmuc; 
}
