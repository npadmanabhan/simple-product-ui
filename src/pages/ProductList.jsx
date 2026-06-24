import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll, remove } from '../api/products';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await getAll();
      setProducts(data.data);
    } catch {
      setError('Failed to load products.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await remove(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      setError('Failed to delete product.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Products</h1>
        <Link to="/products/new">
          <button>+ New Product</button>
        </Link>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'SKU', 'Price', 'Quantity', 'Actions'].map((h) => (
                <th key={h} style={{ textAlign: 'left', borderBottom: '1px solid #ccc', padding: '8px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td style={{ padding: '8px' }}>{p.name}</td>
                <td style={{ padding: '8px' }}>{p.sku}</td>
                <td style={{ padding: '8px' }}>${p.price.toFixed(2)}</td>
                <td style={{ padding: '8px' }}>{p.quantity}</td>
                <td style={{ padding: '8px', display: 'flex', gap: '8px' }}>
                  <Link to={`/products/${p._id}/edit`}>
                    <button>Edit</button>
                  </Link>
                  <button onClick={() => handleDelete(p._id)} style={{ color: 'red' }}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
