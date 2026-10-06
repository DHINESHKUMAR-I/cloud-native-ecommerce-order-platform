import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import { useNotification } from '../context/NotificationContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await productService.getProductById(id);
      setProduct(res.data);
    } catch (err) {
      setError(err.userMessage || `Failed to load product #${id}.`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete product "${product.name}"?`)) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      showSuccess(`Product "${product.name}" was deleted successfully.`);
      navigate('/products');
    } catch (err) {
      showError(err.userMessage || 'Failed to delete product.');
    }
  };

  if (loading) {
    return <LoadingSpinner message={`Loading product #${id}...`} />;
  }

  if (error || !product) {
    return (
      <div>
        <Alert type="danger" message={error || 'Product not found'} />
        <Link to="/products" className="btn btn-secondary">
          ← Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{product.name}</h1>
          <p className="page-subtitle">Product ID: #{product.id} • Category: {product.category}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/products/${id}/edit`} className="btn btn-primary">
            Edit Product
          </Link>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
          <Link to="/products" className="btn btn-secondary">
            ← Back to Products
          </Link>
        </div>
      </div>

      <div className="card" style={{ maxWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <span className="stat-label">Unit Price</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)', marginTop: '0.25rem' }}>
              ${Number(product.price).toFixed(2)}
            </div>
          </div>
          <div>
            <span className="stat-label">Inventory Stock</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: product.stock > 0 ? 'var(--success)' : 'var(--danger)' }}>
              {product.stock} units {product.stock > 0 ? '(In Stock)' : '(Out of Stock)'}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <span className="stat-label">Description</span>
          <p style={{ marginTop: '0.35rem', lineHeight: 1.6 }}>
            {product.description || 'No description provided.'}
          </p>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>
            <strong>Created:</strong> {new Date(product.createdAt).toLocaleString()}
          </div>
          <div>
            <strong>Last Updated:</strong> {new Date(product.updatedAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
