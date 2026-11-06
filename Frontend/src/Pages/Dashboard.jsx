import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Customer'

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [deactivateStep, setDeactivateStep] = useState('confirm')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [deactivateError, setDeactivateError] = useState('')
  const [deactivateLoading, setDeactivateLoading] = useState(false)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/api/orders/me')
        const data = response.data

        setOrders(Array.isArray(data) ? data : data.content || [])
      } catch (error) {
        console.error('Unable to fetch orders:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const paidOrders = orders.filter(
    order => order.paymentStatus?.toUpperCase() === 'PAID'
  ).length

  const pendingOrders = orders.filter(
    order => order.status?.toUpperCase() === 'PENDING'
  ).length

  const deliveredOrders = orders.filter(
    order => order.status?.toUpperCase() === 'DELIVERED'
  ).length

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigate('/login')
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

      navigate('/login')
    } catch (error) {
      setDeactivateError(
        error.response?.data?.message ||
        'Could not deactivate your account.'
      )
    } finally {
      setDeactivateLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">

        <Link to="/dashboard" className="dashboard-logo">
          MICORA<span>.</span>
        </Link>

        <p className="sidebar-label">MENU</p>

        <nav className="sidebar-nav">

          <Link to="/" className="sidebar-link">
            <span>⌂</span>
            Home
          </Link>

          <Link to="/dashboard" className="sidebar-link active">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link to="/services" className="sidebar-link">
            <span>▦</span>
            Browse Services
          </Link>

          <Link to="/track-order" className="sidebar-link">
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


      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* TOP */}
        <div className="dashboard-top">

          <div className="dashboard-search">
            <span>⌕</span>
            <input
              type="text"
              placeholder="Search for services, orders, or anything..."
            />
          </div>

          <div className="dashboard-user">
            <span className="notification">♧</span>

            <div className="dashboard-top-avatar">
              {username.charAt(0).toUpperCase()}
            </div>

            <strong>{username}</strong>
            <span>⌄</span>
          </div>

        </div>


        {/* WELCOME */}
        <section className="dashboard-welcome">

          <div>
            <span className="dashboard-date">
              YOUR PRINTING SPACE
            </span>

            <h1>
              Welcome, {username}!
            </h1>

            <p>
              Let's bring your next big idea to life.
            </p>
          </div>

        </section>


        {/* BANNER */}
        <section className="dashboard-banner">

          <div className="banner-content">

            <span>MAKE SOMETHING BEAUTIFUL</span>

            <h2>
              Your ideas deserve
              <br />
              a beautiful finish.
            </h2>

            <p>
              From everyday prints to custom branding,
              we've got you covered.
            </p>

            <Link to="/services" className="banner-button">
              Explore Services →
            </Link>

          </div>

          <div className="banner-decoration">

            <div className="banner-circle"></div>

            <div className="banner-product">
              <div className="bag-handle"></div>
              <div className="bag-body">
                MICORA.
              </div>
            </div>

            <div className="banner-text">
              Print
              <br />
              Create
              <br />
              Inspire.
            </div>

          </div>

        </section>


        {/* ORDER STATS */}
        <section className="summary-grid">

          <div className="summary-card">

            <div className="summary-icon">
              🛒
            </div>

            <div>
              <p>Total Orders</p>
              <h3>{orders.length}</h3>
              <small>All your orders</small>
            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon paid">
              ✓
            </div>

            <div>
              <p>Paid Orders</p>
              <h3>{paidOrders}</h3>
              <small>Successfully paid</small>
            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon pending">
              ◷
            </div>

            <div>
              <p>Pending Orders</p>
              <h3>{pendingOrders}</h3>
              <small>Awaiting processing</small>
            </div>

          </div>


          <div className="summary-card">

            <div className="summary-icon delivered">
              ✓
            </div>

            <div>
              <p>Delivered Orders</p>
              <h3>{deliveredOrders}</h3>
              <small>Successfully delivered</small>
            </div>

          </div>

        </section>


        {/* LOWER SECTION */}
        <div className="dashboard-lower">

          {/* QUICK ACTIONS */}
          <section className="quick-actions">

            <div className="section-heading">

              <div>
                <span className="section-eyebrow">
                  GET STARTED
                </span>

                <h2>Quick Actions</h2>
              </div>

              <Link to="/services">
                View all →
              </Link>

            </div>


            <div className="quick-action-grid">

              <Link to="/services" className="quick-action-card">
                <div>✦</div>
                <strong>Browse Services</strong>
                <span>Explore printing options →</span>
              </Link>


              <Link to="/services" className="quick-action-card">
                <div>♧</div>
                <strong>Upload Design</strong>
                <span>Start a custom order →</span>
              </Link>


              <Link to="/track-order" className="quick-action-card">
                <div>◷</div>
                <strong>Track Orders</strong>
                <span>Check your order status →</span>
              </Link>


              <Link to="/services" className="quick-action-card">
                <div>✧</div>
                <strong>Custom Request</strong>
                <span>Need something unique? →</span>
              </Link>

            </div>

          </section>


          {/* RECENT ORDERS */}
          <section className="recent-orders">

            <div className="section-heading">

              <div>
                <span className="section-eyebrow">
                  YOUR ACTIVITY
                </span>

                <h2>Recent Orders</h2>
              </div>

              <Link to="/track-order">
                View all →
              </Link>

            </div>


            {loading ? (

              <p className="empty-orders">
                Loading your orders...
              </p>

            ) : orders.length === 0 ? (

              <div className="empty-orders">

                <span>✧</span>

                <h3>No orders yet</h3>

                <p>
                  Your printing journey starts here.
                </p>

                <Link to="/services">
                  Browse Services
                </Link>

              </div>

            ) : (

              <div className="orders-list">

                {orders.slice(0, 5).map((order, index) => (

                  <div
                    className="order-row"
                    key={order.id || index}
                  >

                    <div className="order-icon">
                      ▧
                    </div>

                    <div className="order-info">

                      <strong>
                        {order.service?.name ||
                          order.serviceName ||
                          'Printing Order'}
                      </strong>

                      <small>
                        Order #{order.id}
                      </small>

                    </div>

                    <span
                      className={`order-status ${
                        (order.status || 'pending').toLowerCase()
                      }`}
                    >
                      {order.status || 'Pending'}
                    </span>

                    <strong className="order-price">
                      ₦
                      {Number(
                        order.totalAmount ?? order.price ?? 0
                      ).toLocaleString()}
                    </strong>

                  </div>

                ))}

              </div>

            )}

          </section>

        </div>


        {/* BOTTOM CTA */}
        <section className="dashboard-cta">

          <div>

            <span className="section-eyebrow">
              LET'S GET CREATIVE
            </span>

            <h2>
              Have something in mind?
            </h2>

            <p>
              Discover our printing and branding services.
            </p>

          </div>

          <Link to="/services">
            Browse Services →
          </Link>

        </section>


        {/* DEACTIVATE ACCOUNT MODAL */}
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

      </main>

    </div>
  )
}

export default Dashboard;