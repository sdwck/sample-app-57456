import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductsPage from './pages/ProductsPage';
import OrdersPage from './pages/OrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <nav style={{
          background: '#fff',
          padding: '1rem 2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Lab 2</h1>
            <Link to="/" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>
              Products
            </Link>
            <Link to="/orders" style={{ textDecoration: 'none', color: '#333', fontWeight: 500 }}>
              Orders
            </Link>
          </div>
        </nav>
        
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}