package com.example.webbanhang.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Data
@Entity
@Table(name = "hoadon")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idhoadon")
    private Long idhoadon;

    @Column(name = "ngaygiaodich")
    private LocalDate ngaygiaodich;

    @Column(name = "tongthanhtoan")
    private Double tongthanhtoan;

    @Column(name = "idnhanvien")
    private Long idnhanvien;

    @Column(name = "idkhachhang")
    private Long idkhachhang;
    
}
