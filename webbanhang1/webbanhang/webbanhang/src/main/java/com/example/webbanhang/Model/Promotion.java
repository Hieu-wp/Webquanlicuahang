package com.example.webbanhang.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "khuyenmai")
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idkhuyenmai")
    private Long idkhuyenmai;

    @Column(name = "tenkhuyenmai", nullable = false, length = 255)
    private String tenkhuyenmai;

    @Column(name = "loai", nullable = false, length = 20)
    private String loai;

    @Column(name = "apdungcho", nullable = false, length = 20)
    private String apdungcho;

    @Column(name = "mucgiamgia", nullable = false)
    private Double mucgiamgia;

    @Column(name = "dontoithieu")
    private Double dontoithieu;

    @Column(name = "ngaybatdau", nullable = false)
    private LocalDate ngaybatdau;

    @Column(name = "ngayketthuc", nullable = false)
    private LocalDate ngayketthuc;

    @Column(name = "mota")
    private String mota;

    @Column(name = "trangthai")
    private Integer trangthai;
}
