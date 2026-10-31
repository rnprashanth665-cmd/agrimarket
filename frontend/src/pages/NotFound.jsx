import React from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="center-page">
      <div className="big-emoji">🌾</div>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn btn-primary" style={{ marginTop: 12 }}>Back to Home</Link>
    </div>
  )
}
