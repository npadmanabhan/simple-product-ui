import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { create, getById, update } from '../api/products';
import { SpinnerIcon } from '../components/icons';
import { useToast } from '../components/Toast';

const empty = { name: '', sku: '', price: '', quantity: '' };

const validators = {
  name: v => (v.trim() ? null : 'Name is required.'),
  sku: v => (v.trim() ? null : 'SKU is required.'),
  price: v => {
    if (!String(v).trim()) return 'Price is required.';
    if (Number(v) <= 0) return 'Price must be greater than 0.';
    return null;
  },
  quantity: v => {
    if (String(v).trim() === '') return 'Quantity is required.';
    if (Number(v) < 0) return 'Quantity must be 0 or more.';
    return null;
  },
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addToast = useToast();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getById(id)
      .then(({ data }) => {
        const { name, sku, price, quantity } = data.data;
        setForm({ name, sku, price: String(price), quantity: String(quantity) });
      })
      .catch(() => setLoadError('Failed to load product. Please go back and try again.'));
  }, [id, isEdit]);

  const validate = (values) =>
    Object.fromEntries(
      Object.entries(validators).map(([k, fn]) => [k, fn(values[k])])
    );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors(prev => ({ ...prev, [name]: validators[name]?.(value) ?? null }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    setErrors(prev => ({ ...prev, [name]: validators[name]?.(value) ?? null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.fromEntries(Object.keys(empty).map(k => [k, true]));
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      if (isEdit) {
        await update(id, payload);
        addToast(`"${payload.name}" updated successfully.`, 'success');
      } else {
        await create(payload);
        addToast(`"${payload.name}" created successfully.`, 'success');
      }
      navigate('/products');
    } catch (err) {
      addToast(err.response?.data?.message ?? 'Save failed. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6" aria-label="Breadcrumb">
        <Link to="/products" className="hover:text-gray-800 transition-colors">Products</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 font-medium">{isEdit ? 'Edit' : 'New Product'}</span>
      </nav>

      {/* Page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEdit ? 'Update the details below and save.' : 'Fill in the details to add a product to your catalog.'}
        </p>
      </div>

      {loadError && (
        <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {loadError}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-5 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700">Product details</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Name — full width */}
            <Field
              name="name"
              label="Product name"
              type="text"
              placeholder="e.g. Wireless Keyboard"
              value={form.name}
              error={errors.name}
              touched={touched.name}
              disabled={saving}
              onChange={handleChange}
              onBlur={handleBlur}
              className="sm:col-span-2"
            />

            {/* SKU — full width */}
            <Field
              name="sku"
              label="SKU"
              type="text"
              placeholder="e.g. WK-001"
              value={form.sku}
              error={errors.sku}
              touched={touched.sku}
              disabled={saving}
              onChange={handleChange}
              onBlur={handleBlur}
              className="sm:col-span-2"
            />

            {/* Price — half width */}
            <Field
              name="price"
              label="Price"
              type="number"
              step="0.01"
              placeholder="0.00"
              prefix="$"
              value={form.price}
              error={errors.price}
              touched={touched.price}
              disabled={saving}
              onChange={handleChange}
              onBlur={handleBlur}
            />

            {/* Quantity — half width */}
            <Field
              name="quantity"
              label="Quantity"
              type="number"
              placeholder="0"
              value={form.quantity}
              error={errors.quantity}
              touched={touched.quantity}
              disabled={saving}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </div>

          <div className="flex gap-3 pt-6 mt-2 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {saving && <SpinnerIcon className="w-3.5 h-3.5" />}
              {isEdit ? 'Save Changes' : 'Create Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/products')}
              disabled={saving}
              className="border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm font-medium px-5 py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ name, label, type, step, placeholder, prefix, value, error, touched, disabled, onChange, onBlur, className }) {
  const hasError = Boolean(error && touched);

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-describedby={hasError ? `${name}-error` : undefined}
          aria-invalid={hasError ? 'true' : undefined}
          className={[
            'w-full rounded-lg border text-sm text-gray-900 py-2 transition focus:outline-none focus:ring-2 focus:border-transparent placeholder:text-gray-300',
            prefix ? 'pl-6 pr-3' : 'px-3',
            hasError
              ? 'border-red-400 bg-red-50/40 focus:ring-red-400'
              : 'border-gray-300 bg-white focus:ring-indigo-500',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50',
          ].join(' ')}
        />
      </div>
      {hasError && (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
