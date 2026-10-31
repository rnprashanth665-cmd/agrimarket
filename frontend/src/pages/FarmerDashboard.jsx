import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import StatCard from '../components/StatCard'
import OrderTable from '../components/OrderTable'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { productApi } from '../api/productApi'
import { orderApi } from '../api/orderApi'
import { useAuth } from '../context/AuthContext'

export default function FarmerDashboard() {
  const { userName } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [productRes, orderRes] = await Promise.all([
        productApi.getFarmerProducts(),
        orderApi.getFarmerOrders(),
      ])
      setProducts(productRes.data?.products || productRes.data || [])
      setOrders(orderRes.data?.orders || orderRes.data || [])
    } catch (err) {
      setError(err.friendlyMessage || 'Unable to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleAccept = async (id) => { await orderApi.acceptOrder(id); loadData() }
  const handleReject = async (id) => { await orderApi.rejectOrder(id); loadData() }

  const totalQuantity = products.reduce((sum, p) => sum + Number(p.quantity || 0), 0)
  const acceptedOrders = orders.filter((o) => o.status?.toLowerCase() === 'accepted')
  const deliveredOrders = orders.filter((o) => o.status?.toLowerCase() === 'delivered')
  const earnings = deliveredOrders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1>Welcome back{userName ? `, ${userName}` : ''}</h1>
          <p>Here's what's happening with your farm today.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loading label="Loading dashboard..." /> : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 30 }}>
            <StatCard icon="🌱" value={products.length} label="Total Products" />
            <StatCard icon="⚖️" value={`${totalQuantity} kg`} label="Available Quantity" />
            <StatCard icon="🧾" value={orders.length} label="Orders Received" />
            <StatCard icon="✅" value={acceptedOrders.length} label="Accepted Orders" />
            <StatCard icon="🚚" value={deliveredOrders.length} label="Delivered Orders" />
            <StatCard icon="💰" value={`₹${earnings.toFixed(2)}`} label="Earnings" />
          </div>

          <h3 style={{ marginBottom: 14 }}>Recent Orders</h3>
          <OrderTable orders={orders.slice(0, 6)} role="farmer" onAccept={handleAccept} onReject={handleReject} />
        </>
      )}
    </DashboardLayout>
  )
}
