package com.example.webbanhang.Model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity
@Table(name = "danhmuc")
@Data
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iddanhmuc")
    private Integer iddanhmuc;

    @Column(name = "tendanhmuc", nullable = false, length = 255, unique = true)
    private String tendanhmuc;

    @Column(name = "mota")
    private String mota;

    @Column(name = "trangthai")
    private Integer trangthai;

    @Column(name = "ngaytao")
    private LocalDate ngaytao;

    @PrePersist
    public void prePersist() {
        if (trangthai == null) {
            trangthai = 1;
        }
        if (ngaytao == null) {
            ngaytao = LocalDate.now();
        }
    }
}
