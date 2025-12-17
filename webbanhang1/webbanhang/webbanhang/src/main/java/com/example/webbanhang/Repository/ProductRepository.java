package com.example.webbanhang.Repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.webbanhang.Model.Product;
public interface ProductRepository extends JpaRepository<Product, Long> {
    long countByTrangthai(Integer trangthai); 
    long countByIdkhuyenmai(Long idkhuyenmai);
    long countByIddanhmuc(Integer iddanhmuc);
    List<Product> findByIdkhuyenmai(Long idkhuyenmai);
    List<Product> findByTrangthai(Integer trangthai);
    List<Product> findByIddanhmucIn(List<Integer> iddanhmuc);
    boolean existsByTensanphamIgnoreCase(String tensanpham);
    boolean existsByTensanphamIgnoreCaseAndIdsanphamNot(String tensanpham, Long idsanpham);
}
