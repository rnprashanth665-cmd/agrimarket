import api from './axios'

export const aiApi = {
  getDemandForecast: () => api.get('/ai/demand-forecast'),
  getPricePrediction: () => api.get('/ai/price-prediction'),
  getRouteOptimization: () => api.get('/ai/route-optimization'),
  getDashboard: () => api.get('/ai/dashboard'),
}
