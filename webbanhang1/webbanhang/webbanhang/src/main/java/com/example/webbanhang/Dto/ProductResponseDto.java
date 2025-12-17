package com.example.webbanhang.Dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductResponseDto {

    private Long idsanpham;
    private String tensanpham;
    private Integer soluong;
    private Double giaban;
    private String danhmuc;
    private String mota;
    private String hinhanhsanpham;
    private Integer trangthai;
    private Double giasaukhuyenmai;
    private Long idkhuyenmai;
    private String tenkhuyenmai;
}
