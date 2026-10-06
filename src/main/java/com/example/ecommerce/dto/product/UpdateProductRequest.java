package com.example.ecommerce.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public class UpdateProductRequest {

    @NotBlank(message = "Product name cannot be blank")
    @Size(min = 2, max = 150, message = "Product name must be between 2 and 150 characters")
    private String name;

    private String description;

    @NotNull(message = "Product price cannot be null")
    @DecimalMin(value = "0.01", message = "Product price must be greater than zero")
    @Digits(integer = 10, fraction = 2, message = "Product price must have valid format with up to 2 decimal places")
    private BigDecimal price;

    @NotNull(message = "Product stock cannot be null")
    @Min(value = 0, message = "Product stock cannot be negative")
    private Integer stock;

    @NotBlank(message = "Product category cannot be blank")
    @Size(max = 100, message = "Product category must not exceed 100 characters")
    private String category;

    public UpdateProductRequest() {
    }

    public UpdateProductRequest(String name, String description, BigDecimal price, Integer stock, String category) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private String category;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder price(BigDecimal price) {
            this.price = price;
            return this;
        }

        public Builder stock(Integer stock) {
            this.stock = stock;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }

        public UpdateProductRequest build() {
            return new UpdateProductRequest(name, description, price, stock, category);
        }
    }
}
