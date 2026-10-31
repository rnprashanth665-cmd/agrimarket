import api from './axios'

export const orderApi = {

  // Buyer places an order
  placeOrder: (payload) =>
    api.post('/orders', payload),

  // Buyer views own orders
  getBuyerOrders: () =>
    api.get('/orders/my-orders'),

  // Buyer reviews a delivered order
  submitReview: (orderId, payload) =>
    api.post(`/orders/${orderId}/review`, payload),

  // Farmer views received orders
  getFarmerOrders: () =>
    api.get('/farmer/orders'),

  // Farmer accepts an order
  acceptOrder: (orderId) =>
    api.put(`/farmer/orders/${orderId}/status`, {
      status: 'Accepted',
    }),

  // Farmer rejects an order
  rejectOrder: (orderId) =>
    api.put(`/farmer/orders/${orderId}/status`, {
      status: 'Rejected',
    }),

  // Get order by ID
  getOrderById: (orderId) =>
    api.get(`/orders/${orderId}`),
}