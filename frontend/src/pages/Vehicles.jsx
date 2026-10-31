import React, { useEffect, useState } from 'react'
import { vehicleApi } from '../api/vehicleApi'
import DashboardLayout from '../components/DashboardLayout'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

const initialForm = { vehicle_number: '', vehicle_type: 'Mini Truck', capacity_kg: '', driver_name: '', driver_phone: '' }

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)

  const loadVehicles = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await vehicleApi.getVehicles()
      const data = res.data?.vehicles || res.data || []
      setVehicles(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to load vehicles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadVehicles() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      await vehicleApi.addVehicle(form)
      setForm(initialForm)
      loadVehicles()
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to add vehicle.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return
    try {
      await vehicleApi.deleteVehicle(id)
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to remove vehicle.')
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>Vehicle Management</h1>
          <p>Register vehicles used for delivering orders to buyers.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="card" style={{ maxWidth: 640, marginBottom: 28 }}>
        <h3 style={{ marginBottom: 16 }}>Add Vehicle</h3>
        <form onSubmit={handleSubmit}>
          <div className="field-row">
            <div className="field">
              <label>Vehicle Number</label>
              <input name="vehicle_number" value={form.vehicle_number} onChange={handleChange} required placeholder="TS 09 AB 1234" />
            </div>
            <div className="field">
              <label>Vehicle Type</label>
              <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange}>
                <option>Mini Truck</option>
                <option>Pickup Van</option>
                <option>Tractor Trolley</option>
                <option>Refrigerated Van</option>
              </select>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Capacity (KG)</label>
              <input type="number" name="capacity_kg" value={form.capacity_kg} onChange={handleChange} required placeholder="1000" />
            </div>
            <div className="field">
              <label>Driver Name</label>
              <input name="driver_name" value={form.driver_name} onChange={handleChange} required placeholder="Suresh" />
            </div>
          </div>
          <div className="field">
            <label>Driver Phone</label>
            <input name="driver_phone" value={form.driver_phone} onChange={handleChange} required placeholder="9876543210" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Vehicle'}
          </button>
        </form>
      </div>

      {loading ? <Loading label="Loading vehicles..." /> : vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="big-emoji">🚚</div>
          <p>No vehicles registered yet.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Vehicle Number</th><th>Type</th><th>Capacity</th><th>Driver</th><th>Phone</th><th></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td>{v.vehicle_number}</td>
                  <td>{v.vehicle_type}</td>
                  <td>{v.capacity_kg} kg</td>
                  <td>{v.driver_name}</td>
                  <td>{v.driver_phone}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(v.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}
