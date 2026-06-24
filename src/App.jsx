import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ProductList from './pages/ProductList';
import ProductForm from './pages/ProductForm';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/:id/edit" element={<ProductForm />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
