import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: '',
    price: '',
    stock: 5,
    shortDescription: '',
    description: '',
    image: '',
    isFeatured: false,
    isActive: true
  })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [prodRes, catRes] = await Promise.all([
        api.get('/products').catch(() => null),
        api.get('/categories').catch(() => null)
      ])

      const prods = prodRes?.data?.data || prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : [])
      const cats = catRes?.data?.data || catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : [])

      setProducts(prods)
      setCategories(cats)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      slug: '',
      category: categories[0]?._id || '',
      price: '',
      stock: 5,
      shortDescription: '',
      description: '',
      image: '',
      isFeatured: false,
      isActive: true
    })
    setModalOpen(true)
  }

  const openEditModal = (p) => {
    setEditingProduct(p)
    setFormData({
      name: p.name || '',
      slug: p.slug || '',
      category: typeof p.category === 'object' ? p.category?._id : (p.category || ''),
      price: p.price || '',
      stock: p.stock || 5,
      shortDescription: p.shortDescription || '',
      description: p.description || '',
      image: Array.isArray(p.images) ? p.images[0] : (p.image || ''),
      isFeatured: Boolean(p.isFeatured),
      isActive: p.isActive !== false
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        images: formData.image ? [formData.image] : []
      }

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, payload).catch(async () => {
          await api.put(`/products/${editingProduct._id}`, payload)
        })
      } else {
        await api.post('/admin/products', payload).catch(async () => {
          await api.post('/products', payload)
        })
      }

      setModalOpen(false)
      fetchData()
    } catch (err) {
      alert('Error saving product: ' + (err.response?.data?.message || err.message))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this machine?')) return
    try {
      await api.delete(`/admin/products/${id}`).catch(async () => {
        await api.delete(`/products/${id}`)
      })
      setProducts(products.filter((p) => p._id !== id))
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.message || err.message))
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (typeof p.category === 'string' && p.category.toLowerCase().includes(search.toLowerCase()))
    
    if (selectedCat === 'all') return matchesSearch
    const catId = typeof p.category === 'object' ? p.category?._id : p.category
    return matchesSearch && (catId === selectedCat || p.category?.slug === selectedCat)
  })

  return (
    <div>
      {/* Header & Controls */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 260, flexWrap: 'wrap' }}>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: 300 }}
              placeholder="Search machines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="form-select"
              style={{ maxWidth: 220 }}
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          <button onClick={openAddModal} className="btn btn-primary">
            + Add Machine
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Machine</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    Loading machines...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    No machines found. Click "+ Add Machine" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const img = Array.isArray(p.images) && p.images[0] ? p.images[0] : (p.image || '')
                  const displayImg = img.startsWith('http') ? img : `https://api.naflines.tech${img.startsWith('/') ? '' : '/'}${img}`
                  return (
                    <tr key={p._id || p.slug}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          {img ? (
                            <img
                              src={displayImg}
                              alt={p.name}
                              style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 8, background: '#F1F5F9' }}
                              onError={(e) => { e.currentTarget.style.display = 'none' }}
                            />
                          ) : (
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: '#EEF2FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                              ⚡
                            </div>
                          )}
                          <div>
                            <div style={{ fontWeight: 700, color: '#0F172A' }}>{p.name}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>{p.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td>{typeof p.category === 'object' ? p.category?.name : (p.category || 'N/A')}</td>
                      <td style={{ fontWeight: 700, color: '#4338CA' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
                      <td>{p.stock ?? 5} units</td>
                      <td>
                        <span className={`badge ${p.isFeatured ? 'badge-success' : 'badge-warning'}`}>
                          {p.isFeatured ? 'Featured' : 'Standard'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEditModal(p)} className="btn btn-secondary btn-sm">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="btn btn-danger-light btn-sm">
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
              {editingProduct ? 'Edit Welding Machine' : 'Add New Welding Machine'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Machine Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Ultrasonic Plastic Welding Machine 2000W"
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Price (INR ₹)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="e.g. 420000"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="5"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Slug (optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="auto-generated-if-blank"
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
                  placeholder="https://example.com/image.jpg or /uploads/products/image.jpg"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Description</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief summary for product card..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Technical Specs / Description</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed specifications, frequency, power output, applications..."
                />
              </div>

              <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span>Feature on Homepage ("Best Selling")</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  <span>Active & Visible</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingProduct ? 'Update Machine' : 'Create Machine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
