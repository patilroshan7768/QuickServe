import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceImage from '../components/ServiceImage';
import StatusBadge from '../components/StatusBadge';
import { formatDate, formatPrice, formatTime } from '../utils/format';

export default function MyBookingsPage() {
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/bookings/my')
      .then(({ data }) => { if (!cancelled) setBookings(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, 'Could not load your bookings.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancellingId(id);
    setActionError('');
    try {
      const { data } = await api.patch(`/bookings/${id}/cancel`);
      setBookings((list) => list.map((b) => (b.id === id ? data : b)));
    } catch (err) {
      setActionError(getErrorMessage(err, 'Could not cancel the booking.'));
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>

      {location.state?.justBooked && (
        <div role="status" className="mt-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Booking submitted! It is pending approval.
        </div>
      )}
      {actionError && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</div>
      )}

      {loading && <LoadingSpinner label="Loading your bookings..." />}
      {error && <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <div className="card mt-8 p-10 text-center">
          <p className="text-slate-500">You haven't booked anything yet.</p>
          <Link to="/services" className="btn-primary mt-5">Browse services</Link>
        </div>
      )}

      <div className="mt-8 space-y-4">
        {bookings.map((b) => (
          <article key={b.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
            <ServiceImage src={b.serviceImageUrl} alt={b.serviceName} className="h-28 w-full rounded-xl sm:h-24 sm:w-32 sm:shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">{b.serviceName}</h2>
                <StatusBadge status={b.status} />
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><CalendarDays size={15} /> {formatDate(b.bookingDate)}</span>
                <span className="flex items-center gap-1.5"><Clock size={15} /> {formatTime(b.bookingTime)}</span>
                <span className="flex items-center gap-1.5"><MapPin size={15} /> {b.address}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-indigo-600">{formatPrice(b.servicePrice)}</p>
            </div>
            {b.status === 'PENDING' && (
              <button onClick={() => handleCancel(b.id)} disabled={cancellingId === b.id} className="btn-secondary">
                {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
              </button>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
