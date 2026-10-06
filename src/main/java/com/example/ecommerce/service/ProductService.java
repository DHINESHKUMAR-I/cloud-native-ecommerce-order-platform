package com.example.ecommerce.service;

import com.example.ecommerce.dto.product.CreateProductRequest;
import com.example.ecommerce.dto.product.ProductResponse;
import com.example.ecommerce.dto.product.UpdateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProductService {

    ProductResponse createProduct(CreateProductRequest request);

    Page<ProductResponse> getAllProducts(Pageable pageable);

    ProductResponse getProductById(Long id);

    ProductResponse updateProduct(Long id, UpdateProductRequest request);

    void deleteProduct(Long id);

    List<ProductResponse> searchProductsByName(String name);

    Page<ProductResponse> searchProductsByName(String name, Pageable pageable);

    List<ProductResponse> getProductsByCategory(String category);

    Page<ProductResponse> getProductsByCategory(String category, Pageable pageable);

    List<ProductResponse> getAvailableProducts();

    Page<ProductResponse> getAvailableProducts(Pageable pageable);
}
