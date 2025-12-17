DROP DATABASE IF EXISTS qlbanhang_danghieu1;
CREATE DATABASE qlbanhang_danghieu1;
USE qlbanhang_danghieu1;

-- ====== TAIKHOAN ======
CREATE TABLE taikhoan (
    idtaikhoan   INT AUTO_INCREMENT PRIMARY KEY,
    hoten        VARCHAR(255),
    email        VARCHAR(255),
    tendangnhap  VARCHAR(255) NOT NULL UNIQUE,
    matkhau      VARCHAR(255) NOT NULL,
    vaitro       VARCHAR(255),
    trangthai    TINYINT(1) DEFAULT 1,
    ngaytao      DATE DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== NHANVIEN ======
CREATE TABLE nhanvien (
    idnhanvien INT AUTO_INCREMENT PRIMARY KEY,
    hoten      VARCHAR(100),
    gioitinh   VARCHAR(10),
    ngaysinh   DATE,
    sodienthoai VARCHAR(15),
    email      VARCHAR(100),
    idtaikhoan INT UNIQUE,
    chucvu     VARCHAR(50),
    ngayvaolam DATE,
    trangthai  TINYINT(4) DEFAULT 1,
    cccd       VARCHAR(50),
    CONSTRAINT fk_nhanvien_taikhoan
        FOREIGN KEY (idtaikhoan) REFERENCES taikhoan(idtaikhoan)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE khachhang (
    idkhachhang INT AUTO_INCREMENT PRIMARY KEY,
    hoten       VARCHAR(100),
    ngaysinh    DATE,
    sodienthoai VARCHAR(15),
    email       VARCHAR(100),
    diachi      VARCHAR(255),
    gioitinh    VARCHAR(10),
    ngaytao     DATE DEFAULT (CURRENT_DATE)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

CREATE TABLE khuyenmai (
    idkhuyenmai  INT AUTO_INCREMENT PRIMARY KEY,
    tenkhuyenmai VARCHAR(255),
    loai         VARCHAR(20),
    apdungcho    VARCHAR(20) DEFAULT 'all',
    dontoithieu  DOUBLE DEFAULT 0,
    mucgiamgia   DOUBLE,
    ngaybatdau   DATE,
    ngayketthuc  DATE,
    mota         TEXT
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== DANHMUC (BẢNG MỚI) ======
CREATE TABLE danhmuc (
    iddanhmuc   INT AUTO_INCREMENT PRIMARY KEY,
    tendanhmuc  VARCHAR(255) NOT NULL UNIQUE,
    mota        TEXT
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== SANPHAM (CÓ KHUYENMAI + DANHMUC) ======
CREATE TABLE sanpham (
    idsanpham       INT AUTO_INCREMENT PRIMARY KEY,
    tensanpham      VARCHAR(255) NOT NULL,
    soluong         INT,
    giaban          DOUBLE,
    mota            TEXT,
    hinhanhsanpham  LONGTEXT,
    trangthai       TINYINT(1) DEFAULT 1,
    idkhuyenmai     INT,
    iddanhmuc       INT,
    CONSTRAINT fk_sanpham_khuyenmai
        FOREIGN KEY (idkhuyenmai) REFERENCES khuyenmai(idkhuyenmai),
    CONSTRAINT fk_sanpham_danhmuc
        FOREIGN KEY (iddanhmuc) REFERENCES danhmuc(iddanhmuc)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== HOADON ======
CREATE TABLE hoadon (
    idhoadon      INT AUTO_INCREMENT PRIMARY KEY,
    ngaygiaodich  DATE DEFAULT (CURRENT_DATE),
    tongthanhtoan DOUBLE,
    idnhanvien    INT,
    idkhachhang   INT,
    CONSTRAINT fk_hoadon_nhanvien
        FOREIGN KEY (idnhanvien) REFERENCES nhanvien(idnhanvien),
    CONSTRAINT fk_hoadon_khachhang
        FOREIGN KEY (idkhachhang) REFERENCES khachhang(idkhachhang)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== CHITIETHOADON ======
CREATE TABLE chitiethoadon (
    idchitiet  INT AUTO_INCREMENT PRIMARY KEY,
    idhoadon   INT,
    idsanpham  INT,
    soluong    DOUBLE,
    dongia     DOUBLE,
    thanhtien  DOUBLE,
    ghichu     VARCHAR(200),
    CONSTRAINT fk_cthd_hoadon
        FOREIGN KEY (idhoadon) REFERENCES hoadon(idhoadon),
    CONSTRAINT fk_cthd_sanpham
        FOREIGN KEY (idsanpham) REFERENCES sanpham(idsanpham)
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== THONGKE ======
CREATE TABLE thongke (
    idthongke   INT AUTO_INCREMENT PRIMARY KEY,
    ngaybatdau  DATE,
    ngayketthuc DATE,
    doanhthu    DOUBLE
) ENGINE=InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci;

-- ====== (OPTIONAL) INSERT ADMIN MẶC ĐỊNH ======
INSERT INTO taikhoan (hoten, email, tendangnhap, matkhau, vaitro, trangthai)
VALUES ('Lê Hải Đăng',
        'lhdangcntt2311067@student.ctuet.edu.vn',
        'haidangle555',
        '12345678',
        'admin',
        1);
ALTER TABLE khuyenmai
ADD COLUMN trangthai TINYINT(1) DEFAULT 1;
ALTER TABLE sanpham
ADD COLUMN danhmuc VARCHAR(255);
ALTER TABLE danhmuc
ADD COLUMN ngaytao DATETIME DEFAULT CURRENT_TIMESTAMP;
DESCRIBE danhmuc;
USE QLBanhang_danghieu1;

ALTER TABLE danhmuc
ADD COLUMN trangthai INT DEFAULT 1;
