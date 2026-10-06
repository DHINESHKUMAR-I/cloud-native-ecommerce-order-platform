import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import Alert from '../components/Alert';
import { useNotification } from '../context/NotificationContext';

export default function CreateProduct() {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Product name cannot be blank';
    }
    if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
      errors.price = 'Price must be a valid number greater than 0';
    }
    if (formData.stock === '' || isNaN(formData.stock) || Number(formData.stock) < 0) {
      errors.stock = 'Stock must be a non-negative integer';
    }
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
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
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        category: formData.category.trim(),
      };

      const res = await productService.createProduct(payload);
      showSuccess(`Product "${res.data.name}" created successfully!`);
      navigate(`/products/${res.data.id}`);
    } catch (err) {
      setError(err.userMessage || 'Failed to create product.');
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
          <h1 className="page-title">Create Product</h1>
          <p className="page-subtitle">Add a new item to the platform inventory</p>
        </div>
        <Link to="/products" className="btn btn-secondary">
          ← Cancel
        </Link>
      </div>

      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="card" style={{ maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              name="name"
              className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Ergonomic Office Chair"
              value={formData.name}
              onChange={handleChange}
            />
            {validationErrors.name && <div className="invalid-feedback">{validationErrors.name}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Category *</label>
            <input
              type="text"
              name="category"
              className={`form-control ${validationErrors.category ? 'is-invalid' : ''}`}
              placeholder="e.g. Furniture, Electronics, Accessories"
              value={formData.category}
              onChange={handleChange}
            />
            {validationErrors.category && <div className="invalid-feedback">{validationErrors.category}</div>}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Price (USD) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                name="price"
                className={`form-control ${validationErrors.price ? 'is-invalid' : ''}`}
                placeholder="0.00"
                value={formData.price}
                onChange={handleChange}
              />
              {validationErrors.price && <div className="invalid-feedback">{validationErrors.price}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                step="1"
                name="stock"
                className={`form-control ${validationErrors.stock ? 'is-invalid' : ''}`}
                placeholder="0"
                value={formData.stock}
                onChange={handleChange}
              />
              {validationErrors.stock && <div className="invalid-feedback">{validationErrors.stock}</div>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              name="description"
              rows="4"
              className="form-control"
              placeholder="Detailed description of features and specifications..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating Product...' : 'Save Product'}
            </button>
            <Link to="/products" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
