import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import DashboardSidebar from '../Components/DashboardSidebar'

function PlaceOrder() {
  const location = useLocation()
  const navigate = useNavigate()
  const service = location.state?.service

  const [quantity, setQuantity] = useState(1)
  const [designFile, setDesignFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const unitPrice = Number(service?.basePrice || 0)
  const estimatedTotal = unitPrice * Number(quantity)

  if (!service) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />

        <main className="dashboard-main order-main">
          <div className="order-card">
            <h2>No service selected</h2>
            <Link to="/services">Browse Services</Link>
          </div>
        </main>
      </div>
    )
  }

  const handleOrder = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!designFile) {
      setError('Please upload your design.')
      setLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', designFile)

      const uploadResponse = await api.post('/api/files', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const designFileUrl = uploadResponse.data.url

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
        error.response?.data?.message ||
        'Could not place your order. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">

      <DashboardSidebar />

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
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value)))
              }
              required
            />
          </div>

          <div className="order-field">
            <label>Upload Design</label>

            <input
              type="file"
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={(e) => setDesignFile(e.target.files[0] || null)}
              required
            />

            {designFile && (
              <small>{designFile.name}</small>
            )}
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