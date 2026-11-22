import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api, { getErrorMessage } from '../../api/axios';
import useDebounce from '../../hooks/useDebounce';
import LoadingSpinner from '../LoadingSpinner';
import StatusBadge from '../StatusBadge';
import { BOOKING_STATUSES } from '../../utils/constants';
import { formatDate, formatTime } from '../../utils/format';

export default function BookingManager({ onChanged }) {
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get('/bookings', { params: { status: status || undefined, search: search || undefined } })
      .then(({ data }) => { if (!cancelled) setBookings(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, 'Could not load bookings.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [status, search, refresh]);

  const changeStatus = async (booking, newStatus) => {
    if (newStatus === 'REJECTED' && !window.confirm('Reject this booking?')) return;
    setUpdatingId(booking.id);
    setError('');
    try {
      await api.patch(`/bookings/${booking.id}/status`, { status: newStatus });
      setRefresh((n) => n + 1);
      onChanged();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not update the booking.'));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900">Manage Bookings</h2>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                 placeholder="Search by customer, email, service or booking ID"
                 aria-label="Search bookings" className="input pl-11" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="input sm:w-48">
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {loading && <LoadingSpinner label="Loading bookings..." />}
      {!loading && !error && bookings.length === 0 && (
        <div className="card mt-6 p-10 text-center text-slate-500">No bookings found.</div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="card mt-6 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th><th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Service</th><th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Address</th><th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 align-top">
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 text-slate-500">#{b.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{b.customerName}</p>
                    <p className="text-xs text-slate-500">{b.customerEmail}</p>
                    {b.customerPhone && <p className="text-xs text-slate-500">{b.customerPhone}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{b.serviceName}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                    {formatDate(b.bookingDate)}<br /><span className="text-xs text-slate-500">{formatTime(b.bookingTime)}</span>
                  </td>
                  <td className="max-w-[200px] px-4 py-3 text-slate-600">{b.address}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {b.status === 'PENDING' && (
                        <>
                          <button disabled={updatingId === b.id} onClick={() => changeStatus(b, 'APPROVED')} className="btn-primary !px-3 !py-1.5 !text-xs">Approve</button>
                          <button disabled={updatingId === b.id} onClick={() => changeStatus(b, 'REJECTED')} className="btn-danger !px-3 !py-1.5 !text-xs">Reject</button>
                        </>
                      )}
                      {b.status === 'APPROVED' && (
                        <button disabled={updatingId === b.id} onClick={() => changeStatus(b, 'COMPLETED')} className="btn-primary !px-3 !py-1.5 !text-xs">Mark Completed</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
