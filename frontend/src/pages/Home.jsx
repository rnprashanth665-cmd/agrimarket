import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { productApi } from '../api/productApi'
import StatCard from '../components/StatCard'

const FEATURES = [
  { icon: '🌾', title: 'Direct Farmer Sales', text: 'Farmers list produce and sell straight to buyers, without layers of middlemen taking a cut.' },
  { icon: '💰', title: 'Better Prices', text: 'Removing unnecessary intermediaries means farmers earn more and buyers pay less.' },
  { icon: '🚚', title: 'Smart Logistics', text: 'Vehicle assignment and live delivery tracking keep produce moving from farm to buyer.' },
  { icon: '🤖', title: 'AI-Powered Insights', text: 'Demand forecasts, price predictions and route optimization guide every decision.' },
]

const PROBLEMS = [
  'Multiple intermediaries between farm and market reduce farmer earnings',
  'Consumers and bulk buyers end up paying inflated prices',
  'Supply chain information stays fragmented across disconnected parties',
  'Farmers lack a direct channel to reach buyers and negotiate fairly',
]

const AI_FEATURES = [
  { title: 'Demand Forecasting', text: 'Predicts next-day demand in kilograms so farmers know how much to bring to market.' },
  { title: 'Crop Price Prediction', text: 'Estimates a fair market price per kilogram for each crop, updated continuously.' },
  { title: 'Route Optimization', text: 'Calculates the most efficient pickup-to-destination route for every delivery.' },
]

export default function Home() {
  const [stats, setStats] = useState({ farmers: null, buyers: null, products: null, orders: null })

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await productApi.getAllProducts()
        const products = res.data?.products || res.data || []
        setStats((s) => ({ ...s, products: Array.isArray(products) ? products.length : '—' }))
      } catch {
        setStats((s) => ({ ...s, products: '—' }))
      }
    }
    loadStats()
  }, [])

  return (
    <div>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">SIH 2026 · Agricultural Marketplace</div>
            <h1>Connecting Farmers Directly With Buyers</h1>
            <p className="lead">
              AgriMarket connects farmers directly with consumers and bulk buyers, reducing
              unnecessary intermediaries and improving transparency across the agricultural
              supply chain.
            </p>
            <div className="hero-actions">
              <Link to="/marketplace" className="btn btn-primary">Explore Marketplace</Link>
              <Link to="/register/farmer" className="btn btn-outline">Join as Farmer</Link>
            </div>
          </div>

          <div className="hero-art">
            <strong style={{ fontSize: '0.95rem' }}>From Farm to Buyer</strong>
            <div className="flow">
              <div className="flow-node">🌱 Farmer</div>
              <span className="flow-arrow">→</span>
              <div className="flow-node">🌾 AgriMarket</div>
              <span className="flow-arrow">→</span>
              <div className="flow-node">🛒 Buyer</div>
            </div>
            <div className="hero-art-stats">
              <div><div className="num">Real-time</div><div className="lbl">Order tracking</div></div>
              <div><div className="num">AI-driven</div><div className="lbl">Price & demand</div></div>
              <div><div className="num">Direct</div><div className="lbl">Farmer-to-buyer</div></div>
              <div><div className="num">Live</div><div className="lbl">Delivery status</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Built for a transparent supply chain</h2>
            <p>Everything a farmer and a buyer need, in one platform.</p>
          </div>
          <div className="grid grid-4">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="section section-alt">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <div className="section-head" style={{ marginBottom: 0 }}>
                <h2>Reducing Intermediaries in the Agricultural Supply Chain</h2>
              </div>
              <div className="problem-list">
                {PROBLEMS.map((p) => (
                  <div className="problem-item" key={p}>
                    <span className="problem-dot" />
                    <p>{p}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 style={{ marginBottom: 12 }}>One Digital Marketplace</h3>
              <p>A single place where every farmer and buyer transaction happens transparently.</p>
              <div className="flow-diagram">
                <div className="flow-box">Farmer</div>
                <span className="flow-sep">→</span>
                <div className="flow-box">AgriMarket</div>
                <span className="flow-sep">→</span>
                <div className="flow-box">Buyer</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI SECTION */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>AI That Works for the Whole Supply Chain</h2>
            <p>Data-driven decisions for farmers, buyers and logistics alike.</p>
          </div>
          <div className="grid grid-3">
            {AI_FEATURES.map((f) => (
              <div className="ai-card" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <Link to="/ai" className="btn btn-outline">View AI Insights</Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <h2>AgriMarket at a glance</h2>
          </div>
          <div className="grid grid-4">
            <StatCard icon="🌱" value="Growing" label="Registered Farmers" />
            <StatCard icon="🛒" value="Growing" label="Registered Buyers" />
            <StatCard icon="📦" value={stats.products ?? '...'} label="Products Listed" />
            <StatCard icon="🧾" value="Live" label="Orders Processed" />
          </div>
        </div>
      </section>
    </div>
  )
}
