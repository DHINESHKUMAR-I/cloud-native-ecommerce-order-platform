import api from './api';

export const customerService = {
  getCustomers: (page = 0, size = 10, sort = 'id,desc') => {
    return api.get(`/api/customers?page=${page}&size=${size}&sort=${sort}`);
  },

  getCustomerById: (id) => {
    return api.get(`/api/customers/${id}`);
  },

  getCustomerByEmail: (email) => {
    return api.get(`/api/customers/email/${encodeURIComponent(email)}`);
  },

  createCustomer: (data) => {
    return api.post('/api/customers', data);
  },

  updateCustomer: (id, data) => {
    return api.put(`/api/customers/${id}`, data);
  },

  deleteCustomer: (id) => {
    return api.delete(`/api/customers/${id}`);
  },
};
