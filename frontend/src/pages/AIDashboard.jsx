import React, { useEffect, useState } from 'react'
import { aiApi } from '../api/aiApi'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function AIDashboard() {
  const { isAuthenticated } = useAuth()
  const [demand, setDemand] = useState(null)
  const [price, setPrice] = useState(null)
  const [route, setRoute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadInsights() {
      setLoading(true)
      setError('')
      try {
        const [demandRes, priceRes, routeRes] = await Promise.all([
          aiApi.getDemandForecast(),
          aiApi.getPricePrediction(),
          aiApi.getRouteOptimization(),
        ])
        setDemand(demandRes.data)
        setPrice(priceRes.data)
        setRoute(routeRes.data)
      } catch (err) {
        setError(err.friendlyMessage || 'Generating AI insights failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadInsights()
  }, [])

  const content = (
    <>
      <div className="ai-hero">
        <h1 style={{ color: '#fff' }}>AgriMarket AI Intelligence</h1>
        <p>Live demand, price and logistics predictions powering every decision on AgriMarket.</p>
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <Loading label="Generating AI insights..." />
      ) : (
        <div className="grid grid-3">
          <div className="ai-metric-card">
            <div className="tag">Demand Forecasting</div>
            <div className="big-num">{demand?.predicted_demand_kg ?? '—'} KG</div>
            <p>Predicted next-day demand</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, (demand?.predicted_demand_kg || 0) / 5)}%` }} />
            </div>
          </div>

          <div className="ai-metric-card">
            <div className="tag">Crop Price Prediction</div>
            <div className="big-num">₹{price?.predicted_price_per_kg ?? '—'} / KG</div>
            <p>Crop: {price?.crop ?? '—'}</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, (price?.predicted_price_per_kg || 0) * 1.5)}%` }} />
            </div>
          </div>

          <div className="ai-metric-card">
            <div className="tag">Smart Route Optimization</div>
            <div className="big-num">{route?.distance_km ?? '—'} KM</div>
            <div className="route-line"><span className="dot" /> Pickup: {route?.pickup ?? '—'}</div>
            <div className="route-line"><span className="dot end" /> Destination: {route?.destination ?? '—'}</div>
          </div>
        </div>
      )}
    </>
  )

  // Show inside the dashboard shell for logged-in users, plain page otherwise.
  if (isAuthenticated) {
    return <DashboardLayout>{content}</DashboardLayout>
  }
  return <div className="page-shell"><div className="container">{content}</div></div>
}
