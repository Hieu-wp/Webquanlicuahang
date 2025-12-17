package com.example.webbanhang.Controller;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import com.example.webbanhang.Dto.AccountDto;
import com.example.webbanhang.Dto.ChangePasswordDto;
import com.example.webbanhang.Service.AccountService;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpSession;
@RequiredArgsConstructor
@RestController
    public class ChangePasswordController {
        private final AccountService accountService;
        @PutMapping("/api/change-password")
        public ResponseEntity<?> changePassword(
                @RequestBody ChangePasswordDto dto,
                HttpSession session) {

            Object obj = session.getAttribute("user");
            if (obj == null) {
                return ResponseEntity.status(401).body(Map.of("message", "Chưa đăng nhập"));
            }

            AccountDto user = (AccountDto) obj;

            boolean updated = accountService.changePassword(user.getId(), dto.getOldPass(), dto.getNewPass());
            if (!updated) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu cũ không đúng"));
            }

            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        }
    }
