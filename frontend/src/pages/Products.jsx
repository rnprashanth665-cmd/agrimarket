import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../api/productApi'
import DashboardLayout from '../components/DashboardLayout'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await productApi.getFarmerProducts()
      const data = res.data?.products || res.data || []
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to load your products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProducts() }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product listing?')) return
    try {
      await productApi.deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to delete product.')
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>My Products</h1>
          <p>Manage the crops you have listed on AgriMarket.</p>
        </div>
        <Link to="/farmer/products/add" className="btn btn-primary">Add Product</Link>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading label="Loading products..." />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="big-emoji">🌱</div>
          <p>You haven't listed any products yet.</p>
          <Link to="/farmer/products/add" className="btn btn-primary" style={{ marginTop: 14 }}>Add your first product</Link>
        </div>
      ) : (
        <div className="grid grid-3">
          {products.map((p) => (
            <div className="product-card" key={p.id}>
              <span className="quality-tag">{p.quality}</span>
              <div className="crop-name">{p.crop_name}</div>
              <div className="meta">
                <span>Quantity: {p.quantity} kg</span>
                <span>Price: ₹{p.price_per_kg}/kg</span>
                <span>Harvested: {p.harvest_date}</span>
              </div>
              {p.description && <p style={{ fontSize: '0.85rem' }}>{p.description}</p>}
              <div className="card-footer">
                <button className="btn btn-outline btn-sm">View</button>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-outline btn-sm">Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
