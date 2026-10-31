import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import FarmerRegister from './pages/FarmerRegister'
import BuyerRegister from './pages/BuyerRegister'
import Marketplace from './pages/Marketplace'
import FarmerDashboard from './pages/FarmerDashboard'
import BuyerDashboard from './pages/BuyerDashboard'
import Products from './pages/Products'
import AddProduct from './pages/AddProduct'
import FarmerOrders from './pages/FarmerOrders'
import BuyerOrders from './pages/BuyerOrders'
import Vehicles from './pages/Vehicles'
import Deliveries from './pages/Deliveries'
import AIDashboard from './pages/AIDashboard'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Unauthorized from './pages/Unauthorized'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/farmer" element={<FarmerRegister />} />
        <Route path="/register/buyer" element={<BuyerRegister />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/ai" element={<AIDashboard />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        {/* Farmer-only routes */}
        <Route path="/farmer/dashboard" element={
          <ProtectedRoute allowedRole="farmer"><FarmerDashboard /></ProtectedRoute>
        } />
        <Route path="/farmer/products" element={
          <ProtectedRoute allowedRole="farmer"><Products /></ProtectedRoute>
        } />
        <Route path="/farmer/products/add" element={
          <ProtectedRoute allowedRole="farmer"><AddProduct /></ProtectedRoute>
        } />
        <Route path="/farmer/orders" element={
          <ProtectedRoute allowedRole="farmer"><FarmerOrders /></ProtectedRoute>
        } />
        <Route path="/farmer/vehicles" element={
          <ProtectedRoute allowedRole="farmer"><Vehicles /></ProtectedRoute>
        } />
        <Route path="/farmer/deliveries" element={
          <ProtectedRoute allowedRole="farmer"><Deliveries /></ProtectedRoute>
        } />

        {/* Buyer-only routes */}
        <Route path="/buyer/dashboard" element={
          <ProtectedRoute allowedRole="buyer"><BuyerDashboard /></ProtectedRoute>
        } />
        <Route path="/buyer/orders" element={
          <ProtectedRoute allowedRole="buyer"><BuyerOrders /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>

      <footer className="footer">
        <div className="container">
          <div className="brand" style={{ fontSize: '1rem' }}>
            <span className="brand-mark" style={{ width: 28, height: 28, fontSize: '0.9rem' }}>🌾</span>
            AgriMarket
          </div>
          <p>© {new Date().getFullYear()} AgriMarket · Connecting Farmers Directly With Buyers</p>
        </div>
      </footer>
    </>
  )
}
