import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Registration from './Pages/Registration'

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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Placeholder title="Login" />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/services" element={<Placeholder title="Services" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App