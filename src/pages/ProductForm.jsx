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
    <div>
      <h1>{isEdit ? 'Edit Product' : 'New Product'}</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px' }}>
        {fields.map(({ name, label, type, step }) => (
          <label key={name} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {label}
            <input
              name={name}
              type={type}
              value={form[name]}
              onChange={handleChange}
              required
              min={type === 'number' ? 0 : undefined}
              step={step}
            />
          </label>
        ))}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="submit">{isEdit ? 'Save Changes' : 'Create Product'}</button>
          <button type="button" onClick={() => navigate('/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
