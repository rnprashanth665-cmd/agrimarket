import React from 'react'

export default function StatCard({ icon, value, label }) {
  return (
    <div className="stat-card">
      <div className="icon">{icon}</div>
      <div>
        <div className="num">{value}</div>
        <div className="lbl">{label}</div>
      </div>
    </div>
  )
}
