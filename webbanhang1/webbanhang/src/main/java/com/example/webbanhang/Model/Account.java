package com.example.webbanhang.Model;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "taikhoan")
@Data
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idtaikhoan")
    private Long id;

    @Column(name = "hoten")
    private String hoten;

    @Column(name = "email")
    private String email;

    @Column(name = "tendangnhap", nullable = false, unique = true)
    private String tendangnhap;

    @Column(name = "matkhau", nullable = false)
    private String matkhau;

    @Column(name = "vaitro")
    private String vaitro;

    @Column(name = "trangthai")
    private Integer trangthai;

    @Column(name = "ngaytao")
    private LocalDate ngaytao;
    public Account() {
    }  
    public Account(String hoten, String email, String tendangnhap,
                   String matkhau, String vaitro, Integer trangthai,
                   LocalDate ngaytao) {
        this.hoten = hoten;
        this.email = email;
        this.tendangnhap = tendangnhap;
        this.matkhau = matkhau;
        this.vaitro = vaitro;
        this.trangthai = trangthai;
        this.ngaytao = ngaytao;
    }
    @PrePersist
    public void prePersist() {
        if (this.ngaytao == null) {
            this.ngaytao = LocalDate.now();
        }
    }
    public Long getIdtaikhoan() {
        return id;
    }
    public void setIdtaikhoan(Long id) {
        this.id = id;
    }


    
}
