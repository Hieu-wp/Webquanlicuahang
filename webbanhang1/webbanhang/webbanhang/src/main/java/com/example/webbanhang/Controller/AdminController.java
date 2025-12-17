package com.example.webbanhang.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.webbanhang.Service.AdminService;
import jakarta.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/chart")
    public ResponseEntity<?> getChart(@RequestParam String type) {
        return ResponseEntity.ok(adminService.getChart(type));
    }

    @GetMapping("/userinfo")
    public ResponseEntity<?> getUser(HttpSession session) {
        Object user = session.getAttribute("user");
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }
    
}
