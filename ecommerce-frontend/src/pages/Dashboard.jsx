import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, availableRes, customersRes, ordersRes] = await Promise.all([
        productService.getProducts(0, 1),
        productService.getAvailableProducts(0, 1),
        customerService.getCustomers(0, 1),
        orderService.getOrders(0, 100),
      ]);

      const allOrders = ordersRes.data.content || [];
      const pendingCount = allOrders.filter((o) => o.status === 'PENDING').length;

      setStats({
        totalProducts: productsRes.data.totalElements || 0,
        availableProducts: availableRes.data.totalElements || 0,
        totalCustomers: customersRes.data.totalElements || 0,
        totalOrders: ordersRes.data.totalElements || 0,
        pendingOrders: pendingCount,
      });

      setRecentOrders(allOrders.slice(0, 5));
    } catch (err) {
      setError(err.userMessage || 'Failed to load dashboard metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating metrics from backend..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Operational Dashboard</h1>
          <p className="page-subtitle">Real-time platform overview derived directly from Spring Boot REST APIs</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={loadDashboardData}>
          ↻ Refresh Data
        </button>
      </div>

      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Products</span>
          <span className="stat-value">{stats.totalProducts}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Available In Stock</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>
            {stats.availableProducts}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Customers</span>
          <span className="stat-value">{stats.totalCustomers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Orders</span>
          <span className="stat-value">{stats.totalOrders}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pending Orders</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>
            {stats.pendingOrders}
          </span>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Recent Orders</h2>
          <Link to="/orders" className="btn btn-secondary btn-sm">
            View All Orders →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders placed yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Placed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.customerName}</td>
                    <td>${Number(order.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge-status badge-${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link to="/orders/new" className="btn btn-primary">
          + Place New Order
        </Link>
        <Link to="/products/new" className="btn btn-secondary">
          + Add New Product
        </Link>
        <Link to="/customers/new" className="btn btn-secondary">
          + Register Customer
        </Link>
      </div>
    </div>
  );
}
