import api from './api';

export const productService = {
  getProducts: (page = 0, size = 10, sort = 'id,desc') => {
    return api.get(`/api/products?page=${page}&size=${size}&sort=${sort}`);
  },

  getProductById: (id) => {
    return api.get(`/api/products/${id}`);
  },

  createProduct: (data) => {
    return api.post('/api/products', data);
  },

  updateProduct: (id, data) => {
    return api.put(`/api/products/${id}`, data);
  },

  deleteProduct: (id) => {
    return api.delete(`/api/products/${id}`);
  },

  searchProductsByName: (name, page = 0, size = 10) => {
    return api.get(`/api/products/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
  },

  getProductsByCategory: (category, page = 0, size = 10) => {
    return api.get(`/api/products/category/${encodeURIComponent(category)}&page=${page}&size=${size}`);
  },

  getAvailableProducts: (page = 0, size = 100) => {
    return api.get(`/api/products/available?page=${page}&size=${size}`);
  },
};
