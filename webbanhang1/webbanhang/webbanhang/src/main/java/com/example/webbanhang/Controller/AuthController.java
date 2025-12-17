package com.example.webbanhang.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.webbanhang.Dto.AccountDto;

import com.example.webbanhang.Service.AccountService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AccountService accountService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AccountDto dto, HttpSession session) {

        AccountDto acc = accountService.login(dto.getTendangnhap(), dto.getMatkhau());
        if (acc == null) {
            return ResponseEntity.status(401).body(new Message("Sai tên đăng nhập hoặc mật khẩu"));
        }
        
        session.setAttribute("user", acc);
        return ResponseEntity.ok(acc);
    }

    @GetMapping("/check")
    public ResponseEntity<?> check(HttpSession session) {
        AccountDto user = (AccountDto) session.getAttribute("user");
        return ResponseEntity.ok(
            user == null ? new Check(false, null) : new Check(true, user.getTendangnhap())
        );
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new Message("Đăng xuất thành công"));
    }

    record Message(String message) {}
    record Check(boolean loggedIn, String username) {}
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AccountDto dto) {
        boolean ok = accountService.register(dto);

        if (!ok) {
            return ResponseEntity.status(400).body(new Message("Tên đăng nhập đã tồn tại!"));
        }

        return ResponseEntity.ok(new Message("Đăng ký thành công!"));
    }


}


















