import api from './axios'

export const deliveryApi = {

  // Get all deliveries
  getDeliveries: () =>
    api.get('/deliveries'),

  // Assign delivery
 assignDelivery: (payload) =>
  api.post('/deliveries', null, {
    params: payload,
  }),

  // Update delivery status
  updateDeliveryStatus: (id, status) =>
    api.put(`/deliveries/${id}/status`, {
      status,
    }),

  // Get delivery by ID
  getDeliveryById: (id) =>
    api.get(`/deliveries/${id}`),

}