import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

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
      const response = await api.post('/api/auth/login', formData)

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', response.data.username)

      navigate('/dashboard')
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Login failed. Check your details.'
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
          <span>WELCOME BACK</span>
          <h1>Let's bring your ideas to life.</h1>
          <p>
            Your printing journey continues here.
            Sign in to manage your orders and explore our services.
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

          <span className="form-eyebrow">WELCOME BACK</span>
          <h2>Log in to your account</h2>

          <p className="form-description">
            Enter your details to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <label>Username or Email</label>
            <input
              type="text"
              name="identifier"
              placeholder="Enter your username or email"
              value={formData.identifier}
              onChange={handleChange}
              required
            />

            <label>Password</label>

            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter your password"
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
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>

        </div>
      </div>

    </div>
  )
}

export default Login