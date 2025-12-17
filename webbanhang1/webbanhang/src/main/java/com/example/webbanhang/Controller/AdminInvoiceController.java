    package com.example.webbanhang.Controller;

    import com.example.webbanhang.Dto.InvoiceRequestDto;
    import com.example.webbanhang.Dto.InvoiceResponseDto;
    import com.example.webbanhang.Service.InvoiceService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.Map;

    @RestController
    @RequestMapping("/api/admin-invoice-manager")
    @RequiredArgsConstructor
    public class AdminInvoiceController {

        private final InvoiceService invoiceService;

        @GetMapping
        public ResponseEntity<List<InvoiceResponseDto>> getAll() {
            return ResponseEntity.ok(invoiceService.getAll());
        }

        @GetMapping("/{id}")
        public ResponseEntity<?> getById(@PathVariable Long id) {
            try {
                InvoiceResponseDto dto = invoiceService.getById(id);
                return ResponseEntity.ok(dto);
            } catch (RuntimeException e) {
                return ResponseEntity.status(404).body(Map.of(
                        "message", e.getMessage()
                ));
            }
        }
        @GetMapping("/customer/{customerId}")
        public ResponseEntity<List<InvoiceResponseDto>> getByCustomer(
                @PathVariable Long customerId) {
            List<InvoiceResponseDto> list = invoiceService.getByCustomer(customerId);
            return ResponseEntity.ok(list);
        }

        @PostMapping
        public ResponseEntity<?> create(@RequestBody InvoiceRequestDto dto) {
            try {
                InvoiceResponseDto created = invoiceService.create(dto);
                return ResponseEntity.ok(created);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", e.getMessage()
                ));
            }
        }

        @PutMapping("/{id}")
        public ResponseEntity<?> update(@PathVariable Long id,
                                        @RequestBody InvoiceRequestDto dto) {
            try {
                InvoiceResponseDto updated = invoiceService.update(id, dto);
                return ResponseEntity.ok(updated);
            } catch (RuntimeException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", e.getMessage()
                ));
            }
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<?> delete(@PathVariable Long id) {
            try {
                invoiceService.delete(id);
                return ResponseEntity.ok(Map.of(
                        "message", "Xóa hóa đơn thành công"
                ));
            } catch (RuntimeException e) {
                return ResponseEntity.status(404).body(Map.of(
                        "message", e.getMessage()
                ));
            }
        }
    }
