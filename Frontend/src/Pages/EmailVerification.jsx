import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import api from '../services/api'

function EmailVerification() {
  const location = useLocation()
  const navigate = useNavigate()

  const email = location.state?.email || ''
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await api.post('/api/auth/verify-email', {
        email,
        code
      })

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('username', response.data.username)

      navigate('/dashboard')
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Invalid or expired verification code.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      await api.post('/api/auth/resend-verification', { email })
      setMessage('A new verification code has been sent.')
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Unable to resend code.'
      )
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-form-section verification-card">
        <div className="auth-form">

          <Link to="/" className="verification-logo">MICORA.</Link>

          <span className="form-eyebrow">EMAIL VERIFICATION</span>

          <h2>Check your email</h2>

          <p className="form-description">
            We've sent a 6-digit verification code to:
            <strong> {email}</strong>
          </p>

          <form onSubmit={handleVerify}>
            <label>Verification Code</label>

            <input
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              maxLength={6}
              required
            />

            <button type="submit" disabled={loading || code.length !== 6}>
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>

          {message && <p className="auth-message">{message}</p>}

          <p className="auth-switch">
            Didn't receive a code?{' '}
            <button className="resend-button" onClick={handleResend}>
              Resend Code
            </button>
          </p>

        </div>
      </div>
    </div>
  )
}

export default EmailVerification