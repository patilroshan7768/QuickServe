const STYLES = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-200',
  APPROVED: 'bg-blue-50 text-blue-700 ring-blue-200',
  COMPLETED: 'bg-green-50 text-green-700 ring-green-200',
  REJECTED: 'bg-red-50 text-red-700 ring-red-200',
  CANCELLED: 'bg-slate-100 text-slate-600 ring-slate-200',
};

export default function StatusBadge({ status }) {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[status] || STYLES.CANCELLED}`}>
      {label}
    </span>
  );
}
