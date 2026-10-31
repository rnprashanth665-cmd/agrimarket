import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import ErrorMessage from '../components/ErrorMessage'

const initialForm = {
  name: '', email: '', phone: '', password: '',
  business_name: '', buyer_type: 'Retailer', location: '',
}

export default function BuyerRegister() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      await authApi.registerBuyer(form)
      setSuccess('Registration successful! Redirecting to login...')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err.friendlyMessage || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card wide">
        <div className="auth-head">
          <h2>Register as a Buyer</h2>
          <p>Source fresh produce directly from farmers</p>
        </div>

        <ErrorMessage message={error} />
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Priya Sharma" />
            </div>
            <div className="field">
              <label>Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="9876543210" />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required placeholder="••••••••" />
            </div>
          </div>

          <div className="field">
            <label>Business Name</label>
            <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder="Sharma Fresh Traders" />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Buyer Type</label>
              <select name="buyer_type" value={form.buyer_type} onChange={handleChange}>
                <option>Retailer</option>
                <option>Wholesaler</option>
                <option>Restaurant</option>
                <option>Distributor</option>
                <option>Consumer</option>
              </select>
            </div>
            <div className="field">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} required placeholder="Vijayawada" />
            </div>
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Buyer Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link> · Registering as a farmer instead?{' '}
          <Link to="/register/farmer">Register as Farmer</Link>
        </div>
      </div>
    </div>
  )
}
