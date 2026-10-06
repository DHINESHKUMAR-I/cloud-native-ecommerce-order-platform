# Cloud-Native E-Commerce Order Platform

An enterprise-ready, modular monolithic backend for e-commerce customer, product, and order lifecycle management built with **Spring Boot 3**, **Java 21**, and **Spring Data JPA**.

---

## 1. Project Overview

The **Cloud-Native E-Commerce Order Platform** provides a robust, transactional backend for handling customers, catalog inventory, and multi-item order lifecycles. It features strict state-machine order progression, real-time inventory reservation and restoration upon cancellation, transactional integrity, unified error handling, and production-grade monitoring via Spring Boot Actuator.

---

## 2. Features

- **Customer Management**: Registration, profile retrieval, update, deletion, and uniqueness enforcement on email.
- **Product & Catalog Management**: Create, update, delete, and list catalog items with categorization, pagination, and sorting.
- **Product Search & Availability Filtering**: Full-text name search, category lookups, and real-time positive stock filtering.
- **Transactional Order Placement**:
  - Validates customer and items existence.
  - Ensures requested quantities are strictly positive.
  - Validates available stock.
  - Locks and decrements inventory atomically.
  - Computes unit subtotals and order totals.
  - Persists order and line items under a single database transaction (`@Transactional`).
- **Controlled Order State Machine**:
  - Valid status transitions: `PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`.
  - Rejection of illegal transitions (e.g., `DELIVERED` → `PENDING` or `CANCELLED` → `CONFIRMED`).
- **Order Cancellation & Stock Restoration**:
  - Allowed from cancellable states (`PENDING`, `CONFIRMED`, `PROCESSING`).
  - Automatically restores reserved product stock back to the catalog.
- **Global Error Handling**: Uniform RFC-compliant JSON error responses without leaking internal stack traces.
- **Observability**: Health and operational metadata endpoints via Spring Boot Actuator (`/actuator/health`, `/actuator/info`).

---

## 3. Technology Stack

- **Java**: 21
- **Framework**: Spring Boot 3.3.4
- **Modules**:
  - Spring Web (REST API design)
  - Spring Data JPA & Hibernate ORM
  - Jakarta Bean Validation
  - Spring Boot Actuator
- **Database**: MySQL 8 (Production/Dev), H2 in MySQL mode (isolated test execution)
- **Build Tool**: Apache Maven (Wrapper included: `./mvnw`)
- **Testing**: JUnit 5, Mockito, Spring Boot Test, MockMvc

---

## 4. Architecture

A clean layered architecture adhering to separation of concerns and constructor-based dependency injection:

```
Controller Layer  (REST Endpoints, Request Validation, HTTP Status Codes)
       ↓
Service Layer     (Business Rules, Stock Validation, Transaction Boundaries)
       ↓
Repository Layer  (Spring Data JPA Repositories, Query Methods, EntityGraph)
       ↓
Domain Entities   (Customer, Product, Order, OrderItem, OrderStatus)
       ↓
Relational DB     (MySQL 8)
```

---

## 5. Project Structure

```
├── .mvn/
│   └── wrapper/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/ecommerce/
│   │   │       ├── EcommerceApplication.java
│   │   │       ├── controller/
│   │   │       │   ├── CustomerController.java
│   │   │       │   ├── ProductController.java
│   │   │       │   └── OrderController.java
│   │   │       ├── service/
│   │   │       │   ├── CustomerService.java
│   │   │       │   ├── ProductService.java
│   │   │       │   ├── OrderService.java
│   │   │       │   └── impl/
│   │   │       │       ├── CustomerServiceImpl.java
│   │   │       │       ├── ProductServiceImpl.java
│   │   │       │       └── OrderServiceImpl.java
│   │   │       ├── repository/
│   │   │       │   ├── CustomerRepository.java
│   │   │       │   ├── ProductRepository.java
│   │   │       │   ├── OrderRepository.java
│   │   │       │   └── OrderItemRepository.java
│   │   │       ├── entity/
│   │   │       │   ├── Customer.java
│   │   │       │   ├── Product.java
│   │   │       │   ├── Order.java
│   │   │       │   ├── OrderItem.java
│   │   │       │   └── OrderStatus.java
│   │   │       ├── dto/
│   │   │       │   ├── customer/
│   │   │       │   │   ├── CreateCustomerRequest.java
│   │   │       │   │   └── CustomerResponse.java
│   │   │       │   ├── product/
│   │   │       │   │   ├── CreateProductRequest.java
│   │   │       │   │   ├── UpdateProductRequest.java
│   │   │       │   │   └── ProductResponse.java
│   │   │       │   └── order/
│   │   │       │       ├── CreateOrderRequest.java
│   │   │       │       ├── OrderItemRequest.java
│   │   │       │       ├── OrderResponse.java
│   │   │       │       ├── OrderItemResponse.java
│   │   │       │       └── UpdateOrderStatusRequest.java
│   │   │       └── exception/
│   │   │           ├── ResourceNotFoundException.java
│   │   │           ├── InsufficientStockException.java
│   │   │           ├── DuplicateResourceException.java
│   │   │           ├── InvalidOrderStatusException.java
│   │   │           ├── InvalidOrderException.java
│   │   │           ├── ErrorResponse.java
│   │   │           └── GlobalExceptionHandler.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── java/
│       │   └── com/example/ecommerce/
│       │       ├── EcommerceApplicationTests.java
│       │       └── service/
│       │           ├── CustomerServiceTest.java
│       │           ├── ProductServiceTest.java
│       │           └── OrderServiceTest.java
│       └── resources/
│           └── application.yml
├── .gitignore
├── mvnw
├── mvnw.cmd
├── pom.xml
└── README.md
```

---

## 6. Database Schema Explanation

### Tables

1. **`customers`**
   - `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
   - `name`: `VARCHAR(100) NOT NULL`
   - `email`: `VARCHAR(150) NOT NULL UNIQUE`
   - `phone`: `VARCHAR(30) NOT NULL`
   - `created_at`: `TIMESTAMP NOT NULL`
   - `updated_at`: `TIMESTAMP NOT NULL`

2. **`products`**
   - `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
   - `name`: `VARCHAR(150) NOT NULL`
   - `description`: `TEXT`
   - `price`: `DECIMAL(12,2) NOT NULL`
   - `stock`: `INT NOT NULL`
   - `category`: `VARCHAR(100) NOT NULL`
   - `created_at`: `TIMESTAMP NOT NULL`
   - `updated_at`: `TIMESTAMP NOT NULL`

3. **`orders`**
   - `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
   - `customer_id`: `BIGINT NOT NULL (FK -> customers.id)`
   - `total_amount`: `DECIMAL(14,2) NOT NULL`
   - `status`: `VARCHAR(20) NOT NULL` (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
   - `created_at`: `TIMESTAMP NOT NULL`
   - `updated_at`: `TIMESTAMP NOT NULL`

4. **`order_items`**
   - `id`: `BIGINT AUTO_INCREMENT PRIMARY KEY`
   - `order_id`: `BIGINT NOT NULL (FK -> orders.id)`
   - `product_id`: `BIGINT NOT NULL (FK -> products.id)`
   - `quantity`: `INT NOT NULL`
   - `price`: `DECIMAL(12,2) NOT NULL` (unit price snapshot at purchase time)
   - `subtotal`: `DECIMAL(14,2) NOT NULL` (`price * quantity`)

---

## 7. API Endpoints

### Customer APIs (`/api/customers`)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/customers` | Register a new customer | `201 Created` |
| `GET` | `/api/customers` | List all customers (supports pagination & sorting) | `200 OK` |
| `GET` | `/api/customers/{id}` | Get customer by ID | `200 OK` |
| `GET` | `/api/customers/email/{email}` | Find customer by email | `200 OK` |
| `PUT` | `/api/customers/{id}` | Update customer profile | `200 OK` |
| `DELETE` | `/api/customers/{id}` | Delete customer by ID | `204 No Content` |

### Product APIs (`/api/products`)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/products` | Create a new catalog product | `201 Created` |
| `GET` | `/api/products` | Get products with pagination & sorting | `200 OK` |
| `GET` | `/api/products/{id}` | Get product details by ID | `200 OK` |
| `PUT` | `/api/products/{id}` | Update product details | `200 OK` |
| `DELETE` | `/api/products/{id}` | Delete product by ID | `204 No Content` |
| `GET` | `/api/products/search?name={name}` | Search products by name (case-insensitive) | `200 OK` |
| `GET` | `/api/products/category/{category}` | Filter products by category | `200 OK` |
| `GET` | `/api/products/available` | List available products with stock > 0 | `200 OK` |

### Order APIs (`/api/orders`)
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `POST` | `/api/orders` | Create an order with transactional stock deduction | `201 Created` |
| `GET` | `/api/orders` | List orders (paginated, sorted by date) | `200 OK` |
| `GET` | `/api/orders/{id}` | Get full order details with items | `200 OK` |
| `GET` | `/api/orders/customer/{customerId}` | List orders belonging to a customer | `200 OK` |
| `PUT` | `/api/orders/{id}/status` | Update order status with transition rules | `200 OK` |
| `DELETE` | `/api/orders/{id}` | Cancel order and automatically restore stock | `204 No Content` |

### Actuator APIs
| Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/actuator/health` | Health endpoint (status UP/DOWN) | `200 OK` |
| `GET` | `/actuator/info` | Application information | `200 OK` |

---

## 8. Local Setup & Environment Variables

### Configuration via Environment Variables

The backend accepts the following environment variables (with sensible local defaults):

| Variable | Description | Default Value |
|---|---|---|
| `SERVER_PORT` | HTTP port for the application | `8081` |
| `DB_URL` | JDBC URL for MySQL database | `jdbc:mysql://localhost:3306/intern?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&createDatabaseIfNotExist=true` |
| `DB_USERNAME` | MySQL database username | `root` |
| `DB_PASSWORD` | MySQL database password | `dk1306` |

### MySQL Setup
Before running against a local MySQL database, create the schema:
```sql
CREATE DATABASE IF NOT EXISTS intern;
```

---

## 9. How to Run

### Using Maven Wrapper (Windows PowerShell)
```powershell
.\mvnw.cmd spring-boot:run
```

### Using Maven Wrapper (Linux / macOS / Git Bash)
```bash
./mvnw spring-boot:run
```

### Running the Packaged JAR
```powershell
.\mvnw.cmd package -DskipTests
java -jar target/ecommerce-order-platform-1.0.0.jar
```

---

## 10. How to Test

Run the full automated test suite (including 25 unit and integration tests):
```powershell
.\mvnw.cmd test
```

Tests run automatically against an isolated, in-memory H2 database configured in MySQL compatibility mode (`src/test/resources/application.yml`), requiring no external database server running.

---

## 11. Example API Requests

### 1. Create a Customer
```bash
curl -X POST http://localhost:8081/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "phone": "+1-555-0199"
  }'
```

### 2. Create a Product
```bash
curl -X POST http://localhost:8081/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Noise Cancelling Headphones",
    "description": "High fidelity wireless over-ear headphones",
    "price": 199.99,
    "stock": 25,
    "category": "Electronics"
  }'
```

### 3. List Products (Paginated & Sorted)
```bash
curl -X GET "http://localhost:8081/api/products?page=0&size=10&sort=price,asc"
```

### 4. Create an Order
```bash
curl -X POST http://localhost:8081/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "productId": 1,
        "quantity": 2
      }
    ]
  }'
```

### 5. Update Order Status
```bash
curl -X PUT http://localhost:8081/api/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "CONFIRMED"
  }'
```

### 6. Cancel an Order (Restores Inventory)
```bash
curl -X DELETE http://localhost:8081/api/orders/1
```

### 7. Health Check
```bash
curl -X GET http://localhost:8081/actuator/health
```
