import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Banners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    tag: '',
    desktopImage: '',
    buttonOneText: 'Explore Machines',
    buttonOneLink: '/category/all',
    buttonTwoText: 'Enquire Now',
    buttonTwoLink: '#enquiry'
  })
  const [saving, setSaving] = useState(false)

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const res = await api.get('/banners').catch(() => null)
      const list = res?.data?.data || res?.data?.banners || (Array.isArray(res?.data) ? res.data : [])
      if (list.length > 0) {
        setBanners(list)
      } else {
        setBanners([
          {
            _id: 'b1',
            title: 'We Deliver Results',
            subtitle: 'Precision welding machines trusted by 950+ manufacturers.',
            description: 'High performance industrial welding equipment built for B2B manufacturing.',
            tag: 'Ultrasonic Plastic Welding',
            desktopImage: '/assets/Banner1.png'
          },
          {
            _id: 'b2',
            title: 'High Strength Jointing',
            subtitle: 'Engineered for maximum repeatable industrial quality.',
            description: 'Advanced spin and ultrasonic joining technology for demanding assembly lines.',
            tag: 'Spin & Rotary Welding',
            desktopImage: '/assets/Banner2.png'
          },
          {
            _id: 'b3',
            title: 'Engineered For Precision',
            subtitle: 'On-site commissioning, operator training, and dedicated support.',
            description: 'Tailored turnkey plastic welding systems built to your specs.',
            tag: 'Custom B2B Solutions',
            desktopImage: '/assets/Banner3.png'
          }
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  const openAddModal = () => {
    setEditingBanner(null)
    setFormData({
      title: '',
      subtitle: '',
      description: '',
      tag: '',
      desktopImage: '',
      buttonOneText: 'Explore Machines',
      buttonOneLink: '/category/all',
      buttonTwoText: 'Enquire Now',
      buttonTwoLink: '#enquiry'
    })
    setModalOpen(true)
  }

  const openEditModal = (b) => {
    setEditingBanner(b)
    setFormData({
      title: b.title || '',
      subtitle: b.subtitle || '',
      description: b.description || '',
      tag: b.tag || '',
      desktopImage: b.desktopImage || '',
      buttonOneText: b.buttonOneText || 'Explore Machines',
      buttonOneLink: b.buttonOneLink || '/category/all',
      buttonTwoText: b.buttonTwoText || 'Enquire Now',
      buttonTwoLink: b.buttonTwoLink || '#enquiry'
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingBanner) {
        setBanners(banners.map((b) => b._id === editingBanner._id ? { ...b, ...formData } : b))
      } else {
        setBanners([...banners, { ...formData, _id: 'b-' + Date.now() }])
      }
      setModalOpen(false)
    } catch (err) {
      alert('Error saving banner')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (id) => {
    if (!window.confirm('Delete this banner slide?')) return
    setBanners(banners.filter((b) => b._id !== id))
  }

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <h3 className="card-title">Homepage Hero Slider Banners</h3>
          <button onClick={openAddModal} className="btn btn-primary">
            + Add Hero Banner
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {banners.map((b, idx) => (
          <div key={b._id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="badge badge-info">{b.tag || `Slide #${idx + 1}`}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Position {idx + 1}</span>
              </div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>{b.title}</h4>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{b.subtitle}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20, paddingTop: 14, borderTop: '1px solid #F1F5F9' }}>
              <button onClick={() => openEditModal(b)} className="btn btn-secondary btn-sm">Edit</button>
              <button onClick={() => handleDelete(b._id)} className="btn btn-danger-light btn-sm">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
              {editingBanner ? 'Edit Hero Banner' : 'Add Hero Banner'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Tag / Eyebrow</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tag}
                  onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                  placeholder="e.g. Ultrasonic Plastic Welding"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Main Heading Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. We Deliver Results"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subtitle</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="Precision welding machines trusted by 950+ manufacturers."
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Background Image URL</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.desktopImage}
                  onChange={(e) => setFormData({ ...formData, desktopImage: e.target.value })}
                  placeholder="https://... or /assets/Banner1.png"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingBanner ? 'Update Banner' : 'Add Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
