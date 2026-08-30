import React, { useEffect, useState } from 'react'
import api from '../api'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await api.get('/orders').catch(() => null)
      const ords = res?.data?.data || res?.data?.orders || (Array.isArray(res?.data) ? res.data : [])
      if (ords.length > 0) {
        setOrders(ords)
      } else {
        setOrders([
          { _id: 'ORD-9821', customer: 'Tata AutoComp Systems', email: 'procurement@tataautocomp.com', amount: 420000, items: 1, status: 'Processing', date: '28 Aug 2026' },
          { _id: 'ORD-9820', customer: 'Minda Corporation', email: 'minda.orders@mindagroup.com', amount: 760000, items: 2, status: 'Completed', date: '27 Aug 2026' },
          { _id: 'ORD-9819', customer: 'Supreme Polytech', email: 'purchase@supremepoly.in', amount: 180000, items: 1, status: 'Completed', date: '25 Aug 2026' }
        ])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const updateStatus = (id, newStatus) => {
    setOrders(orders.map((o) => o._id === id ? { ...o, status: newStatus } : o))
    if (selectedOrder?._id === id) {
      setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  return (
    <div>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 0 }}>
          <h3 className="card-title">Customer Equipment Orders</h3>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client Company</th>
                <th>Total Value</th>
                <th>Items</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 32, color: '#94A3B8' }}>
                    No orders recorded.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord._id}>
                    <td style={{ fontWeight: 700, color: '#6366F1' }}>{ord._id}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{ord.customer || ord.user?.name || 'Industrial Client'}</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>{ord.email || ord.user?.email}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: '#0F172A' }}>
                      ₹{Number(ord.totalAmount || ord.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td>{ord.items?.length || ord.items || 1} machines</td>
                    <td style={{ fontSize: 13, color: '#64748B' }}>{ord.date || 'Recent'}</td>
                    <td>
                      <span className={`badge ${ord.status === 'Completed' ? 'badge-success' : ord.status === 'Processing' ? 'badge-warning' : 'badge-info'}`}>
                        {ord.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => setSelectedOrder(ord)} className="btn btn-secondary btn-sm">
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16 }}>Order {selectedOrder._id}</h3>
            
            <div style={{ background: '#F8FAFC', padding: 18, borderRadius: 12, marginBottom: 18 }}>
              <div><strong>Client:</strong> {selectedOrder.customer || selectedOrder.user?.name}</div>
              <div style={{ marginTop: 6 }}><strong>Email:</strong> {selectedOrder.email || selectedOrder.user?.email}</div>
              <div style={{ marginTop: 6 }}><strong>Total Value:</strong> ₹{Number(selectedOrder.totalAmount || selectedOrder.amount || 0).toLocaleString('en-IN')}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Update Order Status</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Pending', 'Processing', 'Shipped', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateStatus(selectedOrder._id, st)}
                    className={`btn btn-sm ${selectedOrder.status === st ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <button onClick={() => setSelectedOrder(null)} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
