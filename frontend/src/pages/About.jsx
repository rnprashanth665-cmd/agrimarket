import React from 'react'

export default function About() {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="section-head">
          <h2>About AgriMarket</h2>
          <p>
            AgriMarket is a digital marketplace built to shorten the distance between the
            people who grow food and the people who buy it.
          </p>
        </div>
        <div className="grid grid-3">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>Give farmers a direct, transparent channel to sell produce at fair prices.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧭</div>
            <h3>How It Works</h3>
            <p>Farmers list crops, buyers browse and order, and AgriMarket handles logistics end to end.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤝</div>
            <h3>Built For SIH 2026</h3>
            <p>A production-style prototype demonstrating a complete agricultural supply chain platform.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
