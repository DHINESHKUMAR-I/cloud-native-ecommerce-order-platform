# Cloud-Native E-Commerce Platform - React Frontend

The official React/Vite single-page frontend interface for the Cloud-Native E-Commerce Platform.

## 1. Features
- **Dashboard**: Real-time aggregated platform metrics (Total Products, In-Stock, Customers, Orders, Pending Orders) and recent order feed.
- **Product Management**: Catalog listing, search by name, category filtering, stock availability filter, product details, creation, updating, and deletion.
- **Customer Management**: Customer directory, exact email search, customer details with order history, profile registration, and deletion.
- **Order Management**: Multi-item transactional order creation with live stock validation and price calculations, paginated order listing, order details view, state transition management, and order cancellation with automatic stock restoration.
- **Error Handling**: Graceful error interception for network issues, 404s, 409 conflicts, 400 bad requests, and server errors without leaking stack traces.
- **Backend Health Check**: Real-time Spring Boot Actuator health heartbeat indicator in the top navbar.

## 2. Technology Stack
- **Framework**: React 18
- **Build Tool & Dev Server**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Vanilla CSS design system

## 3. Configuration & Environment Variables
Configured in `.env`:
```
VITE_API_BASE_URL=http://localhost:8081
```

## 4. Setup & Running Locally

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Build outputs are generated in the `dist/` directory.
