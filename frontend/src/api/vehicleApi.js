import api from './axios'

export const vehicleApi = {
  // Get all vehicles
  getVehicles: () =>
    api.get('/vehicles'),

  // Add vehicle
  addVehicle: (payload) =>
    api.post('/vehicles', null, {
      params: payload,
    }),

  // Delete vehicle
  deleteVehicle: (id) =>
    api.delete(`/vehicles/${id}`),
}