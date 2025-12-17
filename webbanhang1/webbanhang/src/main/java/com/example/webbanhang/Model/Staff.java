package com.example.webbanhang.Model;

import java.time.LocalDate;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "nhanvien")
@Data
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idnhanvien")
    private Long idnhanvien;
    @Column(name = "hoten")
    private String hoten;
    @Column(name = "gioitinh") 
    private String gioitinh;
    @Column(name = "ngaysinh")
    private LocalDate ngaysinh;
    @Column(name = "sodienthoai")
    private String sodienthoai;
    @Column(name = "email")
    private String email;
    @Column(name = "idtaikhoan", unique = true)
    private Long idtaikhoan;
    @Column(name = "chucvu")
    private String chucvu;
    @Column(name = "cccd")
    private String cccd;
    @Column(name = "ngayvaolam")
    private LocalDate ngayvaolam;
    @Column(name = "trangthai")
    private Integer trangthai;
    public Staff() {
    }   
    public Staff(String hoten, String gioitinh, LocalDate ngaysinh,
                 String sodienthoai, String email, Long idtaikhoan,
                 String chucvu, String cccd, LocalDate ngayvaolam, Integer trangthai) {
        this.hoten = hoten;
        this.gioitinh = gioitinh;
        this.ngaysinh = ngaysinh;
        this.sodienthoai = sodienthoai;
        this.email = email;
        this.idtaikhoan = idtaikhoan;
        this.chucvu = chucvu;
        this.cccd = cccd;
        this.ngayvaolam = ngayvaolam;
        this.trangthai = trangthai;
    }
    public Long getIdnhanvien() {
        return idnhanvien;
    }
    public void setIdnhanvien(Long idnhanvien) {
        this.idnhanvien = idnhanvien;
    }
    public String getHoten() {
        return hoten;
    }
    public void setHoten(String hoten) {
        this.hoten = hoten;
    }
    public String getGioitinh() {
        return gioitinh;
    }
    public void setGioitinh(String gioitinh) {
        this.gioitinh = gioitinh;
    }
    public LocalDate getNgaysinh() {
        return ngaysinh;
    }
    public void setNgaysinh(LocalDate ngaysinh) {
        this.ngaysinh = ngaysinh;
    }
    public String getSodienthoai() {
        return sodienthoai;
    }
    public void setSodienthoai(String sodienthoai) {
        this.sodienthoai = sodienthoai;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public Long getIdtaikhoan() {
        return idtaikhoan;
    }
    public void setIdtaikhoan(Long idtaikhoan) {
        this.idtaikhoan = idtaikhoan;
    }
    public String getChucvu() {
        return chucvu;
    }
    public void setChucvu(String chucvu) {
        this.chucvu = chucvu;
    }
    public String getCccd() {
        return cccd;
    }
    public void setCccd(String cccd) {
        this.cccd = cccd;
    }
    public LocalDate getNgayvaolam() {
        return ngayvaolam;
    }
    public void setNgayvaolam(LocalDate ngayvaolam) {
        this.ngayvaolam = ngayvaolam;
    }
    public Integer getTrangthai() {
        return trangthai;
    }
    public void setTrangthai(Integer trangthai) {
        this.trangthai = trangthai;
    }
    @PrePersist
    public void prePersist() {
        if (this.ngayvaolam == null) {
            this.ngayvaolam = LocalDate.now();
        }
    }
}