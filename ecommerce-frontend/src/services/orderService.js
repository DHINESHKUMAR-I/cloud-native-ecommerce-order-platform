import api from './api';

export const orderService = {
  getOrders: (page = 0, size = 10, sort = 'createdAt,desc') => {
    return api.get(`/api/orders?page=${page}&size=${size}&sort=${sort}`);
  },

  getOrderById: (id) => {
    return api.get(`/api/orders/${id}`);
  },

  getOrdersByCustomerId: (customerId, page = 0, size = 10) => {
    return api.get(`/api/orders/customer/${customerId}?page=${page}&size=${size}`);
  },

  createOrder: (data) => {
    return api.post('/api/orders', data);
  },

  updateOrderStatus: (id, status) => {
    return api.put(`/api/orders/${id}/status`, { status });
  },

  cancelOrder: (id) => {
    return api.delete(`/api/orders/${id}`);
  },

  getHealth: async () => {
    return await api.get('/health');
  },
};
