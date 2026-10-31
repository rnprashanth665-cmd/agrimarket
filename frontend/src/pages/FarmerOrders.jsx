import React, { useEffect, useState } from 'react'
import { orderApi } from '../api/orderApi'
import DashboardLayout from '../components/DashboardLayout'
import OrderTable from '../components/OrderTable'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function FarmerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await orderApi.getFarmerOrders()
      const data = res.data?.orders || res.data || []
      setOrders(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadOrders() }, [])

  const handleAccept = async (orderId) => {
    try {
      await orderApi.acceptOrder(orderId)
      loadOrders()
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to accept order.')
    }
  }

  const handleReject = async (orderId) => {
    try {
      await orderApi.rejectOrder(orderId)
      loadOrders()
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to reject order.')
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>Orders Received</h1>
          <p>Accept or reject incoming orders from buyers.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loading label="Loading orders..." /> : (
        <OrderTable orders={orders} role="farmer" onAccept={handleAccept} onReject={handleReject} />
      )}
    </DashboardLayout>
  )
}
