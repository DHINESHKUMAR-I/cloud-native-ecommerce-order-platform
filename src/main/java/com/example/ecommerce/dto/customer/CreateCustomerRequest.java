package com.example.ecommerce.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateCustomerRequest {

    @NotBlank(message = "Customer name cannot be blank")
    @Size(min = 2, max = 100, message = "Customer name must be between 2 and 100 characters")
    private String name;

    @NotBlank(message = "Customer email cannot be blank")
    @Email(message = "Customer email must be a valid email format")
    @Size(max = 150, message = "Customer email must not exceed 150 characters")
    private String email;

    @NotBlank(message = "Customer phone cannot be blank")
    @Pattern(regexp = "^\\+?[0-9\\s\\-\\(\\)]{7,25}$", message = "Customer phone must be a valid phone number")
    private String phone;

    public CreateCustomerRequest() {
    }

    public CreateCustomerRequest(String name, String email, String phone) {
        this.name = name;
        this.email = email;
        this.phone = phone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String email;
        private String phone;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public CreateCustomerRequest build() {
            return new CreateCustomerRequest(name, email, phone);
        }
    }
}
