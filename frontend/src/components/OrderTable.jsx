import React from 'react'
import StatusBadge from './StatusBadge'

/**
 * Reusable order table for both farmer and buyer views.
 * `role` decides which columns and row actions are rendered.
 */
export default function OrderTable({
  orders,
  role,
  onAccept,
  onReject,
  onView,
  onReview
}) {
  if (!orders || orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="big-emoji">📦</div>
        <p>No orders to show yet.</p>
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>

        <thead>
          <tr>
            <th>Order ID</th>
            <th>Crop</th>

            {role === 'farmer' ? (
              <>
                <th>Buyer</th>
                <th>Buyer Phone</th>
                <th>Delivery Location</th>
              </>
            ) : (
              <th>Farmer</th>
            )}

            <th>Quantity</th>
            <th>Price/kg</th>
            <th>Total Price</th>
            <th>Order Date</th>
            <th>Status</th>
            {role === 'buyer' && <th>Rating & Feedback</th>}

            {role === 'farmer' && <th>Action</th>}
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr key={order.order_id || order.id}>

              <td>
                #{order.order_id || order.id}
              </td>

              <td>
                {order.crop_name}
              </td>

              {role === 'farmer' ? (
                <>
                  <td>
                    <strong>{order.buyer_name}</strong>
                    {order.business_name && (
                      <div style={{ fontSize: '0.85rem' }}>
                        {order.business_name}
                      </div>
                    )}
                  </td>

                  <td>
                    {order.buyer_phone || 'N/A'}
                  </td>

                  <td>
                    {order.delivery_location || 'N/A'}
                  </td>
                </>
              ) : (
                <td>
                  {order.farmer_name || 'N/A'}
                </td>
              )}

              <td>
                {order.quantity} kg
              </td>

              <td>
                ₹{order.price_per_kg || '-'}
              </td>

              <td>
                ₹{order.total_price}
              </td>

              <td>
                {order.order_date}
              </td>

              <td>
                <StatusBadge status={order.status} />
              </td>

              {role === 'buyer' && (
                <td>
                  {order.rating ? (
                    <>
                      <strong>{'★'.repeat(order.rating)}{'☆'.repeat(5 - order.rating)}</strong>
                      <div>{order.feedback}</div>
                    </>
                  ) : order.status?.toLowerCase() === 'delivered' && onReview ? (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onReview(order)}
                    >
                      Rate order
                    </button>
                  ) : order.status?.toLowerCase() === 'delivered' ? (
                    <span>Review in My Orders</span>
                  ) : (
                    <span>After delivery</span>
                  )}
                </td>
              )}

              {role === 'farmer' && (
                <td>
                  {order.status?.toLowerCase() === 'pending' ? (
                    <div
                      style={{
                        display: 'flex',
                        gap: 8
                      }}
                    >
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onAccept(order.order_id || order.id)}
                      >
                        Accept
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onReject(order.order_id || order.id)}
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => onView && onView(order)}
                    >
                      View
                    </button>
                  )}
                </td>
              )}

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  )
}
