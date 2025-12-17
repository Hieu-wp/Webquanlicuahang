package com.example.webbanhang.Repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.webbanhang.Model.Customers;

public interface CustomerRepository extends JpaRepository<Customers, Long> {
    boolean existsBySodienthoai(String sodienthoai);
    boolean existsByEmail(String email);
    List<Customers> findByHotenContainingIgnoreCaseOrEmailContainingIgnoreCaseOrSodienthoaiContainingIgnoreCase
    (String hoten,String email,String sodienthoai);
    long countByNgaytao(LocalDate date);
}
