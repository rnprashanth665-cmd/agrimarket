import React, { useEffect, useMemo, useState } from 'react'
import { productApi } from '../api/productApi'
import { orderApi } from '../api/orderApi'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Marketplace() {
  const { isAuthenticated, role } = useAuth()
  const navigate = useNavigate()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [cropFilter, setCropFilter] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [qualityFilter, setQualityFilter] = useState('')

  const [selectedProduct, setSelectedProduct] = useState(null)
  const [orderQty, setOrderQty] = useState(1)
  const [orderError, setOrderError] = useState('')
  const [orderSubmitting, setOrderSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState('')

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError('')
      try {
        const res = await productApi.getAllProducts()
        const data = res.data?.products || res.data || []
        setProducts(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.friendlyMessage || 'Unable to load products.')
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  const crops = useMemo(() => [...new Set(products.map((p) => p.crop_name).filter(Boolean))], [products])
  const qualities = useMemo(() => [...new Set(products.map((p) => p.quality).filter(Boolean))], [products])

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.crop_name?.toLowerCase().includes(search.toLowerCase())
    const matchesCrop = !cropFilter || p.crop_name === cropFilter
    const matchesQuality = !qualityFilter || p.quality === qualityFilter
    const matchesLocation = !locationFilter || (p.location || p.farmer?.district || '').toLowerCase().includes(locationFilter.toLowerCase())
    const matchesPrice =
      !priceFilter ||
      (priceFilter === 'low' && p.price_per_kg <= 20) ||
      (priceFilter === 'mid' && p.price_per_kg > 20 && p.price_per_kg <= 50) ||
      (priceFilter === 'high' && p.price_per_kg > 50)
    return matchesSearch && matchesCrop && matchesQuality && matchesLocation && matchesPrice
  })

  const handleBuyClick = (product) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (role !== 'buyer') {
      setOrderError('Only buyers can place orders.')
      return
    }
    setSelectedProduct(product)
    setOrderQty(1)
    setOrderError('')
    setOrderSuccess('')
  }

  const totalPrice = selectedProduct ? (Number(orderQty) * Number(selectedProduct.price_per_kg)).toFixed(2) : 0

  const submitOrder = async () => {
    if (!selectedProduct) return
    setOrderSubmitting(true)
    setOrderError('')
    try {
      await orderApi.placeOrder({
        product_id: selectedProduct.product_id,
        quantity: Number(orderQty),
      })
      setOrderSuccess('Order placed successfully!')
      setTimeout(() => {
        setSelectedProduct(null)
        setOrderSuccess('')
      }, 1200)
    } catch (err) {
      setOrderError(err.friendlyMessage || 'Unable to place order.')
    } finally {
      setOrderSubmitting(false)
    }
  }

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-title-row">
          <div>
            <h1>Marketplace</h1>
            <p>Browse fresh produce listed directly by farmers.</p>
          </div>
        </div>

        <div className="filters-bar">
          <input placeholder="Search crop..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={cropFilter} onChange={(e) => setCropFilter(e.target.value)}>
            <option value="">All Crops</option>
            {crops.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}>
            <option value="">All Prices</option>
            <option value="low">Up to ₹20/kg</option>
            <option value="mid">₹20 - ₹50/kg</option>
            <option value="high">Above ₹50/kg</option>
          </select>
          <input placeholder="Location..." value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
          <select value={qualityFilter} onChange={(e) => setQualityFilter(e.target.value)}>
            <option value="">All Quality</option>
            {qualities.map((q) => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>

        <ErrorMessage message={error || orderError} />

        {loading ? (
          <Loading label="Loading products..." />
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="big-emoji">🌾</div>
            <p>No products match your filters right now.</p>
          </div>
        ) : (
          <div className="grid grid-3">
            {filtered.map((product) => (
              <ProductCard key={product.product_id} product={product} onBuy={handleBuyClick} />
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="order-modal-backdrop" onClick={() => !orderSubmitting && setSelectedProduct(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Order {selectedProduct.crop_name}</h3>
            <p style={{ marginTop: 6 }}>₹{selectedProduct.price_per_kg} per kg · {selectedProduct.quantity} kg available</p>

            {orderSuccess && <div className="alert alert-success" style={{ marginTop: 16 }}>{orderSuccess}</div>}
            {orderError && <div className="alert alert-error" style={{ marginTop: 16 }}>{orderError}</div>}

            <div className="field" style={{ marginTop: 16 }}>
              <label>Quantity (kg)</label>
              <input
                type="number"
                min="1"
                max={selectedProduct.quantity}
                value={orderQty}
                onChange={(e) => setOrderQty(e.target.value)}
              />
            </div>

            <div className="total-line">
              <span>Total Price</span>
              <span>₹{totalPrice}</span>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline btn-block" onClick={() => setSelectedProduct(null)} disabled={orderSubmitting}>
                Cancel
              </button>
              <button className="btn btn-primary btn-block" onClick={submitOrder} disabled={orderSubmitting}>
                {orderSubmitting ? 'Placing order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
