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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <Link to="/products/new">
          <button className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer">
            + New Product
          </button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No products found.</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {['Name', 'SKU', 'Price', 'Quantity', 'Actions'].map((h) => (
                  <th key={h} className="px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800">{p.name}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{p.sku}</td>
                  <td className="px-6 py-4 text-gray-700">${p.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-gray-700">{p.quantity}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <Link to={`/products/${p._id}/edit`}>
                      <button className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer">
                        Edit
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
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
