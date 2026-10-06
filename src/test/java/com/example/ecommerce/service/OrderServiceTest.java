package com.example.ecommerce.service;

import com.example.ecommerce.dto.order.CreateOrderRequest;
import com.example.ecommerce.dto.order.OrderItemRequest;
import com.example.ecommerce.dto.order.OrderResponse;
import com.example.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.example.ecommerce.entity.*;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.exception.InvalidOrderStatusException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CustomerRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OrderServiceImpl orderService;

    private Customer sampleCustomer;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleCustomer = Customer.builder()
                .id(1L)
                .name("Alice Smith")
                .email("alice@example.com")
                .phone("+1122334455")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        sampleProduct = Product.builder()
                .id(10L)
                .name("Wireless Mouse")
                .description("Ergonomic mouse")
                .price(new BigDecimal("29.99"))
                .stock(10)
                .category("Electronics")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should create order successfully and deduct stock")
    void createOrder_Success() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(1L)
                .items(List.of(
                        OrderItemRequest.builder()
                                .productId(10L)
                                .quantity(2)
                                .build()
                ))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));

        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(100L);
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());
            return order;
        });

        OrderResponse response = orderService.createOrder(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getCustomerId()).isEqualTo(1L);
        assertThat(response.getStatus()).isEqualTo(OrderStatus.PENDING);
        assertThat(response.getTotalAmount()).isEqualTo(new BigDecimal("59.98"));
        assertThat(response.getItems()).hasSize(1);
        assertThat(response.getItems().get(0).getQuantity()).isEqualTo(2);
        assertThat(response.getItems().get(0).getSubtotal()).isEqualTo(new BigDecimal("59.98"));

        // Verify stock was deducted (10 - 2 = 8)
        assertThat(sampleProduct.getStock()).isEqualTo(8);
        verify(productRepository, times(1)).save(sampleProduct);
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when customer not found during order creation")
    void createOrder_CustomerNotFound_ThrowsException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(99L)
                .items(List.of(
                        OrderItemRequest.builder().productId(10L).quantity(1).build()
                ))
                .build();

        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer with ID 99 not found");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product not found during order creation")
    void createOrder_ProductNotFound_ThrowsException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(1L)
                .items(List.of(
                        OrderItemRequest.builder().productId(999L).quantity(1).build()
                ))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));
        when(productRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product with ID 999 not found");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when requested quantity exceeds available stock")
    void createOrder_InsufficientStock_ThrowsException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .customerId(1L)
                .items(List.of(
                        OrderItemRequest.builder().productId(10L).quantity(15).build()
                ))
                .build();

        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));

        assertThatThrownBy(() -> orderService.createOrder(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock for product");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should transition order status from PENDING to CONFIRMED successfully")
    void updateOrderStatus_Success() {
        Order order = Order.builder()
                .id(100L)
                .customer(sampleCustomer)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("29.99"))
                .items(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.CONFIRMED)
                .build();

        OrderResponse response = orderService.updateOrderStatus(100L, request);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Should throw InvalidOrderStatusException when attempting invalid transition DELIVERED -> PENDING")
    void updateOrderStatus_InvalidTransition_ThrowsException() {
        Order order = Order.builder()
                .id(100L)
                .customer(sampleCustomer)
                .status(OrderStatus.DELIVERED)
                .totalAmount(new BigDecimal("29.99"))
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));

        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.PENDING)
                .build();

        assertThatThrownBy(() -> orderService.updateOrderStatus(100L, request))
                .isInstanceOf(InvalidOrderStatusException.class)
                .hasMessageContaining("Cannot transition order ID 100 from DELIVERED to PENDING");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should cancel order and restore product stock")
    void cancelOrder_Success_RestoresStock() {
        OrderItem item = OrderItem.builder()
                .id(50L)
                .product(sampleProduct) // initial stock 10
                .quantity(3)
                .price(sampleProduct.getPrice())
                .subtotal(new BigDecimal("89.97"))
                .build();

        Order order = Order.builder()
                .id(100L)
                .customer(sampleCustomer)
                .status(OrderStatus.PENDING)
                .totalAmount(new BigDecimal("89.97"))
                .items(new ArrayList<>(List.of(item)))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        item.setOrder(order);

        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenReturn(order);

        OrderResponse response = orderService.cancelOrder(100L);

        assertThat(response.getStatus()).isEqualTo(OrderStatus.CANCELLED);
        // Restored stock should be 10 + 3 = 13
        assertThat(sampleProduct.getStock()).isEqualTo(13);
        verify(productRepository, times(1)).save(sampleProduct);
        verify(orderRepository, times(1)).save(order);
    }

    @Test
    @DisplayName("Should throw InvalidOrderStatusException when cancelling an already cancelled order")
    void cancelOrder_AlreadyCancelled_ThrowsException() {
        Order order = Order.builder()
                .id(100L)
                .customer(sampleCustomer)
                .status(OrderStatus.CANCELLED)
                .totalAmount(new BigDecimal("29.99"))
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder(100L))
                .isInstanceOf(InvalidOrderStatusException.class)
                .hasMessageContaining("already cancelled");

        verify(orderRepository, never()).save(any(Order.class));
    }

    @Test
    @DisplayName("Should throw InvalidOrderStatusException when cancelling a shipped order")
    void cancelOrder_ShippedOrder_ThrowsException() {
        Order order = Order.builder()
                .id(100L)
                .customer(sampleCustomer)
                .status(OrderStatus.SHIPPED)
                .totalAmount(new BigDecimal("29.99"))
                .items(new ArrayList<>())
                .build();

        when(orderRepository.findWithDetailsById(100L)).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> orderService.cancelOrder(100L))
                .isInstanceOf(InvalidOrderStatusException.class)
                .hasMessageContaining("Cannot cancel order with ID 100 because it is already SHIPPED");

        verify(orderRepository, never()).save(any(Order.class));
    }
}
