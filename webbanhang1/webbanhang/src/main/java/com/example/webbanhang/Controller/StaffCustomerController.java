package com.example.webbanhang.Controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.webbanhang.Dto.CustomerRequestDto;
import com.example.webbanhang.Dto.CustomerResponseDto;
import com.example.webbanhang.Service.CustomerService;

@RestController
@RequestMapping("/api/staff-customer-manager")
public class StaffCustomerController {
    private final CustomerService customerService;

    public StaffCustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }
    @GetMapping
    public List<CustomerResponseDto> getAll() {
        return customerService.getAll();
    }

    @GetMapping("/{id}")
    public CustomerResponseDto getById(@PathVariable Long id) {
        return customerService.getById(id);
    }

    @PostMapping
    public CustomerResponseDto create(@RequestBody CustomerRequestDto dto) {
        return customerService.create(dto);
    }

    @PutMapping("/{id}")
    public CustomerResponseDto update(@PathVariable Long id,
        @RequestBody CustomerRequestDto dto) {
        return customerService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        customerService.delete(id);
    }

}
