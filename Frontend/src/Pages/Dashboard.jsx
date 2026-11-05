import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

function Dashboard() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username') || 'Customer'

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

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

            <span>⋯</span>
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

      </main>

    </div>
  )
}

export default Dashboard