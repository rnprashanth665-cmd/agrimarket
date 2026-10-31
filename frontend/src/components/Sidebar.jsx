import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const FARMER_LINKS = [
  { to: '/farmer/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/farmer/products', label: 'My Products', icon: '🌱' },
  { to: '/farmer/products/add', label: 'Add Product', icon: '➕' },
  { to: '/farmer/orders', label: 'Orders', icon: '🧾' },
  { to: '/farmer/vehicles', label: 'Vehicles', icon: '🚚' },
  { to: '/farmer/deliveries', label: 'Deliveries', icon: '📦' },
  { to: '/ai', label: 'AI Insights', icon: '🤖' },
  { to: '/profile', label: 'Profile', icon: '👤' },
]

const BUYER_LINKS = [
  { to: '/buyer/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/marketplace', label: 'Marketplace', icon: '🛒' },
  { to: '/buyer/orders', label: 'My Orders', icon: '🧾' },
  { to: '/profile', label: 'Profile', icon: '👤' },
  { to: '/ai', label: 'AI Insights', icon: '🤖' },
]

export default function Sidebar({ open, onNavigate }) {
  const { role, logout } = useAuth()
  const navigate = useNavigate()
  const links = role === 'farmer' ? FARMER_LINKS : BUYER_LINKS

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="sidebar-section-label">{role === 'farmer' ? 'Farmer Panel' : 'Buyer Panel'}</div>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={onNavigate}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="icon">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
      <hr />
      <button className="logout-link" onClick={handleLogout}>
        <span className="icon">🚪</span>
        Logout
      </button>
    </aside>
  )
}
