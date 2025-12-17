package com.example.webbanhang.Model;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "khachhang")
@Data
public class Customers {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idkhachhang")
    private Integer idkhachhang;

    @Column(name = "hoten", length = 100)
    private String hoten;

    @Column(name = "ngaysinh")
    private LocalDate ngaysinh;

    @Column(name = "sodienthoai", length = 15)
    private String sodienthoai;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "diachi", length = 255)
    private String diachi;

    @Column (name = "gioitinh", length = 10)
    private String gioitinh;

    @Column(name = "ngaytao")
    private LocalDate ngaytao;
    public Customers() {
    }
    public Customers(String hoten, LocalDate ngaysinh,
                     String sodienthoai, String email, String diachi, String gioitinh) {
        this.hoten = hoten;
        this.ngaysinh = ngaysinh;
        this.sodienthoai = sodienthoai;
        this.email = email;
        this.diachi = diachi;
        this.gioitinh = gioitinh;
    }
    @PrePersist
    public void prePersist() {
        if (this.ngaytao == null) {
            this.ngaytao = LocalDate.now();
        }
    }
    @Override
    public String toString() {
        return "Customers{" +
                "idkhachhang=" + idkhachhang +
                ", hoten='" + hoten + '\'' +
                ", ngaysinh=" + ngaysinh +
                ", sodienthoai='" + sodienthoai + '\'' +
                ", email='" + email + '\'' +
                ", diachi='" + diachi + '\'' +
                ", gioitinh='" + gioitinh + '\'' +
                ", ngaytao=" + ngaytao +
                '}';
    }
}
