import React from 'react'

const LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  delivered: 'Delivered',
  assigned: 'Assigned',
  picked_up: 'Picked Up',
  in_transit: 'In Transit',
}

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase().replace(/\s+/g, '_')
  const label = LABELS[key] || status
  return <span className={`badge badge-${key}`}>{label}</span>
}
