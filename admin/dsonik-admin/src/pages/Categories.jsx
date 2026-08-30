import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    displayOrder: 0
  })
  const [saving, setSaving] = useState(false)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await api.get('/categories')
      const cats = res?.data?.data || res?.data?.categories || (Array.isArray(res?.data) ? res.data : [])
      setCategories(cats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const openAddModal = () => {
    setEditingCategory(null)
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      displayOrder: categories.length
    })
    setModalOpen(true)
  }

  const openEditModal = (cat) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name || '',
      slug: cat.slug || '',
      description: cat.description || '',
      image: cat.image || '',
      displayOrder: cat.displayOrder ?? 0
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        displayOrder: Number(formData.displayOrder || 0),
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory._id}`, payload).catch(async () => {
          await api.put(`/categories/${editingCategory._id}`, payload)
        })
      } else {
        await api.post('/admin/categories', payload).catch(async () => {
          await api.post('/categories', payload)
        })
      }

      setModalOpen(false)
      fetchCategories()
    } catch (err) {
      alert('Error saving category: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await api.delete(`/admin/categories/${id}`).catch(async () => {
        await api.delete(`/categories/${id}`)
      })
      setCategories(categories.filter((c) => c._id !== id))
    } catch (err) {
      alert('Error deleting category: ' + (err.response?.data?.message || err.message))
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <h3 className="card-title">Technology & Welding Categories</h3>
          <button onClick={openAddModal} className="btn btn-primary">
            + Add Category
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Order</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    No categories found. Click "+ Add Category" to create one.
                  </td>
                </tr>
              ) : (
                categories.map((c) => {
                  const displayImg = c.image
                    ? (c.image.startsWith('http') ? c.image : `https://api.naflines.tech${c.image.startsWith('/') ? '' : '/'}${c.image}`)
                    : null
                  return (
                    <tr key={c._id || c.slug}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {displayImg ? (
                            <img
                              src={displayImg}
                              alt={c.name}
                              style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, background: '#F1F5F9' }}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#F3E8FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                              📂
                            </div>
                          )}
                          <span style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ color: '#6366F1', fontWeight: 600 }}>{c.slug}</td>
                      <td style={{ maxWidth: 300, color: '#64748B', fontSize: 13 }}>{c.description || '—'}</td>
                      <td>
                        <span className="badge badge-info">#{c.displayOrder ?? 0}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEditModal(c)} className="btn btn-secondary btn-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(c._id)} className="btn btn-danger-light btn-sm">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Category Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ultrasonic Plastic Welding"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Slug (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="ultrasonic-plastic-welding"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Image URL / Path</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg or /uploads/categories/impulse.png"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description (Shown on Homepage Technology card)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this technology..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
