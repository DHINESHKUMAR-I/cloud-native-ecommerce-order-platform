import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useNotification } from '../context/NotificationContext';

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadCustomerAndOrders();
  }, [id]);

  const loadCustomerAndOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customerRes, ordersRes] = await Promise.all([
        customerService.getCustomerById(id),
        orderService.getOrdersByCustomerId(id, 0, 50),
      ]);
      setCustomer(customerRes.data);
      setEditFormData({
        name: customerRes.data.name,
        email: customerRes.data.email,
        phone: customerRes.data.phone,
      });
      setOrders(ordersRes.data.content || []);
    } catch (err) {
      setError(err.userMessage || `Failed to load customer #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const res = await customerService.updateCustomer(id, editFormData);
      setCustomer(res.data);
      setIsEditing(false);
      showSuccess('Customer profile updated successfully.');
    } catch (err) {
      showError(err.userMessage || 'Failed to update customer.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete customer "${customer.name}"?`)) {
      return;
    }

    try {
      await customerService.deleteCustomer(id);
      showSuccess(`Customer "${customer.name}" was deleted successfully.`);
      navigate('/customers');
    } catch (err) {
      showError(err.userMessage || 'Failed to delete customer.');
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading profile for customer #${id}...`} />;
  }

  if (error || !customer) {
    return (
      <div>
        <Alert type="danger" message={error || 'Customer not found.'} />
        <Link to="/customers" className="btn btn-secondary">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{customer.name}</h1>
          <p className="page-subtitle">Customer ID: #{customer.id} • Registered Customer Profile</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
          <Link to="/customers" className="btn btn-secondary">
            ← Back to Customers
          </Link>
        </div>
      </div>

      {isEditing ? (
        <div className="card" style={{ maxWidth: '650px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Edit Customer Profile</h2>
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-control"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                className="form-control"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                className="form-control"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={savingEdit}>
                {savingEdit ? 'Saving...' : 'Save Profile'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: '800px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <span className="stat-label">Email Address</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.25rem' }}>{customer.email}</div>
            </div>
            <div>
              <span className="stat-label">Phone Number</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.25rem' }}>{customer.phone}</div>
            </div>
            <div>
              <span className="stat-label">Total Orders Placed</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.25rem', color: 'var(--primary)' }}>
                {orders.length} orders
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div>
              <strong>Member Since:</strong> {new Date(customer.createdAt).toLocaleDateString()}
            </div>
            <div>
              <strong>Last Updated:</strong> {new Date(customer.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Orders associated with this customer */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Order History</h2>
          <Link to={`/orders/new?customerId=${customer.id}`} className="btn btn-primary btn-sm">
            + Create Order for Customer
          </Link>
        </div>

        {orders.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No orders found for this customer.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total Amount</th>
                  <th>Status</th>
                  <th>Placed Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>${Number(o.totalAmount).toFixed(2)}</td>
                    <td>
                      <span className={`badge-status badge-${o.status.toLowerCase()}`}>{o.status}</span>
                    </td>
                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/orders/${o.id}`} className="btn btn-secondary btn-sm">
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
