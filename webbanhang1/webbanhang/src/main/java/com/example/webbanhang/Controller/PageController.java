package com.example.webbanhang.Controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String homePage() {
        return "login";
    }

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @GetMapping("/staff-products")
    public String staffProductsPage() {
        return "staff-products"; 
    }
    @GetMapping("/admin")
    public String adminPage() {
        return "admin"; 
    }
    @GetMapping("/staff-home")
    public String staffHomePage() {
        return "staff-home"; 
    }

    @GetMapping("/adminproducts")
    public String adminProductsPage(){
        return "adminproducts";
    } 
    @GetMapping("/change-password")
    public String changePasswordPage() {
        return "change-password";
    }
    @GetMapping("/edit-profile")
    public String editProfilePage() {
        return "edit-profile";
    }
    @GetMapping("/profile")
    public String profile(){
        return "profile";
    }
    @GetMapping("/admin-customer-manager")
    public String adminCustomerManagerPage() {
        return "admin-customer-manager";
    }
    @GetMapping("/staff-customer")
    public String staffCustomerPage() {
        return "staff-customer";
    }
    @GetMapping("/admin-staff-manager")
    public String adminStaffManagerPage() {
        return "admin-staff-manager";
    }
    @GetMapping("/admin-promotion-manager")
    public String adminPromotionManager(){
        return "admin-promotion-manager";
    }
    @GetMapping("/admin-categories")
        public String adminCategories(){
        return "admin-categories";
    }
    @GetMapping("/admin-invoice-manager")
    public String adminInvoice(){
        return "admin-invoice-manager";
    }
    @GetMapping("/staff-categories")
        public String staffCategories(){
        return "staff-categories";
    }
    @GetMapping("/staff-invoice")
    public String staffInvoice(){
        return "staff-invoice";
    }
}
