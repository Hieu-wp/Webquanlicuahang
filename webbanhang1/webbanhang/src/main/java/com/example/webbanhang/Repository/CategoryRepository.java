package com.example.webbanhang.Repository;

import com.example.webbanhang.Model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Integer> {

    boolean existsByTendanhmucIgnoreCase(String tendanhmuc);

    Optional<Category> findByTendanhmucIgnoreCase(String tendanhmuc);
}
