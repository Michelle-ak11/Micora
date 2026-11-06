import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminSidebar from '../Components/AdminSidebar'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders')
      setOrders(response.data)
    } catch (error) {
      setMessage('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/orders/${id}/status`, { status })
      setMessage('Order status updated.')
      fetchOrders()
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to update order status.'
      )
    }
  }

  const getNextStatus = (status) => {
    if (status === 'PENDING') {
      return ['PRINTING', 'CANCELLED']
    }

    if (status === 'PRINTING') {
      return ['READY']
    }

    if (status === 'READY') {
      return ['DELIVERED']
    }

    return []
  }

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <span>ORDERS</span>
            <h1>Manage Orders</h1>
            <p>View and update customer orders.</p>
          </div>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="admin-orders-table">
            {orders.map((order) => {
              const nextStatuses = getNextStatus(order.status)

              return (
                <div className="admin-order-row" key={order.id}>
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span>{order.status}</span>
                  </div>

                  <div>
                    {order.service?.name || 'Service'}
                  </div>

                  <div>
                    Quantity: {order.quantity}
                  </div>

                  <div>
                    {nextStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminOrders