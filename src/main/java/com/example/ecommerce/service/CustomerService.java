package com.example.ecommerce.service;

import com.example.ecommerce.dto.customer.CreateCustomerRequest;
import com.example.ecommerce.dto.customer.CustomerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CustomerService {

    CustomerResponse createCustomer(CreateCustomerRequest request);

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    List<CustomerResponse> getAllCustomers();

    CustomerResponse getCustomerById(Long id);

    CustomerResponse getCustomerByEmail(String email);

    CustomerResponse updateCustomer(Long id, CreateCustomerRequest request);

    void deleteCustomer(Long id);
}
