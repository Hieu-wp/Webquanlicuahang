package com.example.webbanhang.Model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "chitiethoadon")
public class InvoiceDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idchitiet")
    private Long idchitiet;

    @Column(name = "idhoadon")
    private Long idhoadon;

    @Column(name = "idsanpham")
    private Long idsanpham;

    @Column(name = "soluong")
    private Double soluong;

    @Column(name = "dongia")
    private Double dongia;

    @Column(name = "thanhtien")
    private Double thanhtien;

    @Column(name = "ghichu", length = 200)
    private String ghichu;
}
