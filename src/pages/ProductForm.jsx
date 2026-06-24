import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { create, getById, update } from '../api/products';

const empty = { name: '', sku: '', price: '', quantity: '' };

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getById(id)
      .then(({ data }) =>
        setForm({ name: data.data.name, sku: data.data.sku, price: data.data.price, quantity: data.data.quantity })
      )
      .catch(() => setError('Failed to load product.'));
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      sku: form.sku,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };
    try {
      if (isEdit) {
        await update(id, payload);
      } else {
        await create(payload);
      }
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Save failed.');
    }
  };

  const fields = [
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'sku', label: 'SKU', type: 'text' },
    { name: 'price', label: 'Price', type: 'number', step: '0.01' },
    { name: 'quantity', label: 'Quantity', type: 'number' },
  ];

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Product' : 'New Product'}
      </h2>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {fields.map(({ name, label, type, step }) => (
            <label key={name} className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-gray-700">{label}</span>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                required
                min={type === 'number' ? 0 : undefined}
                step={step}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </label>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
