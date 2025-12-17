package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.CustomerRequestDto;
import com.example.webbanhang.Dto.CustomerResponseDto;
import com.example.webbanhang.Model.Customers;
import com.example.webbanhang.Repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private CustomerResponseDto toDto(Customers c) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setIdkhachhang(c.getIdkhachhang());
        dto.setHoten(c.getHoten());
        dto.setNgaysinh(c.getNgaysinh());
        dto.setSodienthoai(c.getSodienthoai());
        dto.setEmail(c.getEmail());
        dto.setDiachi(c.getDiachi());
        dto.setGioitinh(c.getGioitinh());
        dto.setNgaytao(c.getNgaytao());
        return dto;
    }

    private void applyDtoToEntity(CustomerRequestDto dto, Customers entity) {
        entity.setHoten(dto.getHoten());
        entity.setNgaysinh(dto.getNgaysinh());
        entity.setSodienthoai(dto.getSodienthoai());
        entity.setDiachi(dto.getDiachi());
        entity.setGioitinh(dto.getGioitinh());
        entity.setEmail(dto.getEmail());
    }

    // ==== IMPLEMENT INTERFACE ====

    @Override
    public List<CustomerResponseDto> getAll() {
        return customerRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDto getById(Long id) {
        Customers c = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));
        return toDto(c);
    }

    @Override
    public List<CustomerResponseDto> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAll();
        }
        String kw = keyword.trim();
        return customerRepository
                .findByHotenContainingIgnoreCaseOrEmailContainingIgnoreCaseOrSodienthoaiContainingIgnoreCase(kw, kw, kw)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDto create(CustomerRequestDto dto) {
        // ====== KIỂM TRA ngày ======
        if (dto.getNgaysinh() == null) {
            throw new RuntimeException("Ngày sinh không được để trống!");
        }
        LocalDate today = LocalDate.now();
        if (dto.getNgaysinh().isAfter(today)) {
            throw new RuntimeException("Dữ liệu ngày sinh không hợp lệ!");
        }
        //=====Kiểm tra ngày=======

        if (dto.getEmail() != null &&
            customerRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        // ❗ Chống trùng số điện thoại
        if (dto.getSodienthoai() != null &&
            customerRepository.existsBySodienthoai(dto.getSodienthoai())) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        Customers c = new Customers();
        applyDtoToEntity(dto, c);

        if (c.getNgaytao() == null) {
            c.setNgaytao(LocalDate.now());
        }

        return toDto(customerRepository.save(c));
    }

    @Override
    public CustomerResponseDto update(Long id, CustomerRequestDto dto) {
        Customers c = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng!"));

        // ====== KIỂM TRA ngày ======
        if (dto.getNgaysinh() == null) {
            throw new RuntimeException("Ngày sinh không được để trống!");
        }
        LocalDate today = LocalDate.now();
        if (dto.getNgaysinh().isAfter(today)) {
            throw new RuntimeException("Dữ liệu ngày sinh không hợp lệ!");
        }
        //=====Kiểm tra ngày=======

        // Nếu muốn chống trùng khi cập nhật (trừ chính nó) thì làm thêm:
        if (dto.getEmail() != null &&
            customerRepository.existsByEmail(dto.getEmail()) &&
            !dto.getEmail().equals(c.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        if (dto.getSodienthoai() != null &&
            customerRepository.existsBySodienthoai(dto.getSodienthoai()) &&
            !dto.getSodienthoai().equals(c.getSodienthoai())) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        applyDtoToEntity(dto, c);
        Customers saved = customerRepository.save(c);
        return toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Khách hàng không tồn tại!");
        }
        customerRepository.deleteById(id);
    }
}
