import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import CreateProduct from '../pages/CreateProduct';
import EditProduct from '../pages/EditProduct';
import Customers from '../pages/Customers';
import CustomerDetails from '../pages/CustomerDetails';
import CreateCustomer from '../pages/CreateCustomer';
import Orders from '../pages/Orders';
import CreateOrder from '../pages/CreateOrder';
import OrderDetails from '../pages/OrderDetails';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/new" element={<CreateProduct />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/products/:id/edit" element={<EditProduct />} />
      <Route path="/customers" element={<Customers />} />
      <Route path="/customers/new" element={<CreateCustomer />} />
      <Route path="/customers/:id" element={<CustomerDetails />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/new" element={<CreateOrder />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
