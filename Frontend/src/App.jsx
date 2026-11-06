import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Registration from './Pages/Registration'
import EmailVerification from './Pages/EmailVerification'
import Login from './Pages/LoginPage'
import Dashboard from './Pages/Dashboard'
import Services from './Pages/Services'
import PlaceOrder from './Pages/PlaceOrder'
import Payment from './Pages/Payement'
import Receipt from './Pages/Receipt'
import TrackOrder from './Pages/TrackOrder'
import AdminDashboard from './Pages/AdminDashboard'
import AdminOrders from './Pages/AdminOrders'
import AdminServices from './Pages/AdminServices'
import AdminCustomers from './Pages/AdminCustomers'
import AdminInvoices from './Pages/AdminInvoices'



function LandingPage() {
  return (
    <div className="app">
      <nav className="navbar">
        <h2>MICORA</h2>
        <div className="nav-links">
          <a href="/">Home</a>
          <a href="/services">Services</a>
          <a href="/login">Login</a>
          <a href="/register" className="nav-button">Get Started</a>
        </div>
      </nav>

      <main className="hero">
        <div className="hero-text">
          <p className="eyebrow">PRINTING & BRANDING</p>
          <h1>Your designs.<br />Our print.<br />Delivered.</h1>
          <p className="description">
            Quality printing and branding services made simple.
            Bring your ideas to life with MICORA.
          </p>
          <div className="hero-buttons">
            <a href="/services" className="primary-button">Explore Services</a>
            <a href="/register" className="secondary-button">Get Started</a>
          </div>
        </div>

        <div className="hero-card">
          <div className="card-circle"></div>
          <p>PRINT<br />CREATE<br />DELIVER</p>
        </div>
      </main>
    </div>
  )
}

function Placeholder({ title }) {
  return <h1>{title} — Coming Soon</h1>
}

function AdminPlaceholder() {
  return <h1>Admin Dashboard — Coming Soon</h1>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/place-order" element={<PlaceOrder />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/receipt" element={<Receipt />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/customers" element={<AdminCustomers />} />
        <Route path="/admin/invoices" element={<AdminInvoices />} />
        
      
      </Routes>
    </BrowserRouter>
  )
}

export default App