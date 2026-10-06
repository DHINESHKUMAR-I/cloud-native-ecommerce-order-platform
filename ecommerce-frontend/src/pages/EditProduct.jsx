import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNotification } from '../context/NotificationContext';

export default function EditProduct() {
  const { id } = useParams();
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductById(id);
      setFormData({
        name: res.data.name || '',
        description: res.data.description || '',
        price: res.data.price?.toString() || '',
        stock: res.data.stock?.toString() || '',
        category: res.data.category || '',
      });
    } catch (err) {
      setError(err.userMessage || `Failed to load product #${id}.`);
    } finally {
      setLoading(false);
    }
  };

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

      const res = await productService.updateProduct(id, payload);
      showSuccess(`Product "${res.data.name}" updated successfully!`);
      navigate(`/products/${id}`);
    } catch (err) {
      setError(err.userMessage || 'Failed to update product.');
      if (err.response?.data?.validationErrors) {
        setValidationErrors(err.response.data.validationErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading product #${id}...`} />;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Edit Product #{id}</h1>
          <p className="page-subtitle">Update pricing, description, inventory, and category</p>
        </div>
        <Link to={`/products/${id}`} className="btn btn-secondary">
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
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving Changes...' : 'Update Product'}
            </button>
            <Link to={`/products/${id}`} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
