import React from 'react'
import { Link } from 'react-router-dom'

export default function Unauthorized() {
  return (
    <div className="center-page">
      <div className="big-emoji">🚫</div>
      <h2>Access restricted</h2>
      <p>This section isn't available for your account type.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Back to Home</Link>
    </div>
  )
}
