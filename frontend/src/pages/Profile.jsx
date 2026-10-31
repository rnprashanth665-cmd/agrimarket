import React, { useEffect, useState } from 'react'
import { authApi } from '../api/authApi'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function Profile() {
  const { role, logout } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)

  const loadProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const res = role === 'farmer' ? await authApi.getFarmerProfile() : await authApi.getBuyerProfile()
      setProfile(res.data)
      setForm(res.data)
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to load profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProfile() }, [role])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = role === 'farmer' ? await authApi.updateFarmerProfile(form) : await authApi.updateBuyerProfile(form)
      setProfile(res.data)
      setEditing(false)
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to update profile.')
    } finally {
      setSaving(false)
    }
  }

  const initial = (profile?.name || '?').charAt(0).toUpperCase()

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>Profile</h1>
          <p>Manage your account details.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loading label="Loading profile..." /> : profile && (
        <div className="card" style={{ maxWidth: 620 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
            <div className="avatar-circle">{initial}</div>
            <div>
              <h3>{profile.name}</h3>
              <span className="role-pill">{role === 'farmer' ? 'Farmer' : 'Buyer'}</span>
            </div>
          </div>

          {!editing ? (
            <>
              <div className="profile-grid">
                <div className="profile-field"><div className="k">Email</div><div className="v">{profile.email}</div></div>
                <div className="profile-field"><div className="k">Phone</div><div className="v">{profile.phone}</div></div>

                {role === 'farmer' ? (
                  <>
                    <div className="profile-field"><div className="k">Farm Location</div><div className="v">{profile.farm_location}</div></div>
                    <div className="profile-field"><div className="k">District</div><div className="v">{profile.district}</div></div>
                    <div className="profile-field"><div className="k">State</div><div className="v">{profile.state}</div></div>
                    <div className="profile-field"><div className="k">Farm Size</div><div className="v">{profile.farm_size} acres</div></div>
                  </>
                ) : (
                  <>
                    <div className="profile-field"><div className="k">Business Name</div><div className="v">{profile.business_name}</div></div>
                    <div className="profile-field"><div className="k">Buyer Type</div><div className="v">{profile.buyer_type}</div></div>
                    <div className="profile-field"><div className="k">Location</div><div className="v">{profile.location}</div></div>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
                <button className="btn btn-outline" onClick={logout}>Logout</button>
              </div>
            </>
          ) : (
            <form onSubmit={handleSave}>
              <div className="field-row">
                <div className="field"><label>Name</label><input name="name" value={form.name || ''} onChange={handleChange} /></div>
                <div className="field"><label>Phone</label><input name="phone" value={form.phone || ''} onChange={handleChange} /></div>
              </div>

              {role === 'farmer' ? (
                <>
                  <div className="field"><label>Farm Location</label><input name="farm_location" value={form.farm_location || ''} onChange={handleChange} /></div>
                  <div className="field-row">
                    <div className="field"><label>District</label><input name="district" value={form.district || ''} onChange={handleChange} /></div>
                    <div className="field"><label>State</label><input name="state" value={form.state || ''} onChange={handleChange} /></div>
                  </div>
                  <div className="field"><label>Farm Size</label><input name="farm_size" value={form.farm_size || ''} onChange={handleChange} /></div>
                </>
              ) : (
                <>
                  <div className="field"><label>Business Name</label><input name="business_name" value={form.business_name || ''} onChange={handleChange} /></div>
                  <div className="field"><label>Location</label><input name="location" value={form.location || ''} onChange={handleChange} /></div>
                </>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline" type="button" onClick={() => setEditing(false)} disabled={saving}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
