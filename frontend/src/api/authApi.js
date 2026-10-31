import api from './axios'

export const authApi = {

  // Farmer Login
  loginFarmer: (payload) =>
    api.post('/farmers/login', payload),

  // Buyer Login
  loginBuyer: (payload) =>
    api.post('/buyers/login', payload),

  // Common Login
  login: (payload) => {
    const loginData = {
      email: payload.email,
      password: payload.password,
    }

    return payload.role === 'farmer'
      ? api.post('/farmers/login', loginData)
      : api.post('/buyers/login', loginData)
  },

  // Farmer Registration
  registerFarmer: (payload) =>
    api.post('/farmers/register', payload),

  // Buyer Registration
  registerBuyer: (payload) =>
    api.post('/buyers/register', payload),

  // Farmer Profile
  getFarmerProfile: () =>
    api.get('/farmers/profile'),

  // Buyer Profile
  getBuyerProfile: () =>
    api.get('/buyer/profile'),

  // Update Farmer Profile
  updateFarmerProfile: (payload) =>
    api.put('/farmer/profile', payload),

  // Update Buyer Profile
  updateBuyerProfile: (payload) =>
    api.put('/buyer/profile', payload),

}