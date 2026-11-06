import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminSidebar from '../Components/AdminSidebar'

function AdminInvoices() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/api/invoices')
      setInvoices(response.data)
    } catch (error) {
      setMessage('Failed to load invoices.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [])

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <span>INVOICES</span>
            <h1>Invoices</h1>
            <p>View customer payment invoices.</p>
          </div>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p>No invoices found.</p>
        ) : (
          <div className="admin-invoices">
            {invoices.map((invoice) => (
              <div className="admin-invoice-card" key={invoice.invoiceId}>
                <div>
                  <h3>{invoice.invoiceNumber}</h3>
                  <p>{invoice.name}</p>
                  <p>{invoice.email}</p>
                </div>

                <div>
                  <span>Order #{invoice.orderId}</span>
                  <span>{invoice.service}</span>
                  <span>Quantity: {invoice.quantity}</span>
                </div>

                <div>
                  <strong>
                    ₦{Number(invoice.amountPaid).toLocaleString()}
                  </strong>

                  <span>{invoice.status}</span>
                </div>

                <div>
                  <span>{invoice.paymentDate}</span>
                  <span>{invoice.transactionRef}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminInvoices