package com.example.ecommerce.controller;

import com.example.ecommerce.dto.product.CreateProductRequest;
import com.example.ecommerce.dto.product.ProductResponse;
import com.example.ecommerce.dto.product.UpdateProductRequest;
import com.example.ecommerce.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(productService.getAllProducts(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String name,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(productService.searchProductsByName(name, pageable));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<ProductResponse>> getProductsByCategory(
            @PathVariable String category,
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(productService.getProductsByCategory(category, pageable));
    }

    @GetMapping("/available")
    public ResponseEntity<Page<ProductResponse>> getAvailableProducts(
            @PageableDefault(page = 0, size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(productService.getAvailableProducts(pageable));
    }
}
