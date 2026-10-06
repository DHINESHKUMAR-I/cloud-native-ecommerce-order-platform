package com.example.ecommerce.repository;

import com.example.ecommerce.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Product> findByCategoryIgnoreCase(String category);

    Page<Product> findByCategoryIgnoreCase(String category, Pageable pageable);

    List<Product> findByStockGreaterThan(Integer stock);

    Page<Product> findByStockGreaterThan(Integer stock, Pageable pageable);
}
