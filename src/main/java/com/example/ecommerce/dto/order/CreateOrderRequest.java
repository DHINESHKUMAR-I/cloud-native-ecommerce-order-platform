package com.example.ecommerce.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class CreateOrderRequest {

    @NotNull(message = "Customer ID cannot be null")
    private Long customerId;

    @NotEmpty(message = "Order must contain at least one item")
    @Valid
    private List<OrderItemRequest> items;

    public CreateOrderRequest() {
    }

    public CreateOrderRequest(Long customerId, List<OrderItemRequest> items) {
        this.customerId = customerId;
        this.items = items;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long customerId;
        private List<OrderItemRequest> items;

        public Builder customerId(Long customerId) {
            this.customerId = customerId;
            return this;
        }

        public Builder items(List<OrderItemRequest> items) {
            this.items = items;
            return this;
        }

        public CreateOrderRequest build() {
            return new CreateOrderRequest(customerId, items);
        }
    }
}
