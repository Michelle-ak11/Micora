import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import DashboardSidebar from '../Components/DashboardSidebar'

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
    <div className="dashboard-layout">

      <DashboardSidebar />

      <main className="dashboard-main services-content">

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