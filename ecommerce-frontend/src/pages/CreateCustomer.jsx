import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import Alert from '../components/Alert';
import { useNotification } from '../context/NotificationContext';

export default function CreateCustomer() {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Customer name cannot be blank';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      };

      const res = await customerService.createCustomer(payload);
      showSuccess(`Customer "${res.data.name}" registered successfully!`);
      navigate(`/customers/${res.data.id}`);
    } catch (err) {
      setError(err.userMessage || 'Failed to create customer.');
      if (err.response?.data?.validationErrors) {
        setValidationErrors(err.response.data.validationErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Register Customer</h1>
          <p className="page-subtitle">Add a new customer account to the platform</p>
        </div>
        <Link to="/customers" className="btn btn-secondary">
          ← Cancel
        </Link>
      </div>

      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="card" style={{ maxWidth: '600px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Johnathan Smith"
              value={formData.name}
              onChange={handleChange}
            />
            {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
              placeholder="e.g. john@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {validationErrors.email && <div className="invalid-feedback">{validationErrors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number *</label>
            <input
              type="text"
              name="phone"
              className={`form-control ${validationErrors.phone ? 'is-invalid' : ''}`}
              placeholder="e.g. +1 555-0123"
              value={formData.phone}
              onChange={handleChange}
            />
            {validationErrors.phone && <div className="invalid-feedback">{validationErrors.phone}</div>}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Customer'}
            </button>
            <Link to="/customers" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
