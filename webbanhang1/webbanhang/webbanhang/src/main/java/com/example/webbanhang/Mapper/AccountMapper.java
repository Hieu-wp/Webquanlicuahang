package com.example.webbanhang.Mapper;
import org.springframework.stereotype.Component;
import com.example.webbanhang.Dto.AccountDto;
import com.example.webbanhang.Model.Account;

@Component
public class AccountMapper {

    public AccountDto toDto(Account a) {
        AccountDto dto = new AccountDto();
        dto.setId(a.getId());
        dto.setTendangnhap(a.getTendangnhap());
        dto.setMatkhau(a.getMatkhau());
        dto.setVaitro(a.getVaitro());
        dto.setTrangthai(a.getTrangthai());
        dto.setEmail(a.getEmail());
        dto.setHoten(a.getHoten());
        dto.setNgaytao(a.getNgaytao());
        return dto;
    }

    public Account toEntity(AccountDto dto) {
        Account a = new Account();
        a.setTendangnhap(dto.getTendangnhap());
        a.setMatkhau(dto.getMatkhau());
        a.setHoten(dto.getHoten());
        a.setEmail(dto.getEmail());
        a.setVaitro(dto.getVaitro());
        a.setTrangthai(dto.getTrangthai());
        a.setNgaytao(dto.getNgaytao());
        return a;
    }
}
