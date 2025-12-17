    package com.example.webbanhang.Service;

    import org.springframework.stereotype.Service;
    import com.example.webbanhang.Mapper.AccountMapper;
    import com.example.webbanhang.Model.Account;
    import com.example.webbanhang.Model.Staff;
    import com.example.webbanhang.Repository.AccountRepository;
    import com.example.webbanhang.Repository.StaffRepository;
    import lombok.RequiredArgsConstructor;
    import com.example.webbanhang.Dto.AccountDto;
    import com.example.webbanhang.Dto.ProfileDto;

    import java.time.LocalDate;
    import java.util.List;

    @Service
    @RequiredArgsConstructor
    public class AccountServiceImpl implements AccountService {

        private final AccountRepository accountRepository;
        private final AccountMapper accountMapper;
        private final StaffRepository StaffRepository;

        public List<AccountDto> getAllAccounts() {
            return accountRepository.findAll()
                    .stream()
                    .map(accountMapper::toDto)
                    .toList();
        }

        @Override
        public AccountDto getAccountbyId(Long id) {
            return accountRepository.findById(id)
                    .map(accountMapper::toDto)
                    .orElse(null);
        }

        @Override
        public AccountDto saveAccount(AccountDto dto) {
            Account entity = accountMapper.toEntity(dto);
            Account savedEntity = accountRepository.save(entity);
            return accountMapper.toDto(savedEntity);
        }

        @Override
        public void deleteAccount(Long id) {
            accountRepository.deleteById(id);
        }

        @Override
        public AccountDto login(String tendangnhap, String matkhau) {
            Account acc = accountRepository.findByTendangnhap(tendangnhap);
            if (acc == null) return null; 
            if (!acc.getMatkhau().equals(matkhau)) return null;
            return accountMapper.toDto(acc);
        }

        @Override
        public boolean register(AccountDto dto) {
            if (accountRepository.existsByTendangnhap(dto.getTendangnhap())) {
                return false;
            }
            Account acc = accountMapper.toEntity(dto);
            acc.setNgaytao(LocalDate.now());
            if (acc.getTrangthai() == null) {
                acc.setTrangthai(1);
            }
            if (acc.getVaitro() == null) {
                acc.setVaitro("user");
            }
            accountRepository.save(acc);
            return true;
        }

        @Override
        public boolean changePassword(Long id, String oldPass, String newPass) {
            Account acc = accountRepository.findById(id).orElse(null);
            if (acc == null) return false;

            if (!oldPass.equals(acc.getMatkhau())) { 
                return false;
            }

            acc.setMatkhau(newPass);
            accountRepository.save(acc);
            return true;
        }

        // ⭐ CẬP NHẬT PROFILE — tự tạo staff nếu chưa có
        @Override
        public boolean updateProfile(Long id, ProfileDto dto) {
            Account acc = accountRepository.findById(id).orElse(null);
            if (acc == null) return false;

            Staff staff = StaffRepository.findByIdtaikhoan(id);
            if (staff == null) {
                staff = new Staff();
                staff.setIdtaikhoan(id);   // lần đầu tạo staff cho tài khoản cũ
            }

            // --- Cập nhật bảng account ---
            if (dto.getHoten() != null)  acc.setHoten(dto.getHoten());
            if (dto.getEmail() != null)  acc.setEmail(dto.getEmail());
            accountRepository.save(acc);

            // --- Cập nhật bảng staff ---
            if (dto.getHoten() != null)       staff.setHoten(dto.getHoten());
            if (dto.getGioitinh() != null)    staff.setGioitinh(dto.getGioitinh());

            if (dto.getNgaysinh() != null && !dto.getNgaysinh().isEmpty()) {
                staff.setNgaysinh(LocalDate.parse(dto.getNgaysinh()));   // yyyy-MM-dd
            }

            if (dto.getSodienthoai() != null) staff.setSodienthoai(dto.getSodienthoai());
            if (dto.getEmail() != null)       staff.setEmail(dto.getEmail());
            if (dto.getCccd() != null)        staff.setCccd(dto.getCccd());

            StaffRepository.save(staff);
            return true;
        }
        @Override
        public ProfileDto getProfile(Long id) {
            Account acc = accountRepository.findById(id).orElse(null);
            if (acc == null) return null;

            Staff staff = StaffRepository.findByIdtaikhoan(id);

            ProfileDto dto = new ProfileDto();
            dto.setHoten(acc.getHoten());
            dto.setEmail(acc.getEmail());
            dto.setTendangnhap(acc.getTendangnhap());
            dto.setVaitro(acc.getVaitro());

            if (staff != null) {
                dto.setGioitinh(staff.getGioitinh());
                dto.setNgaysinh(
                        staff.getNgaysinh() != null
                                ? staff.getNgaysinh().toString()  
                                : null
                );
                dto.setSodienthoai(staff.getSodienthoai());
                dto.setCccd(staff.getCccd());
            }

            return dto;
        }

    }
