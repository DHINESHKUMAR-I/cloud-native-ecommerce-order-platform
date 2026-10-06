package com.example.ecommerce.service;

import com.example.ecommerce.dto.product.CreateProductRequest;
import com.example.ecommerce.dto.product.ProductResponse;
import com.example.ecommerce.dto.product.UpdateProductRequest;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    private Product sampleProduct;
    private CreateProductRequest createProductRequest;

    @BeforeEach
    void setUp() {
        sampleProduct = Product.builder()
                .id(1L)
                .name("Mechanical Keyboard")
                .description("RGB Tenkeyless Mechanical Keyboard")
                .price(new BigDecimal("89.99"))
                .stock(50)
                .category("Electronics")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createProductRequest = CreateProductRequest.builder()
                .name("Mechanical Keyboard")
                .description("RGB Tenkeyless Mechanical Keyboard")
                .price(new BigDecimal("89.99"))
                .stock(50)
                .category("Electronics")
                .build();
    }

    @Test
    @DisplayName("Should create product successfully")
    void createProduct_Success() {
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(createProductRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Mechanical Keyboard");
        assertThat(response.getPrice()).isEqualTo(new BigDecimal("89.99"));
        assertThat(response.getStock()).isEqualTo(50);
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should retrieve product by ID successfully")
    void getProductById_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));

        ProductResponse response = productService.getProductById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Mechanical Keyboard");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void getProductById_NotFound_ThrowsException() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getProductById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product with ID 99 not found");
    }

    @Test
    @DisplayName("Should update product successfully")
    void updateProduct_Success() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                .name("Pro Mechanical Keyboard")
                .description("Updated description")
                .price(new BigDecimal("99.99"))
                .stock(45)
                .category("Electronics")
                .build();

        ProductResponse response = productService.updateProduct(1L, updateRequest);

        assertThat(response).isNotNull();
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("Should delete product successfully when ID exists")
    void deleteProduct_Success() {
        when(productRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productRepository).deleteById(1L);

        productService.deleteProduct(1L);

        verify(productRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should search products by name successfully")
    void searchProductsByName_Success() {
        when(productRepository.findByNameContainingIgnoreCase("Keyboard"))
                .thenReturn(List.of(sampleProduct));

        List<ProductResponse> responses = productService.searchProductsByName("Keyboard");

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getName()).isEqualTo("Mechanical Keyboard");
    }

    @Test
    @DisplayName("Should return available products with stock > 0")
    void getAvailableProducts_Success() {
        when(productRepository.findByStockGreaterThan(0))
                .thenReturn(List.of(sampleProduct));

        List<ProductResponse> responses = productService.getAvailableProducts();

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getStock()).isPositive();
    }
}
