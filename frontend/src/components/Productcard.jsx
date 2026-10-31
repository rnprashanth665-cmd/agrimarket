import React from 'react'

export default function ProductCard({ product, onBuy }) {
  return (
    <div className="product-card">
      <span className="quality-tag">{product.quality}</span>
      <div className="crop-name">{product.crop_name}</div>
      <div className="meta">
        <span>Farmer: {product.farmer_name || product.farmer?.name || 'AgriMarket Farmer'}</span>
        <span>Location: {product.location || product.farmer?.district || 'India'}</span>
        <span>Available: {product.quantity} kg</span>
        <span>Harvested: {product.harvest_date}</span>
      </div>
      {product.description && <p style={{ fontSize: '0.85rem' }}>{product.description}</p>}
      <div className="card-footer">
        <span className="price">₹{product.price_per_kg}/kg</span>
        <button className="btn btn-primary btn-sm" onClick={() => onBuy(product)}>
          Buy Now
        </button>
      </div>
    </div>
  )
}
