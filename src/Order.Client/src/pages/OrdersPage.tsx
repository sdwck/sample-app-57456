import { useState, useEffect } from 'react';
import { type Order, type OrderRequest, type OrderUpdateRequest } from '../types';

const API_URL = 'http://localhost:8080';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<OrderRequest & { status?: string }>({ 
    productId: 0, 
    quantity: 0, 
    status: 'Pending' 
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: formData.productId,
          quantity: formData.quantity
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      setFormData({ productId: 0, quantity: 0, status: 'Pending' });
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleUpdate = async (id: number) => {
    setError(null);
    try {
      const updateData: OrderUpdateRequest = {
        quantity: formData.quantity,
        status: formData.status || 'Pending'
      };
      
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw new Error('Failed to update order');
      setEditingId(null);
      setFormData({ productId: 0, quantity: 0, status: 'Pending' });
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this order?')) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete order');
      fetchOrders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const startEdit = (order: Order) => {
    setEditingId(order.id);
    setFormData({
      productId: order.productId,
      quantity: order.quantity,
      status: order.status
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ productId: 0, quantity: 0, status: 'Pending' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>Orders (Order.API)</h2>

      {error && (
        <div style={{ padding: '1rem', background: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3>{editingId ? 'Edit Order' : 'Create Order'}</h3>
        <form onSubmit={editingId ? (e) => { e.preventDefault(); handleUpdate(editingId); } : handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: editingId ? '1fr 1fr' : '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {!editingId && (
              <input
                type="number"
                placeholder="Product ID"
                value={formData.productId || ''}
                onChange={(e) => setFormData({ ...formData, productId: parseInt(e.target.value) || 0 })}
                required
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              />
            )}
            <input
              type="number"
              placeholder="Quantity"
              value={formData.quantity || ''}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              required
              style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            {editingId && (
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            )}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" style={{
              padding: '0.5rem 1.5rem',
              background: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}>
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} style={{
                padding: '0.5rem 1.5rem',
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Product ID</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Quantity</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Created</th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>{order.id}</td>
                  <td style={{ padding: '1rem' }}>{order.productId}</td>
                  <td style={{ padding: '1rem' }}>{order.quantity}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      background: order.status === 'Completed' ? '#d4edda' : order.status === 'Pending' ? '#fff3cd' : '#f8d7da',
                      color: order.status === 'Completed' ? '#155724' : order.status === 'Pending' ? '#856404' : '#721c24'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => startEdit(order)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#ffc107',
                        color: '#000',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(order.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        background: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}