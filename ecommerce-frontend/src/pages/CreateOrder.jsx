import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useNotification } from '../context/NotificationContext';

export default function CreateOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');

  const { showSuccess } = useNotification();

  const [customers, setCustomers] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(preselectedCustomerId || '');
  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    loadPrerequisites();
  }, []);

  const loadPrerequisites = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customersRes, productsRes] = await Promise.all([
        customerService.getCustomers(0, 100),
        productService.getAvailableProducts(0, 100),
      ]);
      setCustomers(customersRes.data.content || []);
      setAvailableProducts(productsRes.data.content || []);

      if (preselectedCustomerId) {
        setSelectedCustomerId(preselectedCustomerId);
      }
    } catch (err) {
      setError(err.userMessage || 'Failed to load customers or products.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    if (orderItems.length <= 1) return;
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;
    setOrderItems(updated);
  };

  const getProductById = (id) => {
    return availableProducts.find((p) => p.id === Number(id));
  };

  // Calculate frontend total
  const calculatedTotal = orderItems.reduce((acc, item) => {
    const prod = getProductById(item.productId);
    if (prod && item.quantity > 0) {
      return acc + Number(prod.price) * Number(item.quantity);
    }
    return acc;
  }, 0);

  const validate = () => {
    const errors = {};
    if (!selectedCustomerId) {
      errors.customerId = 'Please select a customer';
    }

    if (orderItems.length === 0) {
      errors.items = 'Order must include at least one product';
    }

    orderItems.forEach((item, idx) => {
      if (!item.productId) {
        errors[`item_${idx}_product`] = 'Please select a product';
      }
      const qty = Number(item.quantity);
      if (!qty || qty <= 0) {
        errors[`item_${idx}_qty`] = 'Quantity must be greater than 0';
      } else {
        const prod = getProductById(item.productId);
        if (prod && qty > prod.stock) {
          errors[`item_${idx}_qty`] = `Exceeds available stock (${prod.stock} left)`;
        }
      }
    });

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        customerId: Number(selectedCustomerId),
        items: orderItems.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
        })),
      };

      const res = await orderService.createOrder(payload);
      showSuccess(`Order #${res.data.id} placed successfully!`);
      navigate(`/orders/${res.data.id}`);
    } catch (err) {
      setError(err.userMessage || 'Failed to place order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading catalog and customer data..." />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Create Order</h1>
          <p className="page-subtitle">Place a new multi-item transactional order with real-time stock deduction</p>
        </div>
        <Link to="/orders" className="btn btn-secondary">
          ← Cancel
        </Link>
      </div>

      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="card" style={{ maxWidth: '850px' }}>
        <form onSubmit={handleSubmit}>
          {/* Customer Selection */}
          <div className="form-group">
            <label className="form-label">Select Customer *</label>
            <select
              className={`form-control ${validationErrors.customerId ? 'is-invalid' : ''}`}
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">-- Choose a Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.email})
                </option>
              ))}
            </select>
            {validationErrors.customerId && (
              <div className="invalid-feedback">{validationErrors.customerId}</div>
            )}
            {customers.length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                No customers available.{' '}
                <Link to="/customers/new" style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Register a customer first
                </Link>
                .
              </p>
            )}
          </div>

          {/* Order Items Table / Input List */}
          <div style={{ marginTop: '1.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600 }}>Order Items</h2>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleAddItem}
                disabled={availableProducts.length === 0}
              >
                + Add Another Product
              </button>
            </div>

            {availableProducts.length === 0 ? (
              <div className="alert alert-warning">
                No products are currently in stock.{' '}
                <Link to="/products/new" style={{ fontWeight: 600 }}>
                  Create or restock products
                </Link>
                .
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Product</th>
                      <th style={{ width: '15%' }}>Unit Price</th>
                      <th style={{ width: '20%' }}>Quantity</th>
                      <th style={{ width: '15%' }}>Subtotal</th>
                      <th style={{ width: '5%' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.map((item, idx) => {
                      const prod = getProductById(item.productId);
                      const unitPrice = prod ? Number(prod.price) : 0;
                      const subtotal = prod && item.quantity > 0 ? unitPrice * Number(item.quantity) : 0;

                      return (
                        <tr key={idx}>
                          <td>
                            <select
                              className={`form-control ${validationErrors[`item_${idx}_product`] ? 'is-invalid' : ''}`}
                              value={item.productId}
                              onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                            >
                              <option value="">-- Choose Product --</option>
                              {availableProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (${Number(p.price).toFixed(2)}) - {p.stock} in stock
                                </option>
                              ))}
                            </select>
                            {validationErrors[`item_${idx}_product`] && (
                              <div className="invalid-feedback">{validationErrors[`item_${idx}_product`]}</div>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle', fontWeight: 600 }}>
                            ${unitPrice.toFixed(2)}
                          </td>
                          <td>
                            <input
                              type="number"
                              min="1"
                              step="1"
                              className={`form-control ${validationErrors[`item_${idx}_qty`] ? 'is-invalid' : ''}`}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            />
                            {validationErrors[`item_${idx}_qty`] && (
                              <div className="invalid-feedback">{validationErrors[`item_${idx}_qty`]}</div>
                            )}
                          </td>
                          <td style={{ verticalAlign: 'middle', fontWeight: 600, color: 'var(--primary)' }}>
                            ${subtotal.toFixed(2)}
                          </td>
                          <td style={{ verticalAlign: 'middle' }}>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              disabled={orderItems.length <= 1}
                              onClick={() => handleRemoveItem(idx)}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Order Summary & Total */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Estimated Order Total:</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary)', margin: '0.25rem 0 1rem' }}>
                ${calculatedTotal.toFixed(2)}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Link to="/orders" className="btn btn-secondary">
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || availableProducts.length === 0 || customers.length === 0}
                >
                  {submitting ? 'Placing Order...' : 'Submit Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
