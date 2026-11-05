import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const serviceIcons = {
  'Flyers': '✦',
  'Posters': '▧',
  'Banners': '▱',
  'Business Cards': '▤',
  'T-Shirts': '♧',
  'Stickers': '✧',
  'Logo Design': '◇',
  'default': '✳'
}

function Services() {
  const [services, setServices] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await api.get('/api/services')
        setServices(response.data)
      } catch (error) {
        console.error('Unable to load services:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const filteredServices = services.filter(service =>
    service.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="services-page">


        <aside className="dashboard-sidebar">

  <Link to="/dashboard" className="dashboard-logo">
    MICORA<span>.</span>
  </Link>

  <p className="sidebar-label">MENU</p>

  <nav className="sidebar-nav">

    <Link to="/dashboard" className="sidebar-link">
      <span>⌂</span>
      Dashboard
    </Link>

    <Link to="/services" className="sidebar-link active">
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
        {(localStorage.getItem('username') || 'Customer')
          .charAt(0)
          .toUpperCase()}
      </div>

      <div className="profile-details">
        <strong>
          {localStorage.getItem('username') || 'Customer'}
        </strong>
        <small>My Profile</small>
      </div>

      <span>⋯</span>
    </div>

    <button
      className="sidebar-logout"
      onClick={() => {
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        window.location.href = '/login'
      }}
    >
      ↪ Log out
    </button>

  </div>

</aside>

    

      <main className="services-content">

        <div className="services-heading">
          <span>EXPLORE MICORA</span>
          <h1>Find the perfect print.</h1>
          <p>
            Whatever you're imagining, let's bring it to life.
            Explore our printing and branding services.
          </p>
        </div>

        <div className="services-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search for a service..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="services-section-heading">
          <div>
            <span>OUR COLLECTION</span>
            <h2>What would you like to print?</h2>
          </div>
          <p>{filteredServices.length} services available</p>
        </div>

        {loading ? (
          <p>Loading services...</p>
        ) : filteredServices.length === 0 ? (
          <div className="no-services">
            <h3>No services found</h3>
            <p>Try searching for something else.</p>
          </div>
        ) : (
          <div className="services-grid">
            {filteredServices.map((service) => {
              const icon = Object.keys(serviceIcons).find(key =>
                service.name?.toLowerCase().includes(key.toLowerCase())
              )

              return (
                <div className="service-card" key={service.id}>
                  <div className="service-card-icon">
                    {serviceIcons[icon] || serviceIcons.default}
                  </div>

                  <span className="service-card-tag">
                    MICORA COLLECTION
                  </span>

                  <h3>{service.name}</h3>

                  <p>
                    {service.description ||
                      'Quality printing and branding, made just for you.'}
                  </p>

                  <div className="service-card-bottom">
                    {service.price != null && (
                      <span>
                        From ₦{Number(service.price).toLocaleString()}
                      </span>
                    )}

                    <button
                      onClick={() =>
                        navigate('/place-order', {
                          state: { service }
                        })
                      }
                    >
                      Choose Service →
                    </button>
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

export default Services; 