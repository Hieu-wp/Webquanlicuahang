package com.example.webbanhang.Repository;

import com.example.webbanhang.Model.InvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceDetailRepository extends JpaRepository<InvoiceDetail, Long> {

    List<InvoiceDetail> findByIdhoadon(Long idhoadon);

    @Modifying
    @Query("DELETE FROM InvoiceDetail d WHERE d.idhoadon = :idhoadon")
    void deleteByIdhoadon(Long idhoadon);
}
