function Bone({ className }) {
  return <div className={`bg-gray-100 animate-pulse rounded ${className}`} />;
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm">
      <Bone className="h-3 w-28 mb-3" />
      <Bone className="h-7 w-16" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Name', 'SKU', 'Price', 'Qty', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4"><Bone className="h-4 w-40" /></td>
                <td className="px-6 py-4"><Bone className="h-4 w-24" /></td>
                <td className="px-6 py-4"><Bone className="h-4 w-16" /></td>
                <td className="px-6 py-4"><Bone className="h-5 w-14 rounded-full" /></td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Bone className="h-7 w-7 rounded-md" />
                    <Bone className="h-7 w-7 rounded-md" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
