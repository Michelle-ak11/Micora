import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminSidebar from '../Components/AdminSidebar'

function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/users')

      setCustomers(
        response.data.filter((user) => user.role === 'CUSTOMER')
      )
    } catch (error) {
      setMessage('Failed to load customers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const toggleCustomer = async (id, active) => {
    try {
      await api.patch(`/api/users/${id}/active`, {
        active: !active
      })

      setMessage('Customer status updated.')
      fetchCustomers()
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to update customer.'
      )
    }
  }

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <span>CUSTOMERS</span>
            <h1>Manage Customers</h1>
            <p>View and manage MICORA customer accounts.</p>
          </div>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {loading ? (
          <p>Loading customers...</p>
        ) : customers.length === 0 ? (
          <p>No customers found.</p>
        ) : (
          <div className="admin-customers">
            {customers.map((customer) => (
              <div className="admin-customer-card" key={customer.id}>
                <div>
                  <h3>{customer.username}</h3>
                  <p>{customer.email}</p>

                  <span>
                    {customer.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <button
                  onClick={() =>
                    toggleCustomer(customer.id, customer.active)
                  }
                >
                  {customer.active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminCustomers;