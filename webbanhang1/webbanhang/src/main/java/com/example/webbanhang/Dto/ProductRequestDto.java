package com.example.webbanhang.Dto;

import jakarta.persistence.Transient;
import lombok.Data;

@Data
public class ProductRequestDto {
    private Long idsanpham;
    private String tensanpham;
    private Integer soluong;
    private Integer iddanhmuc;
    private Double giaban;
    private String danhmuc;
    private String mota;
    private String hinhanhsanpham;
    private Integer trangthai;
    private Long idkhuyenmai;
    private Double giasaukhuyenmai;
}
