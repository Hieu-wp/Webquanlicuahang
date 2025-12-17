package com.example.webbanhang.Service;

import com.example.webbanhang.Dto.StaffRequestDto;
import com.example.webbanhang.Dto.StaffResponseDto;
import com.example.webbanhang.Model.Account;
import com.example.webbanhang.Model.Staff;
import com.example.webbanhang.Repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.webbanhang.Repository.AccountRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final AccountRepository accountRepository;

    private StaffResponseDto toDto(Staff s) {
        StaffResponseDto dto = new StaffResponseDto();
        dto.setIdnhanvien(s.getIdnhanvien());
        dto.setHoten(s.getHoten());
        dto.setGioitinh(s.getGioitinh());
        dto.setNgaysinh(s.getNgaysinh());
        dto.setSodienthoai(s.getSodienthoai());
        dto.setEmail(s.getEmail());
        dto.setIdtaikhoan(s.getIdtaikhoan());
        dto.setChucvu(s.getChucvu());
        dto.setNgayvaolam(s.getNgayvaolam());
        dto.setTrangthai(s.getTrangthai());
        dto.setCccd(s.getCccd());
        return dto;
    }

    private void applyDtoToEntity(StaffRequestDto dto, Staff entity) {
        entity.setHoten(dto.getHoten());
        entity.setGioitinh(dto.getGioitinh());
        entity.setNgaysinh(dto.getNgaysinh());
        entity.setSodienthoai(dto.getSodienthoai());
        entity.setEmail(dto.getEmail());
        entity.setChucvu(dto.getChucvu());
        entity.setNgayvaolam(dto.getNgayvaolam());
        entity.setTrangthai(dto.getTrangthai());
        entity.setCccd(dto.getCccd());
    }

    @Override
    public List<StaffResponseDto> getAll() {
        return staffRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public StaffResponseDto getById(Long id) {
        Staff s = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));
        return toDto(s);
    }


    @Override
    public StaffResponseDto save(StaffRequestDto dto) {
        // ====== KIỂM TRA TUỔI NHÂN VIÊN ======
        if (dto.getNgaysinh() != null) {
            LocalDate today = LocalDate.now();
            int age = today.getYear() - dto.getNgaysinh().getYear();
            // nếu chưa tới ngày sinh trong năm thì trừ thêm 1
            if (today.getDayOfYear() < dto.getNgaysinh().getDayOfYear()) {
                age--;
            }
            if (age < 18) {
                throw new RuntimeException("Nhân viên phải đủ 18 tuổi trở lên!");
            }
        } else {
            throw new RuntimeException("Ngày sinh không được để trống!");
        }

        Account acc = new Account();

        String tendangnhap = dto.getTendangnhap();
        if (tendangnhap == null || tendangnhap.isBlank()) {
            if (dto.getEmail() != null && dto.getEmail().contains("@")) {
                tendangnhap = dto.getEmail().split("@")[0];
            } else {
                tendangnhap = "nv" + System.currentTimeMillis();
            }
        }

        String matkhau = dto.getMatkhau();
        if (matkhau == null || matkhau.isBlank()) {
            matkhau = "12345678";
        }

        acc.setTendangnhap(tendangnhap);
        acc.setMatkhau(matkhau);
        acc.setHoten(dto.getHoten());
        acc.setEmail(dto.getEmail());
        acc.setVaitro("employee");
        acc.setTrangthai(1);
        acc.setNgaytao(LocalDate.now());

        if (accountRepository.existsByTendangnhap(tendangnhap)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        if (dto.getEmail() != null && accountRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email tài khoản đã tồn tại!");
        }
        if (dto.getCccd() != null && staffRepository.existsByCccd(dto.getCccd())) {
            throw new RuntimeException("CCCD đã tồn tại!");
        }
        if (dto.getSodienthoai() != null && staffRepository.existsBySodienthoai(dto.getSodienthoai())) {
            throw new RuntimeException("Số điện thoại đã tồn tại!");
        }

        Account savedAcc = accountRepository.save(acc);

        Staff s = new Staff();
        applyDtoToEntity(dto, s);

        s.setTrangthai(dto.getTrangthai() != null ? dto.getTrangthai() : 1);
        s.setIdtaikhoan(savedAcc.getIdtaikhoan());

        Staff savedStaff = staffRepository.save(s);
        return toDto(savedStaff);
    }

    @Override
    public StaffResponseDto update(Long id, StaffRequestDto dto) {
        // ====== KIỂM TRA TUỔI NHÂN VIÊN ======
        if (dto.getNgaysinh() != null) {
            LocalDate today = LocalDate.now();
            int age = today.getYear() - dto.getNgaysinh().getYear();
            // nếu chưa tới ngày sinh trong năm thì trừ thêm 1
            if (today.getDayOfYear() < dto.getNgaysinh().getDayOfYear()) {
                age--;
            }
            if (age < 18) {
                throw new RuntimeException("Nhân viên phải đủ 18 tuổi trở lên!");
            }
        } else {
            throw new RuntimeException("Ngày sinh không được để trống!");
        }
        //==== code cua ong====//
        Staff s = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân viên!"));

        if (dto.getIdtaikhoan() != null &&
            !dto.getIdtaikhoan().equals(s.getIdtaikhoan()) &&
            staffRepository.existsByIdtaikhoan(dto.getIdtaikhoan())) {
            throw new RuntimeException("Tài khoản này đã gắn với một nhân viên khác!");
        }

        applyDtoToEntity(dto, s);
        Staff saved = staffRepository.save(s);

        return toDto(saved);
    }

    @Override
    public void delete(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Nhân viên không tồn tại!"));

        staffRepository.delete(staff);

        if (staff.getIdtaikhoan() != null) {
            accountRepository.deleteById(staff.getIdtaikhoan());
        }
    }
}
