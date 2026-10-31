import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../api/productApi'
import DashboardLayout from '../components/DashboardLayout'
import ErrorMessage from '../components/ErrorMessage'

const initialForm = {
  crop_name: '', quantity: '', price_per_kg: '', harvest_date: '', quality: 'Grade A', description: '',
}

export default function AddProduct() {
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
      await productApi.addProduct(form)
      setSuccess('Product added successfully!')
      setForm(initialForm)
      setTimeout(() => navigate('/farmer/products'), 1000)
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to add product.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>Add Product</h1>
          <p>List a new crop for buyers to discover.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 640 }}>
        <ErrorMessage message={error} />
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Crop Name</label>
              <input name="crop_name" value={form.crop_name} onChange={handleChange} required placeholder="Tomato" />
            </div>
            <div className="field">
              <label>Quality</label>
              <select name="quality" value={form.quality} onChange={handleChange}>
                <option>Grade A</option>
                <option>Grade B</option>
                <option>Organic</option>
                <option>Standard</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Quantity (kg)</label>
              <input type="number" name="quantity" value={form.quantity} onChange={handleChange} required placeholder="500" />
            </div>
            <div className="field">
              <label>Price Per KG (₹)</label>
              <input type="number" step="0.01" name="price_per_kg" value={form.price_per_kg} onChange={handleChange} required placeholder="30" />
            </div>
          </div>

          <div className="field">
            <label>Harvest Date</label>
            <input type="date" name="harvest_date" value={form.harvest_date} onChange={handleChange} required />
          </div>

          <div className="field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Freshly harvested, pesticide-free tomatoes..." />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Product'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}

