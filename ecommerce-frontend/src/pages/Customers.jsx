import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerService } from '../services/customerService';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Pagination from '../components/Pagination';
import { useNotification } from '../context/NotificationContext';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const { notification, showSuccess, showError, clearNotification } = useNotification();

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomers(page, 10, 'id,desc');
      setCustomers(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setError(err.userMessage || 'Failed to fetch customers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByEmail = async (e) => {
    e.preventDefault();
    if (!searchEmail.trim()) {
      fetchCustomers();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await customerService.getCustomerByEmail(searchEmail.trim());
      setCustomers([res.data]);
      setTotalPages(1);
      setTotalElements(1);
    } catch (err) {
      setCustomers([]);
      setTotalElements(0);
      setError(err.userMessage || `No customer found with email "${searchEmail}".`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) {
      return;
    }

    try {
      await customerService.deleteCustomer(id);
      showSuccess(`Customer "${name}" deleted successfully.`);
      fetchCustomers();
    } catch (err) {
      showError(err.userMessage || 'Failed to delete customer.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer Directory</h1>
          <p className="page-subtitle">View and manage registered platform customers</p>
        </div>
        <Link to="/customers/new" className="btn btn-primary">
          + Register Customer
        </Link>
      </div>

      <Alert type={notification?.type} message={notification?.message} onClose={clearNotification} />
      <Alert type="danger" message={error} onClose={() => setError(null)} />

      <div className="card">
        <form onSubmit={handleSearchByEmail} className="filter-bar">
          <input
            type="email"
            className="form-control filter-input"
            placeholder="Search by exact email address..."
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
          {searchEmail && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchEmail('');
                setPage(0);
                fetchCustomers();
              }}
            >
              Reset
            </button>
          )}
        </form>

        {loading ? (
          <LoadingSpinner message="Loading customer directory..." />
        ) : customers.length === 0 ? (
          <div className="empty-state">
            <h3>No customers found</h3>
            <p>Register a new customer to begin placing orders.</p>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Registered On</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>
                        <strong>
                          <Link to={`/customers/${c.id}`} style={{ color: 'var(--primary)' }}>
                            {c.name}
                          </Link>
                        </strong>
                      </td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/customers/${c.id}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(c.id, c.name)}
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
