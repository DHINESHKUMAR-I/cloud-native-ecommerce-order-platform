import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { notification, showSuccess, showError, clearNotification } = useNotification();

  useEffect(() => {
    fetchProducts();
  }, [page, selectedCategory, onlyAvailable]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      let res;
      if (searchTerm.trim()) {
        res = await productService.searchProductsByName(searchTerm.trim(), page, 10);
      } else if (selectedCategory) {
        res = await productService.getProductsByCategory(selectedCategory, page, 10);
      } else if (onlyAvailable) {
        res = await productService.getAvailableProducts(page, 10);
      } else {
        res = await productService.getProducts(page, 10, 'id,desc');
      }

      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setOnlyAvailable(false);
    setPage(0);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) {
      return;
    }

    try {
      await productService.deleteProduct(id);
      showSuccess(`Product "${name}" deleted successfully.`);
      fetchProducts();
    } catch (err) {
      showError(err.userMessage || 'Failed to delete product.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Catalog</h1>
          <p className="page-subtitle">Manage catalog items, pricing, inventory stock, and categories</p>
        </div>
        <Link to="/products/new" className="btn btn-primary">
          + Add New Product
        </Link>
      </div>

      <Alert type={notification?.type} message={notification?.message} onClose={clearNotification} />
      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="card">
        <form onSubmit={handleSearchSubmit} className="filter-bar">
          <input
            type="text"
            className="form-control filter-input"
            placeholder="Search by product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="form-control"
            style={{ width: '180px' }}
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(0);
            }}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Accessories">Accessories</option>
            <option value="Office">Office</option>
            <option value="Audio">Audio</option>
            <option value="Home">Home</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => {
                setOnlyAvailable(e.target.checked);
                setPage(0);
              }}
            />
            In Stock Only
          </label>
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
          {(searchTerm || selectedCategory || onlyAvailable) && (
            <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
              Reset
            </button>
          )}
        </form>

        {loading ? (
          <LoadingSpinner message="Loading catalog products..." />
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Try modifying your search filter or add a new product.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>#{p.id}</td>
                      <td>
                        <strong>
                          <Link to={`/products/${p.id}`} style={{ color: 'var(--primary)' }}>
                            {p.name}
                          </Link>
                        </strong>
                        {p.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {p.description.length > 60 ? p.description.substring(0, 60) + '...' : p.description}
                          </div>
                        )}
                      </td>
                      <td>{p.category}</td>
                      <td>${Number(p.price).toFixed(2)}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: p.stock > 0 ? 'var(--text-main)' : 'var(--danger)' }}>
                          {p.stock} units
                        </span>
                      </td>
                      <td>
                        {p.stock > 0 ? (
                          <span className="badge-status badge-delivered">In Stock</span>
                        ) : (
                          <span className="badge-status badge-cancelled">Out of Stock</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/products/${p.id}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                          <Link to={`/products/${p.id}/edit`} className="btn btn-secondary btn-sm">
                            Edit
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p.id, p.name)}
                          >
                            Delete
                          </button>
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
