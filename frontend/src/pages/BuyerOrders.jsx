import React, { useEffect, useState } from 'react'
import { orderApi } from '../api/orderApi'
import DashboardLayout from '../components/DashboardLayout'
import OrderTable from '../components/OrderTable'
import Loading from '../components/Loading'
import ErrorMessage from '../components/ErrorMessage'

export default function BuyerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewOrder, setReviewOrder] = useState(null)
  const [rating, setRating] = useState(5)
  const [feedback, setFeedback] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    async function loadOrders() {
      setLoading(true)
      setError('')
      try {
        const res = await orderApi.getBuyerOrders()
        const data = res.data?.orders || res.data || []
        setOrders(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.friendlyMessage || 'Unable to load your orders.')
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const openReview = (order) => {
    setReviewOrder(order)
    setRating(5)
    setFeedback('')
    setReviewError('')
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!reviewOrder) return

    setSubmittingReview(true)
    setReviewError('')
    try {
      const orderId = reviewOrder.order_id || reviewOrder.id
      const res = await orderApi.submitReview(orderId, {
        rating: Number(rating),
        feedback: feedback.trim(),
      })
      setOrders((currentOrders) => currentOrders.map((order) =>
        (order.order_id || order.id) === orderId
          ? { ...order, rating: res.data.rating, feedback: res.data.feedback }
          : order
      ))
      setReviewOrder(null)
    } catch (err) {
      setReviewError(err.friendlyMessage || 'Unable to submit your review.')
    } finally {
      setSubmittingReview(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="page-title-row">
        <div>
          <h1>My Orders</h1>
          <p>Track every order you've placed on AgriMarket.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {loading ? <Loading label="Loading your orders..." /> : (
        <OrderTable orders={orders} role="buyer" onReview={openReview} />
      )}

      {reviewOrder && (
        <div className="order-modal-backdrop" onClick={() => !submittingReview && setReviewOrder(null)}>
          <form
            className="order-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            onSubmit={submitReview}
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="review-dialog-title">Rate {reviewOrder.crop_name}</h3>
            <p style={{ marginTop: 6 }}>Your order has been delivered. How was your experience?</p>

            {reviewError && <div className="alert alert-error" style={{ marginTop: 16 }}>{reviewError}</div>}

            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="order-rating">Rating</label>
              <select id="order-rating" value={rating} onChange={(event) => setRating(event.target.value)}>
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Good</option>
                <option value={3}>3 - Average</option>
                <option value={2}>2 - Poor</option>
                <option value={1}>1 - Very poor</option>
              </select>
            </div>

            <div className="field" style={{ marginTop: 16 }}>
              <label htmlFor="order-feedback">Feedback</label>
              <textarea
                id="order-feedback"
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                maxLength={2000}
                required
                placeholder="Share your experience with this order"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline btn-block"
                onClick={() => setReviewOrder(null)}
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-block" disabled={submittingReview || !feedback.trim()}>
                {submittingReview ? 'Submitting...' : 'Submit review'}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardLayout>
  )
}
