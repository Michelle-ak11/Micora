import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import DashboardSidebar from '../Components/DashboardSidebar'

function TrackOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/orders/me')
        setOrders(response.data)
      } catch (error) {
        setError(
          error.response?.data?.message ||
          'Could not load your orders.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const handleCancel = async (orderId) => {
    try {
      setError('')

      await api.patch(`/api/orders/${orderId}/cancel`)

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId
            ? { ...order, status: 'CANCELLED' }
            : order
        )
      )
    } catch (error) {
      setError(
        error.response?.data?.message ||
        'Could not cancel this order.'
      )
    }
  }

  const getStatusClass = (status) => {
    return `order-status ${status?.toLowerCase()}`
  }

  const getStatusStep = (status) => {
    const steps = ['PENDING', 'PRINTING', 'READY', 'DELIVERED']
    return steps.indexOf(status)
  }

  return (
    <div className="dashboard-layout">

      <DashboardSidebar />

      <main className="dashboard-main track-main">

        <div className="track-header">
          <span>YOUR ORDERS</span>
          <h1>Track your orders</h1>
          <p>Keep up with the progress of your printing orders.</p>
        </div>

        {loading && (
          <div className="track-message">
            Loading your orders...
          </div>
        )}

        {error && (
          <div className="track-message error">
            {error}
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="empty-orders">
            <h2>No orders yet</h2>
            <p>You haven't placed any printing orders.</p>

            <Link
              to="/services"
              className="browse-orders-button"
            >
              Browse Services
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">

            {orders.map((order) => {
              const currentStep = getStatusStep(order.status)

              return (
                <div className="tracking-card" key={order.id}>

                  <div className="tracking-top">
                    <div>
                      <span className="order-number">
                        ORDER #{order.id}
                      </span>

                      <h2>
                        {order.service?.name || 'Printing Service'}
                      </h2>
                    </div>

                    <span className={getStatusClass(order.status)}>
                      {order.status}
                    </span>
                  </div>

                  <div className="tracking-details">

                    <div>
                      <span>Quantity</span>
                      <strong>{order.quantity}</strong>
                    </div>

                    <div>
                      <span>Total</span>
                      <strong>
                        ₦{Number(
                          order.quotedPrice || 0
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span>Ordered</span>
                      <strong>
                        {order.createdAt
                          ? new Date(
                              order.createdAt
                            ).toLocaleDateString()
                          : '—'}
                      </strong>
                    </div>

                  </div>

                  {order.status !== 'CANCELLED' && (
                    <div className="tracking-progress">

                      <div className="progress-line">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${(currentStep / 3) * 100}%`
                          }}
                        ></div>
                      </div>

                      <div className="progress-steps">

                        <div className={currentStep >= 0 ? 'completed' : ''}>
                          <span>1</span>
                          <small>Pending</small>
                        </div>

                        <div className={currentStep >= 1 ? 'completed' : ''}>
                          <span>2</span>
                          <small>Printing</small>
                        </div>

                        <div className={currentStep >= 2 ? 'completed' : ''}>
                          <span>3</span>
                          <small>Ready</small>
                        </div>

                        <div className={currentStep >= 3 ? 'completed' : ''}>
                          <span>4</span>
                          <small>Delivered</small>
                        </div>

                      </div>
                    </div>
                  )}

                  {order.status === 'CANCELLED' && (
                    <div className="cancelled-order">
                      This order has been cancelled.
                    </div>
                  )}

                  {order.designFileUrl && (
                    <a
                      href={order.designFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="view-design"
                    >
                      View Design
                    </a>
                  )}

                  {order.status === 'PENDING' && (
                    <button
                      className="cancel-order-button"
                      onClick={() => handleCancel(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}

                </div>
              )
            })}

          </div>
        )}

      </main>
    </div>
  )
}

export default TrackOrders