package com.example.ecommerce.service;

import com.example.ecommerce.dto.customer.CreateCustomerRequest;
import com.example.ecommerce.dto.customer.CustomerResponse;
import com.example.ecommerce.entity.Customer;
import com.example.ecommerce.exception.DuplicateResourceException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.repository.CustomerRepository;
import com.example.ecommerce.service.impl.CustomerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerServiceTest {

    @Mock
    private CustomerRepository customerRepository;

    @InjectMocks
    private CustomerServiceImpl customerService;

    private Customer sampleCustomer;
    private CreateCustomerRequest createCustomerRequest;

    @BeforeEach
    void setUp() {
        sampleCustomer = Customer.builder()
                .id(1L)
                .name("Jane Doe")
                .email("jane.doe@example.com")
                .phone("+1234567890")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        createCustomerRequest = CreateCustomerRequest.builder()
                .name("Jane Doe")
                .email("jane.doe@example.com")
                .phone("+1234567890")
                .build();
    }

    @Test
    @DisplayName("Should successfully create a new customer")
    void createCustomer_Success() {
        when(customerRepository.existsByEmail("jane.doe@example.com")).thenReturn(false);
        when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);

        CustomerResponse response = customerService.createCustomer(createCustomerRequest);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getEmail()).isEqualTo("jane.doe@example.com");
        assertThat(response.getName()).isEqualTo("Jane Doe");
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when creating customer with existing email")
    void createCustomer_DuplicateEmail_ThrowsException() {
        when(customerRepository.existsByEmail("jane.doe@example.com")).thenReturn(true);

        assertThatThrownBy(() -> customerService.createCustomer(createCustomerRequest))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(customerRepository, never()).save(any(Customer.class));
    }

    @Test
    @DisplayName("Should find customer by ID successfully")
    void getCustomerById_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));

        CustomerResponse response = customerService.getCustomerById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getName()).isEqualTo("Jane Doe");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when customer ID does not exist")
    void getCustomerById_NotFound_ThrowsException() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> customerService.getCustomerById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer with ID 99 not found");
    }

    @Test
    @DisplayName("Should update customer successfully")
    void updateCustomer_Success() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(sampleCustomer));
        when(customerRepository.save(any(Customer.class))).thenReturn(sampleCustomer);

        CreateCustomerRequest updateRequest = CreateCustomerRequest.builder()
                .name("Jane Updated")
                .email("jane.doe@example.com")
                .phone("+9876543210")
                .build();

        CustomerResponse response = customerService.updateCustomer(1L, updateRequest);

        assertThat(response).isNotNull();
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    @DisplayName("Should delete customer successfully when ID exists")
    void deleteCustomer_Success() {
        when(customerRepository.existsById(1L)).thenReturn(true);
        doNothing().when(customerRepository).deleteById(1L);

        customerService.deleteCustomer(1L);

        verify(customerRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent customer")
    void deleteCustomer_NotFound_ThrowsException() {
        when(customerRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> customerService.deleteCustomer(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Customer with ID 99 not found");

        verify(customerRepository, never()).deleteById(anyLong());
    }
}
