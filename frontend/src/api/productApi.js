import api from './axios'

export const productApi = {

  // Get all products
  getAllProducts: (params) =>
    api.get('/products', { params }),

  // Get farmer's products
  getFarmerProducts: () =>
    api.get('/products'),

  // Get product by ID
  getProductById: (id) =>
    api.get(`/products/${id}`),

  // Add product
  addProduct: (payload) =>
    api.post('/products', payload),

  // Update product
  updateProduct: (id, payload) =>
    api.put(`/products/${id}`, payload),

  // Delete product
  deleteProduct: (id) =>
    api.delete(`/products/${id}`),

}