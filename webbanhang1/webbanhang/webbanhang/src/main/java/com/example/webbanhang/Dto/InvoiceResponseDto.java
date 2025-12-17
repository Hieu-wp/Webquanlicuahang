package com.example.webbanhang.Dto;
import lombok.Data;
import java.util.List;

@Data
public class InvoiceResponseDto {
    private Long idhoadon;
    private String ngaygiaodich;     
    private Double tongthanhtoan;
    private Long idkhachhang;
    private Long idnhanvien;
    private String tenkhachhang;
    private String sodienthoai;
    private String tennhanvien;
    private Integer soluongSanPham; 
    private List<InvoiceDetailDto> chitiet;
    
}
