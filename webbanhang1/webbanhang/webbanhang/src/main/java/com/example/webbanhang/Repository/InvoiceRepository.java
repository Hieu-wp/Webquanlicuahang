package com.example.webbanhang.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.example.webbanhang.Model.Invoice;
import java.time.LocalDate;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    long countByNgaygiaodich(LocalDate ngaygiaodich);
    @Query("SELECT SUM(i.tongthanhtoan) FROM Invoice i WHERE i.ngaygiaodich = :date")
    Double sumRevenueByDay(LocalDate date);
    @Query("SELECT SUM(i.tongthanhtoan) FROM Invoice i GROUP BY FUNCTION('DAYOFWEEK', i.ngaygiaodich)")
    List<Double> revenueByDay();
    @Query("SELECT SUM(i.tongthanhtoan) FROM Invoice i GROUP BY FUNCTION('WEEK', i.ngaygiaodich)")
    List<Double> revenueByWeek();
    @Query("SELECT SUM(i.tongthanhtoan) FROM Invoice i GROUP BY FUNCTION('MONTH', i.ngaygiaodich)")
    List<Double> revenueByMonth();
    List<Invoice> findByIdkhachhangOrderByNgaygiaodichDesc(Long idkhachhang);
    
}
