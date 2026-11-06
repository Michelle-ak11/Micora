import { Link, useLocation } from 'react-router-dom'
import DashboardSidebar from '../Components/DashboardSidebar'

function Receipt() {
  const location = useLocation()
  const receipt = location.state?.payment

  const formatDate = (date) =>
    date ? new Date(date).toLocaleString() : '—'

  if (!receipt) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar />

        <main className="dashboard-main receipt-main">
          <div className="receipt-card">
            <h2>Receipt not found</h2>
            <Link to="/dashboard">Back to Dashboard</Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="dashboard-layout">

      <DashboardSidebar />

      <main className="dashboard-main receipt-main">
        <div className="receipt-card">

          <div className="receipt-success">✓</div>

          <h1>Payment Receipt</h1>
          <p className="receipt-message">{receipt.message}</p>

          <div className="receipt-number">
            <span>Invoice Number</span>
            <strong>{receipt.invoiceNumber}</strong>
          </div>

          <div className="receipt-details">
            <div>
              <span>Name</span>
              <strong>{receipt.name}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{receipt.email}</strong>
            </div>

            <div>
              <span>Order ID</span>
              <strong>#{receipt.orderId}</strong>
            </div>

            <div>
              <span>Service</span>
              <strong>{receipt.service}</strong>
            </div>

            <div>
              <span>Quantity</span>
              <strong>{receipt.quantity}</strong>
            </div>

            <div>
              <span>Payment Date</span>
              <strong>{formatDate(receipt.paymentDate)}</strong>
            </div>

            <div>
              <span>Transaction Reference</span>
              <strong>{receipt.transactionRef}</strong>
            </div>

            <div>
              <span>Status</span>
              <strong>{receipt.status}</strong>
            </div>

            <div>
              <span>Amount Paid</span>
              <strong>
                ₦{Number(receipt.amountPaid || 0).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Balance</span>
              <strong>
                ₦{Number(receipt.balance || 0).toLocaleString()}
              </strong>
            </div>
          </div>

          <button
            className="receipt-print"
            onClick={() => window.print()}
          >
            Print Receipt
          </button>

          <Link to="/dashboard" className="receipt-back">
            Back to Dashboard
          </Link>

        </div>
      </main>
    </div>
  )
}

export default Receipt