package com.example.webbanhang.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.*;

import com.example.webbanhang.Repository.InvoiceRepository;
import com.example.webbanhang.Repository.ProductRepository;
import com.example.webbanhang.Repository.CustomerRepository;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final InvoiceRepository invoiceRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
@Override
public Map<String, Object> getStats() {
    Map<String, Object> stats = new HashMap<>();

    stats.put("todayRevenue", invoiceRepository.sumRevenueByDay(LocalDate.now()));
    stats.put("newOrders", invoiceRepository.countByNgaygiaodich(LocalDate.now()));
    stats.put("newCustomers", customerRepository.countByNgaytao(LocalDate.now()));
    stats.put("totalProducts", productRepository.countByTrangthai(1));

    return stats;
}

    @Override
    public Map<String, Object> getChart(String type) {
        Map<String, Object> data = new HashMap<>();

        switch (type) {
            case "day":
                data.put("labels", List.of("T2","T3","T4","T5","T6","T7","CN"));
                data.put("values", invoiceRepository.revenueByDay());
                break;
            case "week":
                data.put("labels", List.of("Tuần 1","Tuần 2","Tuần 3","Tuần 4"));
                data.put("values", invoiceRepository.revenueByWeek());
                break;
            case "month":
                data.put("labels", List.of(
                        "T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"));
                data.put("values", invoiceRepository.revenueByMonth());
                break;
        }
        return data;
    }
    
}
