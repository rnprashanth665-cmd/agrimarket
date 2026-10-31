import React, { useState } from 'react'
import Sidebar from './Sidebar'

/**
 * Shared shell for Farmer and Buyer dashboards.
 * Renders the sidebar + main content area, with a hamburger toggle on mobile.
 */
export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="dashboard-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      <main className="dashboard-main">
        <div className="mobile-topbar">
          <button onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle menu">☰ Menu</button>
        </div>
        {children}
      </main>
    </div>
  )
}
