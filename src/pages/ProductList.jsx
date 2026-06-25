import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAll, remove } from '../api/products';
import { ConfirmModal } from '../components/Modal';
import { StatCardSkeleton, TableSkeleton } from '../components/Skeleton';
import { useToast } from '../components/Toast';
import {
  ChevronsUpDownIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PackageIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from '../components/icons';

export default function ProductList() {
  const addToast = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: null, dir: 'asc' });
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAll()
      .then(({ data }) => { if (!cancelled) setProducts(data.data); })
      .catch(() => { if (!cancelled) addToast('Failed to load products.', 'error'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const toggleSort = (field) => {
    setSort(prev => {
      if (prev.field !== field) return { field, dir: 'asc' };
      if (prev.dir === 'asc') return { field, dir: 'desc' };
      return { field: null, dir: 'asc' };
    });
  };

  const filtered = useMemo(() => {
    let list = products;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }
    if (sort.field) {
      const dir = sort.dir === 'asc' ? 1 : -1;
      list = [...list].sort((a, b) => {
        if (a[sort.field] < b[sort.field]) return -dir;
        if (a[sort.field] > b[sort.field]) return dir;
        return 0;
      });
    }
    return list;
  }, [products, search, sort]);

  const totalQty = products.reduce((s, p) => s + p.quantity, 0);

  const openDelete = (product) => setDeleteModal({ open: true, product });
  const closeDelete = () => setDeleteModal({ open: false, product: null });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await remove(deleteModal.product._id);
      setProducts(prev => prev.filter(p => p._id !== deleteModal.product._id));
      addToast(`"${deleteModal.product.name}" deleted successfully.`, 'success');
      closeDelete();
    } catch {
      addToast('Failed to delete product.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div>
        {/* Page header */}
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Products</h2>
            <p className="mt-1 text-sm text-gray-500">Manage your product catalog</p>
          </div>
          <Link to="/products/new" className="shrink-0">
            <button className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
              <PlusIcon className="w-4 h-4" />
              New Product
            </button>
          </Link>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Total Products" value={products.length} />
              <StatCard label="Total Inventory" value={totalQty.toLocaleString()} suffix="units" />
            </>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Table or states */}
        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState hasSearch={Boolean(search.trim())} />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-left">
                    <SortableHeader field="name" label="Name" sort={sort} onSort={toggleSort} />
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">SKU</th>
                    <SortableHeader field="price" label="Price" sort={sort} onSort={toggleSort} />
                    <SortableHeader field="quantity" label="Qty" sort={sort} onSort={toggleSort} />
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-500 whitespace-nowrap">{p.sku}</td>
                      <td className="px-6 py-4 text-gray-700 tabular-nums whitespace-nowrap">
                        ${p.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.quantity === 0
                            ? 'bg-red-50 text-red-700'
                            : p.quantity < 10
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {p.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-0.5">
                          <Link to={`/products/${p._id}/edit`}>
                            <button
                              className="p-1.5 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit product"
                              aria-label={`Edit ${p.name}`}
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => openDelete(p)}
                            className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Delete product"
                            aria-label={`Delete ${p.name}`}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/60">
              <p className="text-xs text-gray-400">
                {filtered.length === products.length
                  ? `${products.length} ${products.length === 1 ? 'product' : 'products'}`
                  : `${filtered.length} of ${products.length} products`}
                {search.trim() ? ` matching "${search.trim()}"` : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteModal.product?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        isConfirming={isDeleting}
        onConfirm={handleDelete}
        onCancel={closeDelete}
      />
    </>
  );
}

function StatCard({ label, value, suffix }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900 tabular-nums">{value}</span>
        {suffix && <span className="text-sm text-gray-400 font-normal">{suffix}</span>}
      </div>
    </div>
  );
}

function SortableHeader({ field, label, sort, onSort }) {
  const active = sort.field === field;
  const Icon = active
    ? sort.dir === 'asc' ? ChevronUpIcon : ChevronDownIcon
    : ChevronsUpDownIcon;

  return (
    <th
      className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:text-gray-700 transition-colors"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-500' : 'text-gray-300'}`} />
      </span>
    </th>
  );
}

function EmptyState({ hasSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200 text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center mb-4">
        <PackageIcon className="w-8 h-8 text-gray-300" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700 mb-1">
        {hasSearch ? 'No products found' : 'No products yet'}
      </h3>
      <p className="text-sm text-gray-400 mb-6 max-w-xs">
        {hasSearch
          ? 'Try a different search term or clear the filter.'
          : 'Add your first product to start managing your catalog.'}
      </p>
      {!hasSearch && (
        <Link to="/products/new">
          <button className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm">
            <PlusIcon className="w-4 h-4" />
            Create Product
          </button>
        </Link>
      )}
    </div>
  );
}
