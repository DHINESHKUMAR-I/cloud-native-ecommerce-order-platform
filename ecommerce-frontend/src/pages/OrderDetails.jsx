import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import StatusBadge from '../components/StatusBadge';
import { useNotification } from '../context/NotificationContext';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrderById(id);
      setOrder(res.data);
    } catch (err) {
      setError(err.userMessage || `Failed to fetch order #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableNextStatuses = (status) => {
    switch (status) {
      case 'PENDING':
        return ['CONFIRMED', 'CANCELLED'];
      case 'CONFIRMED':
        return ['PROCESSING', 'CANCELLED'];
      case 'PROCESSING':
        return ['SHIPPED', 'CANCELLED'];
      case 'SHIPPED':
        return ['DELIVERED'];
      default:
        return [];
    }
  };

  const handleStatusUpdate = async () => {
    if (!targetStatus) return;

    setUpdating(true);
    setError(null);
    try {
      const res = await orderService.updateOrderStatus(id, targetStatus);
      setOrder(res.data);
      setTargetStatus('');
      showSuccess(`Order #${id} status updated to ${res.data.status}.`);
    } catch (err) {
      setError(err.userMessage || 'Failed to update order status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm(`Are you sure you want to cancel Order #${id}? Reserved stock will be restored to catalog.`)) {
      return;
    }

    setUpdating(true);
    setError(null);
    try {
      await orderService.cancelOrder(id);
      showSuccess(`Order #${id} was cancelled successfully. Inventory has been restored.`);
      loadOrder();
    } catch (err) {
      setError(err.userMessage || 'Failed to cancel order.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading details for Order #${id}...`} />;
  }

  if (error && !order) {
    return (
      <div>
        <Alert type="danger" message={error} />
        <Link to="/orders" className="btn btn-secondary">
          ← Back to Orders
        </Link>
      </div>
    );
  }

  const nextStatuses = getAvailableNextStatuses(order.status);
  const isCancellable = order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Order #{order.id}</h1>
          <p className="page-subtitle">Placed on {new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <StatusBadge status={order.status} />
          <Link to="/orders" className="btn btn-secondary">
            ← Back to Orders
          </Link>
        </div>
      </div>

      <Alert type="danger" message={error} onClose={() => setError(null)} />

      {/* Customer & Order Metadata */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>Customer & Status Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          <div>
            <span className="stat-label">Customer Name</span>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>
              <Link to={`/customers/${order.customerId}`} style={{ color: 'var(--primary)' }}>
                {order.customerName}
              </Link>
            </div>
          </div>
          <div>
            <span className="stat-label">Customer Email</span>
            <div style={{ fontWeight: 600, marginTop: '0.25rem' }}>{order.customerEmail}</div>
          </div>
          <div>
            <span className="stat-label">Current Status</span>
            <div style={{ marginTop: '0.25rem' }}>
              <StatusBadge status={order.status} />
            </div>
          </div>
          <div>
            <span className="stat-label">Total Amount</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.15rem' }}>
              ${Number(order.totalAmount).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Order Status Transition Controls */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '0.75rem' }}>Order State Transition</h2>
        {nextStatuses.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            This order is in a terminal state ({order.status}). No further transitions are permitted.
          </p>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Advance status to:</span>
            <select
              className="form-control"
              style={{ width: '200px' }}
              value={targetStatus}
              onChange={(e) => setTargetStatus(e.target.value)}
            >
              <option value="">-- Select Status --</option>
              {nextStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary"
              disabled={!targetStatus || updating}
              onClick={handleStatusUpdate}
            >
              {updating ? 'Updating...' : 'Apply Transition'}
            </button>
            {isCancellable && (
              <button
                className="btn btn-danger"
                disabled={updating}
                onClick={handleCancel}
              >
                Cancel Order & Restore Stock
              </button>
            )}
          </div>
        )}
      </div>

      {/* Line Items Table */}
      <div className="card">
        <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '1rem' }}>Order Line Items</h2>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item #</th>
                <th>Product</th>
                <th>Purchased Price</th>
                <th>Quantity</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, index) => (
                <tr key={item.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    <strong>
                      <Link to={`/products/${item.productId}`} style={{ color: 'var(--primary)' }}>
                        {item.productName}
                      </Link>
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Product ID: #{item.productId}</div>
                  </td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td style={{ fontWeight: 600 }}>${Number(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem', paddingTop: '1rem' }}>
                  Total:
                </td>
                <td style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary)', paddingTop: '1rem' }}>
                  ${Number(order.totalAmount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
