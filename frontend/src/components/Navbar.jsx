import React, { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const dashboardPath = role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'

  return (
    <header className="navbar">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-mark">🌾</span>
          AgriMarket
        </Link>

        <nav className={`nav-links ${open ? '' : 'closed'}`}>
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/marketplace" onClick={() => setOpen(false)}>Marketplace</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/ai" onClick={() => setOpen(false)}>AI Insights</NavLink>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/register/farmer" onClick={() => setOpen(false)}>Register</NavLink>
            </>
          ) : (
            <>
              <NavLink to={dashboardPath} onClick={() => setOpen(false)}>Dashboard</NavLink>
              <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout() }}>Logout</a>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" style={{ display: 'none' }}>Login</Link>
              <Link to="/register/farmer" className="btn btn-primary btn-sm">Join as Farmer</Link>
            </>
          ) : null}
          <button className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Toggle navigation">
            ☰
          </button>
        </div>
      </div>
    </header>
  )
}
