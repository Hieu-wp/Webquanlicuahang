    package com.example.webbanhang.Service;

    import com.example.webbanhang.Dto.AccountDto;
    import java.util.List;
    import com.example.webbanhang.Dto.ProfileDto;
    public interface AccountService {

        // Lấy toàn bộ tài khoản trong hệ thống (trả về dạng DTO)
        List<AccountDto> getAllAccounts();

        // Lấy thông tin tài khoản theo ID (trả về null nếu không tồn tại)
        AccountDto getAccountbyId(Long id);

        // Thêm mới hoặc cập nhật tài khoản (tùy thuộc việc DTO có ID hay không)
        AccountDto saveAccount(AccountDto dto);

        // Xóa tài khoản theo ID
        void deleteAccount(Long id);
        
        AccountDto login(String tendangnhap, String matkhau);
        boolean register(AccountDto dto);
        boolean changePassword(Long id, String oldPass, String newPass);
        boolean updateProfile(Long id, ProfileDto dto);
        ProfileDto getProfile(Long id);
    }
