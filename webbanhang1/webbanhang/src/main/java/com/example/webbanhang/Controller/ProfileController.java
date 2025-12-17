package com.example.webbanhang.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

import java.util.Map;

import com.example.webbanhang.Dto.ProfileDto;
import com.example.webbanhang.Service.AccountService;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AccountService accountService;
    @GetMapping("/{id}")
    public ResponseEntity<?> getProfile(@PathVariable Long id) {
        ProfileDto dto = accountService.getProfile(id);

        if (dto == null) {
            return ResponseEntity
                    .status(404)
                    .body(Map.of("message", "Không tìm thấy người dùng!"));
        }

        return ResponseEntity.ok(dto);
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileDto dto) {

        boolean ok = accountService.updateProfile(id, dto);

        if (!ok) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Cập nhật hồ sơ thất bại!"));
        }

        return ResponseEntity.ok(
                Map.of("message", "Cập nhật thành công!")
        );
    }
}
