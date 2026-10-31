import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import ErrorMessage from '../components/ErrorMessage'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', role: 'farmer' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      console.log("LOGIN FORM:", {
  email: form.email,
  role: form.role,
  passwordLength: form.password.length,
})
      const res = await authApi.login(form)
      const data = res.data
      login({
        token: data.access_token || data.token,
        role: data.role || form.role,
        user_id: data.user_id || data.id,
        name: data.name,
      })
      navigate(form.role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard')
    } catch (err) {
      setError(err.friendlyMessage || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-head">
          <h2>Welcome back</h2>
          <p>Login to manage your AgriMarket account</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Login as</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-switch">
          New to AgriMarket? <Link to="/register/farmer">Register as Farmer</Link> or{' '}
          <Link to="/register/buyer">Register as Buyer</Link>
        </div>
      </div>
    </div>
  )
}
