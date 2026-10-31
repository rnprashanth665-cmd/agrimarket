import axios from 'axios'

// Centralized Axios instance for all AgriMarket API calls.
export const BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach JWT token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Handle API errors
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail

    let message = Array.isArray(detail)
      ? detail.map((item) => {
          const location = Array.isArray(item.loc)
            ? item.loc.filter((part) => part !== 'body').join('.')
            : ''
          const description = item.msg || 'Invalid value'
          return location ? `${location}: ${description}` : description
        }).join('; ')
      : typeof detail === 'string'
        ? detail
        : error.message || 'Something went wrong.'

    if (status === 401) {

      // If 401 happens during LOGIN,
      // it means the credentials are invalid.
      if (window.location.pathname.includes('/login')) {

        message =
          error.response?.data?.detail ||
          'Invalid email or password.'

      } else {

        // 401 after login = session/token problem
        message = 'Your session has expired. Please login again.'

        localStorage.removeItem('token')
        localStorage.removeItem('role')
        localStorage.removeItem('user_id')
        localStorage.removeItem('user_name')

        window.location.href = '/login'
      }

    } else if (status === 403) {

      message =
        error.response?.data?.detail ||
        'You are not allowed to perform this action.'

    } else if (status === 404) {

      message =
        error.response?.data?.detail ||
        'The requested resource was not found.'

    } else if (status === 400) {

      message =
        error.response?.data?.detail ||
        'Invalid request. Please check your input.'

    } else if (status === 500) {

      message = 'Server error. Please try again later.'

    } else if (!error.response) {

      message =
        'Unable to connect to server. Please check your connection.'
    }

    return Promise.reject({
      ...error,
      friendlyMessage: message,
    })
  }
)

export default api