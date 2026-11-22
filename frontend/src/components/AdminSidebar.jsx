import { CalendarCheck, Wrench } from 'lucide-react';

const ITEMS = [
  { key: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { key: 'services', label: 'Services', icon: Wrench },
];

export default function AdminSidebar({ active, onChange }) {
  return (
    <aside className="border-b border-slate-100 bg-white md:w-60 md:shrink-0 md:border-b-0 md:border-r">
      <div className="hidden px-6 pb-2 pt-6 md:block">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Admin Panel</p>
      </div>
      <nav className="flex gap-2 p-3 md:flex-col md:p-4">
        {ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={`flex flex-1 items-center justify-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition md:flex-none md:justify-start ${
              active === key ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
