import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Payment() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state?.order

  const [loading, setLoading] = useState(false)
  const [payment, setPayment] = useState(null)
  const [error, setError] = useState('')

  const amount = Number(order?.quotedPrice || order?.totalPrice || order?.price || 0)

  if (!order) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h2>No order found</h2>
          <Link to="/services">Back to Services</Link>
        </div>
      </div>
    )
  }

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 2500))

      const response = await api.post('/api/payments', {
        orderId: order.id
      })

      setPayment(response.data)
    } catch (error) {
      setError(
        error.response?.data?.message || 'Payment failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/" className="dashboard-logo">MICORA.</Link>

        <nav className="sidebar-nav">
          <Link to="/" className="sidebar-link"><span>⌂</span>Home</Link>
          <Link to="/dashboard" className="sidebar-link"><span>▦</span>Dashboard</Link>
          <Link to="/services" className="sidebar-link"><span>◈</span>Browse Services</Link>
          <Link to="/track-orders" className="sidebar-link"><span>◎</span>Track Orders</Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-section">
            <div className="profile-avatar">
              {(localStorage.getItem('username') || 'U')[0].toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>{localStorage.getItem('username') || 'User'}</strong>
              <span>Customer</span>
            </div>
          </div>

          <button
            className="sidebar-logout"
            onClick={() => {
              localStorage.removeItem('token')
              localStorage.removeItem('username')
              navigate('/')
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main payment-main">
        <div className="payment-card">
          {!payment ? (
            <>
              <div className="payment-header">
                <span>PAYMENT</span>
                <h1>Complete your order</h1>
              </div>

              <div className="payment-summary">
                <div>
                  <span>Service</span>
                  <strong>{order.service?.name || order.serviceName || 'Printing Service'}</strong>
                </div>

                <div>
                  <span>Quantity</span>
                  <strong>{order.quantity}</strong>
                </div>

                <div>
                  <span>Total</span>
                  <strong>₦{amount.toLocaleString()}</strong>
                </div>
              </div>

              {error && <p className="payment-error">{error}</p>}

              <button
                className="pay-button"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? <span className="payment-loader"></span> : 'Pay Now'}
              </button>
            </>
          ) : (
            <div className="payment-success">
              <div className="success-circle">✓</div>

              <h1>Payment successful</h1>

              <p>
                ₦{Number(payment.amountPaid).toLocaleString()}
              </p>

              <Link
                to="/receipt"
                state={{ order, payment }}
                className="receipt-button"
              >
                View Receipt
              </Link>

              <Link to="/dashboard" className="back-dashboard">
                Back to Dashboard
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Payment