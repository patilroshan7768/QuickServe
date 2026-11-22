import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ListChecks, ThumbsUp } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import AdminSidebar from '../components/AdminSidebar';
import BookingManager from '../components/admin/BookingManager';
import ServiceManager from '../components/admin/ServiceManager';

const CARDS = [
  { key: 'total', label: 'Total Bookings', icon: ListChecks, color: 'bg-indigo-50 text-indigo-600' },
  { key: 'pending', label: 'Pending', icon: Clock, color: 'bg-amber-50 text-amber-600' },
  { key: 'approved', label: 'Approved', icon: ThumbsUp, color: 'bg-blue-50 text-blue-600' },
  { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-green-50 text-green-600' },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('bookings');
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [statsVersion, setStatsVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api.get('/bookings/stats')
      .then(({ data }) => { if (!cancelled) { setStats(data); setStatsError(''); } })
      .catch((err) => { if (!cancelled) setStatsError(getErrorMessage(err, 'Could not load statistics.')); });
    return () => { cancelled = true; };
  }, [statsVersion]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-slate-50 md:flex-row">
      <AdminSidebar active={tab} onChange={setTab} />
      <div className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>

        {statsError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{statsError}</p>}
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {CARDS.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="card flex items-center gap-4 p-5">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${color}`}><Icon size={24} /></span>
              <div>
                <p className="text-2xl font-extrabold text-slate-900">{stats ? stats[key] : '–'}</p>
                <p className="text-xs font-medium text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          {tab === 'bookings'
            ? <BookingManager onChanged={() => setStatsVersion((v) => v + 1)} />
            : <ServiceManager />}
        </div>
      </div>
    </div>
  );
}
