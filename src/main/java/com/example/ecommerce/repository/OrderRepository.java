package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Optional<Order> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    List<Order> findByCustomerId(Long customerId);

    @EntityGraph(attributePaths = {"customer", "items", "items.product"})
    Page<Order> findByCustomerId(Long customerId, Pageable pageable);
}
