package com.example.ecommerce.dto.order;

import com.example.ecommerce.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateOrderStatusRequest {

    @NotNull(message = "Order status cannot be null")
    private OrderStatus status;

    public UpdateOrderStatusRequest() {
    }

    public UpdateOrderStatusRequest(OrderStatus status) {
        this.status = status;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private OrderStatus status;

        public Builder status(OrderStatus status) {
            this.status = status;
            return this;
        }

        public UpdateOrderStatusRequest build() {
            return new UpdateOrderStatusRequest(status);
        }
    }
}
