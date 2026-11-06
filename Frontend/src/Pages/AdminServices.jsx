import { useEffect, useState } from 'react'
import api from '../services/api'
import AdminSidebar from '../Components/AdminSidebar'

function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    basePrice: ''
  })

  const fetchServices = async () => {
    try {
      const response = await api.get('/api/services/all')
      setServices(response.data)
    } catch (error) {
      setMessage('Failed to load services.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      await api.post('/api/services', {
        ...formData,
        basePrice: Number(formData.basePrice)
      })

      setMessage('Service created successfully.')
      setFormData({
        name: '',
        description: '',
        category: '',
        unit: '',
        basePrice: ''
      })
      setShowForm(false)
      fetchServices()
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to create service.'
      )
    }
  }

  const toggleService = async (id, active) => {
    try {
      await api.patch(`/api/services/${id}/active`, {
        active: !active
      })

      setMessage('Service status updated.')
      fetchServices()
    } catch (error) {
      setMessage(
        error.response?.data?.message || 'Failed to update service.'
      )
    }
  }

  return (
    <div className="admin-page">
      <AdminSidebar />

      <main className="admin-content">
        <div className="admin-header">
          <div>
            <span>SERVICES</span>
            <h1>Manage Services</h1>
            <p>Manage the printing services available to customers.</p>
          </div>

          <button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Service'}
          </button>
        </div>

        {message && <p className="admin-message">{message}</p>}

        {showForm && (
          <form className="admin-service-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Service name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="category"
              placeholder="Category"
              value={formData.category}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="unit"
              placeholder="Unit"
              value={formData.unit}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="basePrice"
              placeholder="Base price"
              value={formData.basePrice}
              onChange={handleChange}
              required
            />

            <button type="submit">Create Service</button>
          </form>
        )}

        {loading ? (
          <p>Loading services...</p>
        ) : services.length === 0 ? (
          <p>No services found.</p>
        ) : (
          <div className="admin-services">
            {services.map((service) => (
              <div className="admin-service-card" key={service.id}>
                <div>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>

                  <span>
                    {service.category} · {service.unit}
                  </span>

                  <strong>
                    ₦{Number(service.basePrice).toLocaleString()}
                  </strong>
                </div>

                <div>
                  <span>
                    {service.active ? 'Active' : 'Inactive'}
                  </span>

                  <button
                    onClick={() =>
                      toggleService(service.id, service.active)
                    }
                  >
                    {service.active ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminServices