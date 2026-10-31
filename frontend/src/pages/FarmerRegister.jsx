import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../api/authApi'
import ErrorMessage from '../components/ErrorMessage'

const initialForm = {
  name: '', email: '', phone: '', password: '',
  farm_location: '', district: '', state: '', farm_size: '',
}

export default function FarmerRegister() {
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
      await authApi.registerFarmer(form)
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
          <h2>Register as a Farmer</h2>
          <p>List your produce and reach buyers directly</p>
        </div>

        <ErrorMessage message={error} />
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Ramesh Kumar" />
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
            <label>Farm Location</label>
            <input name="farm_location" value={form.farm_location} onChange={handleChange} required placeholder="Village / Town" />
          </div>

          <div className="field-row">
            <div className="field">
              <label>District</label>
              <input name="district" value={form.district} onChange={handleChange} required placeholder="Gadwal" />
            </div>
            <div className="field">
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} required placeholder="Telangana" />
            </div>
          </div>

          <div className="field">
            <label>Farm Size (in acres)</label>
            <input type="number" step="0.1" name="farm_size" value={form.farm_size} onChange={handleChange} required placeholder="2.5" />
          </div>

          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Farmer Account'}
          </button>
        </form>

        <div className="auth-switch">
          Already have an account? <Link to="/login">Login</Link> · Registering as a buyer instead?{' '}
          <Link to="/register/buyer">Register as Buyer</Link>
        </div>
      </div>
    </div>
  )
}
