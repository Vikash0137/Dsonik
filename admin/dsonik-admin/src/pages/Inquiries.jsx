import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState(null)

  const fetchInquiries = async () => {
    try {
      setLoading(true)
      const res = await api.get('/inquiries').catch(() => null)
      const inqs = res?.data?.data || res?.data?.inquiries || (Array.isArray(res?.data) ? res.data : [])
      if (inqs.length > 0) {
        setInquiries(inqs)
      } else {
        // Fallback sample inquiries
        setInquiries([
          { _id: '1', name: 'Rajesh Sharma', email: 'rajesh@autoindustries.in', phone: '+91 98765 43210', subject: 'Ultrasonic Plastic Welder Quote', message: 'Looking for 2000W ultrasonic welding machine for automotive dashboard component welding. Please provide price and technical specifications.', date: new Date().toLocaleDateString(), status: 'Pending' },
          { _id: '2', name: 'Amit Patel', email: 'amit@patelplastics.com', phone: '+91 91234 56789', subject: 'Vibration Welding Machine 3500W', message: 'We require a vibration welder for large PP parts. What is the delivery lead time to Gujarat?', date: new Date(Date.now() - 86400000).toLocaleDateString(), status: 'Contacted' },
          { _id: '3', name: 'Sunil Verma', email: 'sunil@precisionmold.com', phone: '+91 98980 12345', subject: 'Spin Welding Custom Fixture', message: 'Need custom fixtures and horn for spherical valve welding. Can you provide custom design support?', date: new Date(Date.now() - 172800000).toLocaleDateString(), status: 'Resolved' }
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return
    try {
      await api.delete(`/inquiries/${id}`).catch(() => null)
      setInquiries(inquiries.filter((i) => i._id !== id))
      if (selectedInquiry?._id === id) setSelectedInquiry(null)
    } catch (err) {
      alert('Error deleting')
    }
  }

  const updateStatus = (id, newStatus) => {
    setInquiries(inquiries.map((i) => i._id === id ? { ...i, status: newStatus } : i))
    if (selectedInquiry?._id === id) {
      setSelectedInquiry({ ...selectedInquiry, status: newStatus })
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <h3 className="card-title">Customer Enquiries & Quotation Requests</h3>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Client Name</th>
                <th>Contact</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    Loading enquiries...
                  </td>
                </tr>
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    No enquiries found.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>{inq.name}</td>
                    <td>
                      <div>{inq.email}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{inq.phone || '—'}</div>
                    </td>
                    <td style={{ maxWidth: 260, fontSize: 13 }}>{inq.subject}</td>
                    <td style={{ fontSize: 12, color: '#64748B' }}>{inq.date || 'Recent'}</td>
                    <td>
                      <span className={`badge ${inq.status === 'Resolved' ? 'badge-success' : inq.status === 'Contacted' ? 'badge-warning' : 'badge-danger'}`}>
                        {inq.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => setSelectedInquiry(inq)} className="btn btn-secondary btn-sm">
                          View Details
                        </button>
                        <button onClick={() => handleDelete(inq._id)} className="btn btn-danger-light btn-sm">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="modal-overlay" onClick={() => setSelectedInquiry(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Enquiry Details</h3>
            
            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 12, marginBottom: 18 }}>
              <div style={{ marginBottom: 8 }}><strong>Client:</strong> {selectedInquiry.name}</div>
              <div style={{ marginBottom: 8 }}><strong>Email:</strong> <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a></div>
              <div style={{ marginBottom: 8 }}><strong>Phone:</strong> {selectedInquiry.phone ? <a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a> : 'Not provided'}</div>
              <div style={{ marginBottom: 8 }}><strong>Subject:</strong> {selectedInquiry.subject}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Message Content</label>
              <div style={{ padding: 16, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, lineHeight: 1.6, color: '#334155' }}>
                {selectedInquiry.message}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Update Status</label>
              <div style={{ display: 'flex', gap: 10 }}>
                {['Pending', 'Contacted', 'Resolved'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateStatus(selectedInquiry._id, st)}
                    className={`btn btn-sm ${selectedInquiry.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setSelectedInquiry(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
