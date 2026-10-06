package com.example.ecommerce.service.impl;

import com.example.ecommerce.dto.product.CreateProductRequest;
import com.example.ecommerce.dto.product.ProductResponse;
import com.example.ecommerce.dto.product.UpdateProductRequest;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductServiceImpl.class);

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Creating new product with name: '{}', category: '{}'", request.getName(), request.getCategory());

        Product product = Product.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .stock(request.getStock())
                .category(request.getCategory().trim())
                .build();

        Product savedProduct = productRepository.save(product);
        log.info("Successfully created product with ID: {}", savedProduct.getId());
        return mapToResponse(savedProduct);
    }

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        log.debug("Fetching products page: {}", pageable);
        return productRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        log.debug("Fetching product with ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Product with ID {} not found", id);
                    return new ResourceNotFoundException("Product with ID " + id + " not found");
                });
        return mapToResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        log.info("Updating product with ID: {}", id);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with ID " + id + " not found"));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        product.setCategory(request.getCategory().trim());

        Product updatedProduct = productRepository.save(product);
        log.info("Successfully updated product with ID: {}", updatedProduct.getId());
        return mapToResponse(updatedProduct);
    }

    @Override
    @Transactional
    public void deleteProduct(Long id) {
        log.info("Deleting product with ID: {}", id);
        if (!productRepository.existsById(id)) {
            log.warn("Product delete failed: ID {} not found", id);
            throw new ResourceNotFoundException("Product with ID " + id + " not found");
        }
        productRepository.deleteById(id);
        log.info("Successfully deleted product with ID: {}", id);
    }

    @Override
    public List<ProductResponse> searchProductsByName(String name) {
        log.debug("Searching products containing name: '{}'", name);
        return productRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<ProductResponse> searchProductsByName(String name, Pageable pageable) {
        log.debug("Searching products page containing name: '{}', pageable: {}", name, pageable);
        return productRepository.findByNameContainingIgnoreCase(name, pageable).map(this::mapToResponse);
    }

    @Override
    public List<ProductResponse> getProductsByCategory(String category) {
        log.debug("Fetching products in category: '{}'", category);
        return productRepository.findByCategoryIgnoreCase(category).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(String category, Pageable pageable) {
        log.debug("Fetching products page in category: '{}', pageable: {}", category, pageable);
        return productRepository.findByCategoryIgnoreCase(category, pageable).map(this::mapToResponse);
    }

    @Override
    public List<ProductResponse> getAvailableProducts() {
        log.debug("Fetching all available products (stock > 0)");
        return productRepository.findByStockGreaterThan(0).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<ProductResponse> getAvailableProducts(Pageable pageable) {
        log.debug("Fetching page of available products (stock > 0), pageable: {}", pageable);
        return productRepository.findByStockGreaterThan(0, pageable).map(this::mapToResponse);
    }

    private ProductResponse mapToResponse(Product product) {
        return ProductResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(product.getCategory())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
