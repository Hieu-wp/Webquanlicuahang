package com.example.webbanhang.Controller;

import com.example.webbanhang.Dto.ProductRequestDto;
import com.example.webbanhang.Service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/staff-products")
public class StaffProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductRequestDto>> getAll() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductRequestDto> getById(@PathVariable Long id) {
        ProductRequestDto dto = productService.getProductbyId(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<ProductRequestDto> create(@RequestBody ProductRequestDto dto) {
        dto.setIdsanpham(null);
        ProductRequestDto saved = productService.saveProduct(dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductRequestDto> update(
            @PathVariable Long id,
            @RequestBody ProductRequestDto dto
    ) {
        dto.setIdsanpham(id);
        ProductRequestDto saved = productService.saveProduct(dto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<ProductRequestDto> toggle(@PathVariable Long id) {
        ProductRequestDto dto = productService.toggleStatus(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }
}
