package com.example.ecommerce.service.impl;

import com.example.ecommerce.dto.order.CreateOrderRequest;
import com.example.ecommerce.dto.order.OrderItemRequest;
import com.example.ecommerce.dto.order.OrderItemResponse;
import com.example.ecommerce.dto.order.OrderResponse;
import com.example.ecommerce.dto.order.UpdateOrderStatusRequest;
import com.example.ecommerce.entity.Customer;
import com.example.ecommerce.entity.Order;
import com.example.ecommerce.entity.OrderItem;
import com.example.ecommerce.entity.OrderStatus;
import com.example.ecommerce.entity.Product;
import com.example.ecommerce.exception.InsufficientStockException;
import com.example.ecommerce.exception.InvalidOrderException;
import com.example.ecommerce.exception.InvalidOrderStatusException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CustomerRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public OrderServiceImpl(OrderRepository orderRepository,
                            CustomerRepository customerRepository,
                            ProductRepository productRepository) {
        this.orderRepository = orderRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request) {
        log.info("Processing order creation for customer ID: {}", request.getCustomerId());

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> {
                    log.warn("Order creation failed: Customer ID {} not found", request.getCustomerId());
                    return new ResourceNotFoundException("Customer with ID " + request.getCustomerId() + " not found");
                });

        if (request.getItems() == null || request.getItems().isEmpty()) {
            log.warn("Order creation failed: Request contains no items");
            throw new InvalidOrderException("Order must contain at least one item");
        }

        Order order = Order.builder()
                .customer(customer)
                .status(OrderStatus.PENDING)
                .items(new ArrayList<>())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal runningTotal = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                log.warn("Invalid quantity {} for product ID {}", itemReq.getQuantity(), itemReq.getProductId());
                throw new InvalidOrderException("Order item quantity must be greater than zero");
            }

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> {
                        log.warn("Order creation failed: Product ID {} not found", itemReq.getProductId());
                        return new ResourceNotFoundException("Product with ID " + itemReq.getProductId() + " not found");
                    });

            if (product.getStock() < itemReq.getQuantity()) {
                log.warn("Insufficient stock for product ID {}. Available: {}, Requested: {}",
                        product.getId(), product.getStock(), itemReq.getQuantity());
                throw new InsufficientStockException("Insufficient stock for product '" + product.getName()
                        + "'. Available: " + product.getStock() + ", requested: " + itemReq.getQuantity());
            }

            // Deduct stock
            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal currentPrice = product.getPrice();
            BigDecimal subtotal = currentPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            runningTotal = runningTotal.add(subtotal);

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemReq.getQuantity())
                    .price(currentPrice)
                    .subtotal(subtotal)
                    .build();

            order.addItem(orderItem);
        }

        order.setTotalAmount(runningTotal);
        Order savedOrder = orderRepository.save(order);
        log.info("Successfully created order with ID: {} for customer ID: {}, total: {}",
                savedOrder.getId(), customer.getId(), runningTotal);

        return mapToResponse(savedOrder);
    }

    @Override
    public Page<OrderResponse> getAllOrders(Pageable pageable) {
        log.debug("Fetching page of orders: {}", pageable);
        return orderRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public OrderResponse getOrderById(Long id) {
        log.debug("Fetching order with ID: {}", id);
        Order order = orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> {
                    log.warn("Order with ID {} not found", id);
                    return new ResourceNotFoundException("Order with ID " + id + " not found");
                });
        return mapToResponse(order);
    }

    @Override
    public List<OrderResponse> getOrdersByCustomerId(Long customerId) {
        log.debug("Fetching orders for customer ID: {}", customerId);
        if (!customerRepository.existsById(customerId)) {
            log.warn("Customer ID {} not found while fetching orders", customerId);
            throw new ResourceNotFoundException("Customer with ID " + customerId + " not found");
        }
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public Page<OrderResponse> getOrdersByCustomerId(Long customerId, Pageable pageable) {
        log.debug("Fetching page of orders for customer ID: {}, pageable: {}", customerId, pageable);
        if (!customerRepository.existsById(customerId)) {
            log.warn("Customer ID {} not found while fetching orders", customerId);
            throw new ResourceNotFoundException("Customer with ID " + customerId + " not found");
        }
        return orderRepository.findByCustomerId(customerId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public OrderResponse updateOrderStatus(Long id, UpdateOrderStatusRequest request) {
        log.info("Updating status of order ID {} to {}", id, request.getStatus());
        Order order = orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + id + " not found"));

        OrderStatus currentStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        if (!currentStatus.canTransitionTo(newStatus)) {
            log.warn("Invalid order status transition from {} to {} for order ID {}",
                    currentStatus, newStatus, id);
            throw new InvalidOrderStatusException("Cannot transition order ID " + id
                    + " from " + currentStatus + " to " + newStatus);
        }

        if (newStatus == OrderStatus.CANCELLED && currentStatus != OrderStatus.CANCELLED) {
            restoreStockForOrder(order);
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        log.info("Order ID {} status updated to {}", updatedOrder.getId(), newStatus);
        return mapToResponse(updatedOrder);
    }

    @Override
    @Transactional
    public OrderResponse cancelOrder(Long id) {
        log.info("Processing cancellation for order ID: {}", id);
        Order order = orderRepository.findWithDetailsById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order with ID " + id + " not found"));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            log.warn("Cancellation rejected: Order ID {} is already cancelled", id);
            throw new InvalidOrderStatusException("Order with ID " + id + " is already cancelled");
        }

        if (order.getStatus() == OrderStatus.SHIPPED || order.getStatus() == OrderStatus.DELIVERED) {
            log.warn("Cancellation rejected: Cannot cancel order ID {} in status {}", id, order.getStatus());
            throw new InvalidOrderStatusException("Cannot cancel order with ID " + id + " because it is already " + order.getStatus());
        }

        restoreStockForOrder(order);
        order.setStatus(OrderStatus.CANCELLED);
        Order cancelledOrder = orderRepository.save(order);
        log.info("Successfully cancelled order ID {} and restored stock", cancelledOrder.getId());

        return mapToResponse(cancelledOrder);
    }

    private void restoreStockForOrder(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            int restoredStock = product.getStock() + item.getQuantity();
            product.setStock(restoredStock);
            productRepository.save(product);
            log.info("Restored {} units to product ID {}. New stock: {}",
                    item.getQuantity(), product.getId(), restoredStock);
        }
    }

    private OrderResponse mapToResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(item -> OrderItemResponse.builder()
                        .id(item.getId())
                        .productId(item.getProduct().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .subtotal(item.getSubtotal())
                        .build())
                .toList();

        return OrderResponse.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getName())
                .customerEmail(order.getCustomer().getEmail())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .items(itemResponses)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
