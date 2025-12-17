package com.example.webbanhang.Controller;

import com.example.webbanhang.Dto.StaffRequestDto;
import com.example.webbanhang.Dto.StaffResponseDto;
import com.example.webbanhang.Service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin-staff-manager")
@RequiredArgsConstructor
public class AdminStaffManagerController {

    private final StaffService staffService;

    @GetMapping
    public List<StaffResponseDto> getAll() {
        return staffService.getAll();
    }

    @GetMapping("/{id}")
    public StaffResponseDto getById(@PathVariable Long id) {
        return staffService.getById(id);
    }

    @PostMapping
    public StaffResponseDto create(@RequestBody StaffRequestDto dto) {
        return staffService.save(dto);
    }

    @PutMapping("/{id}")
    public StaffResponseDto update(@PathVariable Long id,
                                   @RequestBody StaffRequestDto dto) {
        return staffService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        staffService.delete(id);
    }
}
