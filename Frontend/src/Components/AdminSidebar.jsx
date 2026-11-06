import { Link, useNavigate } from 'react-router-dom'

function AdminSidebar() {
  const navigate = useNavigate()
  const username = localStorage.getItem('username')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    navigate('/')
  }

  return (
    <aside className="admin-sidebar">
      <Link to="/admin" className="admin-logo">
        MICORA.
      </Link>

      <nav className="admin-nav">
        <Link to="/admin">Dashboard</Link>
        <Link to="/admin/orders">Orders</Link>
        <Link to="/admin/services">Services</Link>
        <Link to="/admin/customers">Customers</Link>
        <Link to="/admin/invoices">Invoices</Link>
      </nav>

      <div className="admin-profile">
        <div>
          <strong>{username}</strong>
          <span>Administrator</span>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </div>
    </aside>
  )
}

export default AdminSidebar;