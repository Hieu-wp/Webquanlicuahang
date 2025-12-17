package com.example.webbanhang.Repository;
import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.webbanhang.Model.Account;
public interface AccountRepository extends JpaRepository<Account, Long> {
    Account findByTendangnhapAndMatkhau(String username, String password);
    Boolean existsByTendangnhap(String tendangnhap);
    Account findByTendangnhap(String tendangnhap);
    long countByNgaytao(LocalDate ngaytao);
    Boolean existsByEmail(String email);
 
}
