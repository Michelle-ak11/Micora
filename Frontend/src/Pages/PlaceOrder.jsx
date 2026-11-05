import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

function PlaceOrder() {
  const location = useLocation()
  const navigate = useNavigate()
  const service = location.state?.service

  const [quantity, setQuantity] = useState(1)
  const [designFileUrl, setDesignFileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const unitPrice = Number(service?.price || 0)
  const estimatedTotal = unitPrice * Number(quantity)

  if (!service) {
    return (
      <div className="order-main">
        <div className="order-card">
          <h2>No service selected</h2>
          <Link to="/services">Browse Services</Link>
        </div>
      </div>
    )
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await api.post('/api/orders', {
        serviceId: service.id,
        quantity: Number(quantity),
        designFileUrl
      })

      navigate('/payment', {
        state: { order: response.data }
      })
    } catch (error) {
      setError(
        error.response?.data?.message || 'Could not place your order. Please try again.'
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

      <main className="dashboard-main order-main">
        <form className="order-card" onSubmit={handleOrder}>
          <div className="order-header">
            <span>NEW ORDER</span>
            <h1>Place your order</h1>
            <p>{service.name}</p>
          </div>

          <div className="order-field">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              required
            />
          </div>

          <div className="order-field">
            <label>Design URL</label>
            <input
              type="url"
              placeholder="Paste your design link"
              value={designFileUrl}
              onChange={(e) => setDesignFileUrl(e.target.value)}
            />
          </div>

          <div className="order-summary">
            <div>
              <span>Service</span>
              <strong>{service.name}</strong>
            </div>

            <div>
              <span>Price per unit</span>
              <strong>₦{unitPrice.toLocaleString()}</strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>{quantity}</strong>
            </div>

            <div className="order-total">
              <span>Estimated Total</span>
              <strong>₦{estimatedTotal.toLocaleString()}</strong>
            </div>
          </div>

          {error && <p className="order-error">{error}</p>}

          <button
            type="submit"
            className="place-order-button"
            disabled={loading}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default PlaceOrder