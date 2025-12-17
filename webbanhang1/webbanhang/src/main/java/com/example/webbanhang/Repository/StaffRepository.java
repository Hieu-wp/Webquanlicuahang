package com.example.webbanhang.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.webbanhang.Model.Staff;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByIdtaikhoan(Long idtaikhoan);
    Staff findByIdtaikhoan(Long idtaikhoan);
    boolean existsByEmail(String email);
    boolean existsBySodienthoai(String sodienthoai);
    boolean existsByCccd(String cccd);
} 