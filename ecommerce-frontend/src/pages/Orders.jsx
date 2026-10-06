import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { notification, showSuccess, showError, clearNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders(page, 10, 'createdAt,desc');
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel Order #${id}? Reserved stock will be restored.`)) {
      return;
    }

    try {
      await orderService.cancelOrder(id);
      showSuccess(`Order #${id} has been cancelled. Inventory has been restored.`);
      fetchOrders();
    } catch (err) {
      showError(err.userMessage || 'Failed to cancel order.');
    }
  };

  const isCancellable = (status) => {
    return status === 'PENDING' || status === 'CONFIRMED' || status === 'PROCESSING';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">Track, fulfill, update status, and manage customer orders</p>
        </div>
        <Link to="/orders/new" className="btn btn-primary">
          + Place New Order
        </Link>
      </div>

      <Alert type={notification?.type} message={notification?.message} onClose={clearNotification} />
      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="card">
        {loading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <h3>No orders found</h3>
            <p>Place a new order to see order lifecycle management in action.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Placed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          <Link to={`/orders/${order.id}`} style={{ color: 'var(--primary)' }}>
                            #{order.id}
                          </Link>
                        </strong>
                      </td>
                      <td>
                        <div><strong>{order.customerName}</strong></div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                      </td>
                      <td style={{ fontWeight: 600 }}>${Number(order.totalAmount).toFixed(2)}</td>
                      <td>
                        <StatusBadge status={order.status} />
                      </td>
                      <td>{new Date(order.createdAt).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/orders/${order.id}`} className="btn btn-secondary btn-sm">
                            View Details
                          </Link>
                          {isCancellable(order.status) && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalElements={totalElements}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        )}
      </div>
    </div>
  );
}
