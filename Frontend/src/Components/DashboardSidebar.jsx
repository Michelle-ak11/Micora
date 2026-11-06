import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

function DashboardSidebar() {
  const navigate = useNavigate()
  const location = useLocation()

  const username = localStorage.getItem('username') || 'Customer'

  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivateStep, setDeactivateStep] = useState('confirm')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [deactivateError, setDeactivateError] = useState('')
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/')
  }

  const openDeactivate = () => {
    setShowAccountMenu(false)
    setShowDeactivate(true)
    setDeactivateStep('confirm')
    setPassword('')
    setCode('')
    setDeactivateError('')
  }

  const sendCloseAccountCode = async () => {
    try {
      setDeactivateLoading(true)
      setDeactivateError('')

      await api.post('/api/users/me/close-account/send-code')

      setDeactivateStep('code')
    } catch (error) {
      setDeactivateError(
        error.response?.data?.message ||
        'Could not send the verification code.'
      )
    } finally {
      setDeactivateLoading(false)
    }
  }

  const deactivateAccount = async () => {
    try {
      setDeactivateLoading(true)
      setDeactivateError('')

      const request = {}

      if (deactivateStep === 'password') {
        request.password = password
      } else {
        request.code = code
      }

      await api.patch('/api/users/me/deactivate', request)

      localStorage.removeItem('token')
      localStorage.removeItem('username')

      navigate('/')
    } catch (error) {
      setDeactivateError(
        error.response?.data?.message ||
        'Could not deactivate your account.'
      )
    } finally {
      setDeactivateLoading(false)
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <>
      <aside className="dashboard-sidebar">

        <Link to="/dashboard" className="dashboard-logo">
          MICORA<span>.</span>
        </Link>

        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-nav">

          <Link
            to="/"
            className={`sidebar-link ${isActive('/') ? 'active' : ''}`}
          >
            <span>⌂</span>
            Home
          </Link>

          <Link
            to="/dashboard"
            className={`sidebar-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            to="/services"
            className={`sidebar-link ${isActive('/services') ? 'active' : ''}`}
          >
            <span>▦</span>
            Browse Services
          </Link>

          <Link
            to="/track-order"
            className={`sidebar-link ${isActive('/track-order') ? 'active' : ''}`}
          >
            <span>◷</span>
            Track Orders
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="profile-section">

            <div className="profile-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <div className="profile-details">
              <strong>{username}</strong>
              <small>My Profile</small>
            </div>

            <button
              className="profile-menu-button"
              onClick={() => setShowAccountMenu(!showAccountMenu)}
            >
              ⋯
            </button>

            {showAccountMenu && (
              <div className="profile-menu">
                <button onClick={openDeactivate}>
                  Deactivate Account
                </button>
              </div>
            )}

          </div>

          <button className="sidebar-logout" onClick={logout}>
            ↪ Log out
          </button>

        </div>

      </aside>


      {showDeactivate && (
        <div className="deactivate-overlay">

          <div className="deactivate-modal">

            <button
              className="deactivate-close"
              onClick={() => setShowDeactivate(false)}
            >
              ×
            </button>


            {deactivateStep === 'confirm' && (
              <>
                <span className="section-eyebrow">
                  ACCOUNT SETTINGS
                </span>

                <h2>
                  Deactivate your account?
                </h2>

                <p>
                  Your account will be deactivated and you will be
                  signed out.
                </p>

                <div className="deactivate-actions">

                  <button
                    className="cancel-deactivate"
                    onClick={() => setShowDeactivate(false)}
                  >
                    Cancel
                  </button>

                  <button
                    className="confirm-deactivate"
                    onClick={() => setDeactivateStep('password')}
                  >
                    Continue
                  </button>

                </div>
              </>
            )}


            {deactivateStep === 'password' && (
              <>
                <span className="section-eyebrow">
                  CONFIRM ACCOUNT
                </span>

                <h2>
                  Enter your password
                </h2>

                <p>
                  Confirm your password to deactivate your account.
                </p>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                {deactivateError && (
                  <p className="deactivate-error">
                    {deactivateError}
                  </p>
                )}

                <button
                  className="confirm-deactivate full"
                  onClick={deactivateAccount}
                  disabled={deactivateLoading || !password}
                >
                  {deactivateLoading
                    ? 'Deactivating...'
                    : 'Deactivate Account'}
                </button>

                <button
                  className="email-code-button"
                  onClick={sendCloseAccountCode}
                  disabled={deactivateLoading}
                >
                  Use email verification instead
                </button>
              </>
            )}


            {deactivateStep === 'code' && (
              <>
                <span className="section-eyebrow">
                  EMAIL VERIFICATION
                </span>

                <h2>
                  Enter your code
                </h2>

                <p>
                  We've sent a verification code to your email.
                </p>

                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />

                {deactivateError && (
                  <p className="deactivate-error">
                    {deactivateError}
                  </p>
                )}

                <button
                  className="confirm-deactivate full"
                  onClick={deactivateAccount}
                  disabled={deactivateLoading || !code}
                >
                  {deactivateLoading
                    ? 'Deactivating...'
                    : 'Deactivate Account'}
                </button>

                <button
                  className="email-code-button"
                  onClick={() => setDeactivateStep('password')}
                >
                  Use password instead
                </button>
              </>
            )}

          </div>

        </div>
      )}
    </>
  )
}

export default DashboardSidebar