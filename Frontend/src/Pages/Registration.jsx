import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

function Registration() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await api.post('/api/auth/register', formData)
      navigate('/verify-email', { state: { email: formData.email } })
      
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
        'Registration failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-visual">
        <Link to="/" className="auth-logo">MICORA.</Link>

        <div className="visual-content">
          <span>CREATE. PRINT. INSPIRE.</span>

          <h1>
            Your ideas deserve
            <br />
            to come to life.
          </h1>

          <p>
            From custom apparel to beautiful packaging,
            we bring your creative ideas to reality.
          </p>

          <div className="product-illustrations">
            <div className="product product-one">T-SHIRT</div>
            <div className="product product-two">YOUR BRAND</div>
            <div className="product product-three">PRINT</div>
          </div>
        </div>

        <div className="visual-footer">
          Your designs. Our print. Delivered.
        </div>
      </div>

      <div className="auth-form-section">
        <div className="auth-form">

          <div className="mobile-logo">MICORA.</div>

          <span className="form-eyebrow">WELCOME TO MICORA</span>

          <h2>Create an account</h2>

          <p className="form-description">
            Start bringing your printing ideas to life.
          </p>

          <form onSubmit={handleSubmit}>

            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />

            <label>Email address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Create a password"
                minLength={8}
                value={formData.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="show-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

          </form>

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Registration;