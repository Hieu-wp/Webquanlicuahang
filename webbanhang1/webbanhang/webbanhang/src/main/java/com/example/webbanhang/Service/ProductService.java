package com.example.webbanhang.Service;
import com.example.webbanhang.Dto.ProductRequestDto;
import java.util.List;

/*
 * ProductService là tầng Service (business logic) dùng để định nghĩa
 * các chức năng xử lý nghiệp vụ liên quan đến sản phẩm trong hệ thống bán hàng.
 *
 * Interface này đóng vai trò "giao kèo" quy định lớp triển khai (ProductServiceImpl)
 * phải thực hiện đầy đủ các chức năng dưới đây, giúp Controller chỉ làm nhiệm vụ điều hướng
 * mà không phụ thuộc trực tiếp vào Repository.
 *
 * Lợi ích:
 *  - Dễ bảo trì và mở rộng tính năng
 *  - Có thể thay đổi implement mà không cần sửa Controller
 *  - Tuân thủ nguyên tắc SOLID (Dependency Inversion)
 */
public interface ProductService {

    // Lấy danh sách tất cả sản phẩm trong hệ thống (trả về dạng DTO)
    List<ProductRequestDto> getAllProducts();

    // Lấy chi tiết 1 sản phẩm theo ID (trả về null nếu không tìm thấy)
    ProductRequestDto getProductbyId(Long id);

    // Thêm mới hoặc cập nhật sản phẩm (save = insert/update tùy thuộc vào ID)
    ProductRequestDto saveProduct(ProductRequestDto dto);

    // Xóa sản phẩm theo ID
    ProductRequestDto toggleStatus(Long id);
    long getProductsCount();
}
