import React, { useEffect, useState } from 'react'
import { deliveryApi } from '../api/deliveryApi'
import { vehicleApi } from '../api/vehicleApi'
import DashboardLayout from '../components/DashboardLayout'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import StatusBadge from '../components/StatusBadge'

const STAGES = ['Assigned', 'Picked Up', 'In Transit', 'Delivered']

const initialForm = { order_id: '', vehicle_id: '', pickup_location: '', delivery_location: '' }

function DeliveryTimeline({ status, onAdvance }) {
  const currentIndex = STAGES.findIndex((s) => s.toLowerCase().replace(' ', '_') === status?.toLowerCase())
  return (
    <div>
      <div className="timeline">
        {STAGES.map((stage, i) => {
          const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : ''
          return (
            <div className={`timeline-step ${state}`} key={stage}>
              <span className="timeline-line" />
              <div className="circle">{i + 1}</div>
              <div className="label">{stage}</div>
            </div>
          )
        })}
      </div>
      {currentIndex === STAGES.length - 1 ? (
        <div className="alert alert-success">Delivery Completed</div>
      ) : (
        <button className="btn btn-primary btn-sm" onClick={() => onAdvance(STAGES[currentIndex + 1])}>
          Mark as {STAGES[currentIndex + 1] || 'Delivered'}
        </button>
      )}
    </div>
  )
}

export default function Deliveries() {
  const [deliveries, setDeliveries] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [deliveryRes, vehicleRes] = await Promise.all([
        deliveryApi.getDeliveries(),
        vehicleApi.getVehicles(),
      ])
      setDeliveries(deliveryRes.data?.deliveries || deliveryRes.data || [])
      setVehicles(vehicleRes.data?.vehicles || vehicleRes.data || [])
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to load deliveries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await deliveryApi.assignDelivery(form)
      setForm(initialForm)
      loadData()
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to assign delivery.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdvance = async (deliveryId, nextStatus) => {
    try {
      await deliveryApi.updateDeliveryStatus(deliveryId, nextStatus.toLowerCase().replace(' ', '_'))
      loadData()
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to update delivery status.')
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>Delivery Management</h1>
          <p>Assign vehicles to orders and track delivery progress.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="card" style={{ maxWidth: 640, marginBottom: 28 }}>
        <h3 style={{ marginBottom: 16 }}>Assign Delivery</h3>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Order ID</label>
              <input name="order_id" value={form.order_id} onChange={handleChange} required placeholder="e.g. 102" />
            </div>
            <div className="field">
              <label>Vehicle</label>
              <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>
                    {v.vehicle_number} ({v.vehicle_type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Pickup Location</label>
              <input name="pickup_location" value={form.pickup_location} onChange={handleChange} required placeholder="Ramapuram, Gadwal" />
            </div>
            <div className="field">
              <label>Delivery Location</label>
              <input name="delivery_location" value={form.delivery_location} onChange={handleChange} required placeholder="Vijayawada, AP" />
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Assigning...' : 'Assign Delivery'}
          </button>
        </form>
      </div>

      {loading ? <Loading label="Loading deliveries..." /> : deliveries.length === 0 ? (
        <div className="empty-state">
          <div className="big-emoji">📦</div>
          <p>No deliveries assigned yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {deliveries.map((d) => (
            <div className="card" key={d.id}>
              <div className="page-title-row" style={{ marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem' }}>Delivery #{d.id} · Order #{d.order_id}</h3>
                  <p>{d.pickup_location} → {d.delivery_location} · Vehicle {d.vehicle_number || d.vehicle_id}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <DeliveryTimeline status={d.status} onAdvance={(next) => handleAdvance(d.id, next)} />
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}
