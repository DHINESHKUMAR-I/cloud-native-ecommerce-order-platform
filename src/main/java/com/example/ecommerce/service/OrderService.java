package com.example.ecommerce.service;

import com.example.ecommerce.dto.order.CreateOrderRequest;
import com.example.ecommerce.dto.order.OrderResponse;
import com.example.ecommerce.dto.order.UpdateOrderStatusRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OrderService {

    OrderResponse createOrder(CreateOrderRequest request);

    Page<OrderResponse> getAllOrders(Pageable pageable);

    OrderResponse getOrderById(Long id);

    List<OrderResponse> getOrdersByCustomerId(Long customerId);

    Page<OrderResponse> getOrdersByCustomerId(Long customerId, Pageable pageable);

    OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request);

    OrderResponse cancelOrder(Long id);
}
