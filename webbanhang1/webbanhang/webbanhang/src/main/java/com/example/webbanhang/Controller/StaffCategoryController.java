package com.example.webbanhang.Controller;

import com.example.webbanhang.Dto.CategoryRequestDto;
import com.example.webbanhang.Dto.CategoryResponseDto;
import com.example.webbanhang.Service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff-categories")
@RequiredArgsConstructor
public class StaffCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponseDto>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Integer id) {
        try {
            CategoryResponseDto dto = categoryService.getById(id);
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CategoryRequestDto dto) {
        try {
            CategoryResponseDto saved = categoryService.create(dto);
            return ResponseEntity.ok(saved);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id,
                                    @RequestBody CategoryRequestDto dto) {
        try {
            CategoryResponseDto updated = categoryService.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable Integer id) {
        try {
            categoryService.toggleStatus(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "message", e.getMessage()
            ));
        }
    }
}
