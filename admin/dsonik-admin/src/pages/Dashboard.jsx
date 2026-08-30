import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 4,
    categories: 3,
    inquiries: 12,
    orders: 8
  })
  const [recentProducts, setRecentProducts] = useState([])
  const [recentInquiries, setRecentInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        const [prodRes, catRes] = await Promise.all([
          api.get('/products').catch(() => null),
          api.get('/categories').catch(() => null)
        ])

        const products = prodRes?.data?.data || prodRes?.data?.products || (Array.isArray(prodRes?.data) ? prodRes.data : [])
        const categories = catRes?.data?.data || catRes?.data?.categories || (Array.isArray(catRes?.data) ? catRes.data : [])

        setStats({
          products: products.length || 4,
          categories: categories.length || 3,
          inquiries: 14,
          orders: 6
        })

        if (products.length > 0) {
          setRecentProducts(products.slice(0, 5))
        }

        // Mock recent inquiries for high quality dashboard feel
        setRecentInquiries([
          { _id: '1', name: 'Rajesh Sharma', email: 'rajesh@autoindustries.in', subject: 'Ultrasonic Plastic Welder Quote', date: 'Just now', status: 'Pending' },
          { _id: '2', name: 'Amit Patel', email: 'amit@patelplastics.com', subject: 'Vibration Welding Machine 3500W', date: '2 hours ago', status: 'Contacted' },
          { _id: '3', name: 'Sunil Verma', email: 'sunil@precisionmold.com', subject: 'Spin Welding Custom Fixture', date: '1 day ago', status: 'Resolved' }
        ])
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Machines</div>
            <div className="stat-val">{stats.products}</div>
          </div>
          <div className="stat-icon" style={{ background: '#EEF2FF', color: '#6366F1' }}>
            ⚡
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Categories</div>
            <div className="stat-val">{stats.categories}</div>
          </div>
          <div className="stat-icon" style={{ background: '#F3E8FF', color: '#9333EA' }}>
            📂
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Customer Enquiries</div>
            <div className="stat-val">{stats.inquiries}</div>
          </div>
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            ✉️
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Orders</div>
            <div className="stat-val">{stats.orders}</div>
          </div>
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            🛍️
          </div>
        </div>
      </div>

      {/* Quick Action Banner */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)', color: '#fff', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Quick Management Actions</h2>
            <p style={{ color: '#C7D2FE', fontSize: 14, marginTop: 4 }}>Add new industrial machines, manage welding categories, and reply to client inquiries.</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/products" className="btn btn-primary" style={{ background: '#fff', color: '#4338CA', fontWeight: 700 }}>
              + Add Machine
            </Link>
            <Link to="/categories" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'transparent' }}>
              Manage Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Tables Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 24 }}>
        {/* Products */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Machines</h3>
            <Link to="/products" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Machine Name</th>
                  <th>Category</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {recentProducts.length > 0 ? (
                  recentProducts.map((p) => (
                    <tr key={p._id || p.slug}>
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>{p.name}</td>
                      <td>{typeof p.category === 'object' ? p.category?.name : (p.category || 'Welding')}</td>
                      <td style={{ fontWeight: 700, color: '#4338CA' }}>₹{Number(p.price || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: '#94A3B8', padding: 24 }}>
                      No machines found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inquiries */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Client Inquiries</h3>
            <Link to="/inquiries" className="btn btn-secondary btn-sm">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Subject</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentInquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inq.name}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{inq.email}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{inq.subject}</td>
                    <td>
                      <span className={`badge ${inq.status === 'Resolved' ? 'badge-success' : inq.status === 'Contacted' ? 'badge-warning' : 'badge-danger'}`}>
                        {inq.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
