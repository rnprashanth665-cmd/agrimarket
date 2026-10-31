import React, { useEffect, useState } from 'react'
import DashboardLayout from '../components/DashboardLayout'
import StatCard from '../components/StatCard'
import OrderTable from '../components/OrderTable'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'
import { productApi } from '../api/productApi'
import { orderApi } from '../api/orderApi'
import { useAuth } from '../context/AuthContext'

export default function BuyerDashboard() {
  const { userName } = useAuth()
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError('')
      try {
        const [productRes, orderRes] = await Promise.all([
          productApi.getAllProducts(),
          orderApi.getBuyerOrders(),
        ])
        setProducts(productRes.data?.products || productRes.data || [])
        setOrders(orderRes.data?.orders || orderRes.data || [])
      } catch (err) {
        setError(err.friendlyMessage || 'Unable to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const pendingOrders = orders.filter((o) => o.status?.toLowerCase() === 'pending')
  const acceptedOrders = orders.filter((o) => o.status?.toLowerCase() === 'accepted')
  const deliveredOrders = orders.filter((o) => o.status?.toLowerCase() === 'delivered')
  const totalSpending = orders.reduce((sum, o) => sum + Number(o.total_price || 0), 0)

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <div>
          <h1>Welcome back{userName ? `, ${userName}` : ''}</h1>
          <p>Discover fresh produce and manage your orders.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loading label="Loading dashboard..." /> : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 30 }}>
            <StatCard icon="🌾" value={products.length} label="Available Products" />
            <StatCard icon="🧾" value={orders.length} label="My Orders" />
            <StatCard icon="⏳" value={pendingOrders.length} label="Pending Orders" />
            <StatCard icon="✅" value={acceptedOrders.length} label="Accepted Orders" />
            <StatCard icon="🚚" value={deliveredOrders.length} label="Delivered Orders" />
            <StatCard icon="💰" value={`₹${totalSpending.toFixed(2)}`} label="Total Spending" />
          </div>

          <h3 style={{ marginBottom: 14 }}>Recent Orders</h3>
          <OrderTable orders={orders.slice(0, 6)} role="buyer" />
        </>
      )}
    </DashboardLayout>
  )
}
