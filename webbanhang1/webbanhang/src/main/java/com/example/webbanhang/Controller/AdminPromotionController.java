package com.example.webbanhang.Controller;

import com.example.webbanhang.Dto.PromotionRequestDto;
import com.example.webbanhang.Dto.PromotionResponseDto;
import com.example.webbanhang.Service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-promotion-manager")
@RequiredArgsConstructor
public class AdminPromotionController {

    private final PromotionService promotionService;

    @GetMapping
    public ResponseEntity<List<PromotionResponseDto>> getAll() {
        return ResponseEntity.ok(promotionService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            PromotionResponseDto dto = promotionService.getById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ⭐ LẤY DANH SÁCH KHUYẾN MÃI ĐANG HIỂU LỰC CHO COMBOBOX SẢN PHẨM
    @GetMapping("/active")
    public ResponseEntity<List<PromotionResponseDto>> getAllActive() {
        return ResponseEntity.ok(promotionService.getAllActive());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PromotionRequestDto dto) {
        try {
            PromotionResponseDto saved = promotionService.create(dto);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestBody PromotionRequestDto dto) {
        try {
            PromotionResponseDto saved = promotionService.update(id, dto);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            promotionService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Xóa khuyến mãi thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(404)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
