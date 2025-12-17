package com.example.webbanhang.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Setter;

@Entity
@Table(name = "sanpham")
@Data
@Setter
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idsanpham")
    private Long idsanpham;

    @Column(name = "tensanpham")
    private String tensanpham;

    @Column(name = "soluong")
    private Integer soluong;

    @Column(name = "giaban")
    private Double giaban;
    
    @Column(name = "danhmuc")    
    private String danhmuc;

    @Column(name = "mota", columnDefinition = "TEXT")
    private String mota;

    @Column(name = "hinhanhsanpham", columnDefinition = "LONGTEXT")
    private String hinhanhsanpham;

    @Column(name = "trangthai")
    private Integer trangthai;

    @Column(name = "idkhuyenmai")
    private Long idkhuyenmai;

    @Column(name = "giasaukhuyenmai")
    private Double giasaukhuyenmai;

    @Column(name = "iddanhmuc")
    private Integer iddanhmuc;
}
