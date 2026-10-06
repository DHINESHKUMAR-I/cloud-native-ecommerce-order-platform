package com.example.ecommerce.service.impl;

import com.example.ecommerce.dto.customer.CreateCustomerRequest;
import com.example.ecommerce.dto.customer.CustomerResponse;
import com.example.ecommerce.entity.Customer;
import com.example.ecommerce.exception.DuplicateResourceException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CustomerRepository;
import com.example.ecommerce.service.CustomerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerServiceImpl.class);

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public CustomerResponse createCustomer(CreateCustomerRequest request) {
        log.info("Attempting to create customer with email: {}", request.getEmail());

        if (customerRepository.existsByEmail(request.getEmail())) {
            log.warn("Customer creation failed: Email {} is already registered", request.getEmail());
            throw new DuplicateResourceException("Customer with email '" + request.getEmail() + "' already exists");
        }

        Customer customer = Customer.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone().trim())
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Successfully created customer with ID: {}", savedCustomer.getId());
        return mapToResponse(savedCustomer);
    }

    @Override
    public Page<CustomerResponse> getAllCustomers(Pageable pageable) {
        log.debug("Fetching customers page: {}", pageable);
        return customerRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<CustomerResponse> getAllCustomers() {
        log.debug("Fetching all customers list");
        return customerRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public CustomerResponse getCustomerById(Long id) {
        log.debug("Fetching customer with ID: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Customer with ID {} not found", id);
                    return new ResourceNotFoundException("Customer with ID " + id + " not found");
                });
        return mapToResponse(customer);
    }

    @Override
    public CustomerResponse getCustomerByEmail(String email) {
        log.debug("Fetching customer with email: {}", email);
        Customer customer = customerRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> {
                    log.warn("Customer with email {} not found", email);
                    return new ResourceNotFoundException("Customer with email '" + email + "' not found");
                });
        return mapToResponse(customer);
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomer(Long id, CreateCustomerRequest request) {
        log.info("Updating customer with ID: {}", id);
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer with ID " + id + " not found"));

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (!customer.getEmail().equalsIgnoreCase(normalizedEmail) && customerRepository.existsByEmail(normalizedEmail)) {
            log.warn("Customer update failed: Email {} already in use by another customer", normalizedEmail);
            throw new DuplicateResourceException("Customer with email '" + normalizedEmail + "' already exists");
        }

        customer.setName(request.getName().trim());
        customer.setEmail(normalizedEmail);
        customer.setPhone(request.getPhone().trim());

        Customer updatedCustomer = customerRepository.save(customer);
        log.info("Successfully updated customer with ID: {}", updatedCustomer.getId());
        return mapToResponse(updatedCustomer);
    }

    @Override
    @Transactional
    public void deleteCustomer(Long id) {
        log.info("Deleting customer with ID: {}", id);
        if (!customerRepository.existsById(id)) {
            log.warn("Customer delete failed: ID {} not found", id);
            throw new ResourceNotFoundException("Customer with ID " + id + " not found");
        }
        customerRepository.deleteById(id);
        log.info("Successfully deleted customer with ID: {}", id);
    }

    private CustomerResponse mapToResponse(Customer customer) {
        return CustomerResponse.builder()
                .id(customer.getId())
                .name(customer.getName())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }
}
