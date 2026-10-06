import React from 'react';
import { NavLink } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { NotificationProvider } from './context/NotificationContext';

export default function App() {
  return (
    <NotificationProvider>
      <div className="app-container">
        <Navbar />
        <div className="main-layout">
          <aside className="sidebar">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              📊 Dashboard
            </NavLink>
            <NavLink
              to="/products"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              📦 Products
            </NavLink>
            <NavLink
              to="/customers"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              👥 Customers
            </NavLink>
            <NavLink
              to="/orders"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              📑 Orders
            </NavLink>
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              <NavLink
                to="/orders/new"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={{ color: 'var(--primary)', fontWeight: 600 }}
              >
                ➕ New Order
              </NavLink>
            </div>
          </aside>
          <main className="page-content">
            <AppRoutes />
          </main>
        </div>
      </div>
    </NotificationProvider>
  );
}
