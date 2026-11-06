import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminSidebar from '../Components/AdminSidebar'

function AdminDashboard() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [services, setServices] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [ordersResponse, usersResponse, servicesResponse, invoicesResponse] =
          await Promise.all([
            api.get('/api/orders'),
            api.get('/api/users'),
            api.get('/api/services/all'),
            api.get('/api/invoices')
          ])

        setOrders(ordersResponse.data)
        setCustomers(usersResponse.data)
        setServices(servicesResponse.data)
        setInvoices(invoicesResponse.data)
      } catch (error) {
        console.error('Failed to load admin dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <span>ADMIN DASHBOARD</span>
            <h1>Welcome back, {localStorage.getItem('username')}</h1>
            <p>Here's what's happening with MICORA.</p>
          </div>
        </div>

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            <div className="admin-stats">
              <div className="admin-card">
                <span>Total Orders</span>
                <h2>{orders.length}</h2>
              </div>

              <div className="admin-card">
                <span>Customers</span>
                <h2>{customers.length}</h2>
              </div>

              <div className="admin-card">
                <span>Services</span>
                <h2>{services.length}</h2>
              </div>

              <div className="admin-card">
                <span>Invoices</span>
                <h2>{invoices.length}</h2>
              </div>
            </div>

            <div className="admin-section">
              <div className="admin-section-header">
                <h2>Recent Orders</h2>
                <a href="/admin/orders">View all</a>
              </div>

              {orders.length === 0 ? (
                <p>No orders yet.</p>
              ) : (
                <div className="admin-orders">
                  {orders.slice(0, 5).map((order) => (
                    <div className="admin-order" key={order.id}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <span>{order.status}</span>
                      </div>

                      <span>{order.createdAt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard