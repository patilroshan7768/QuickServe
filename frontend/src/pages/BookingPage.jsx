import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import BookingForm from '../components/BookingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceImage from '../components/ServiceImage';
import { formatPrice } from '../utils/format';

export default function BookingPage() {
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get(`/services/${serviceId}`)
      .then(({ data }) => { if (!cancelled) setService(data); })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.status === 404
          ? 'This service does not exist or is no longer available.'
          : getErrorMessage(err, 'Could not load this service.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [serviceId]);

  if (loading) return <LoadingSpinner fullPage label="Loading..." />;
  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p role="alert" className="text-slate-600">{error}</p>
        <Link to="/services" className="btn-primary mt-6">Browse services</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Book your service</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3 sm:p-8">
          <BookingForm service={service} />
        </div>
        <aside className="card h-fit overflow-hidden lg:col-span-2">
          <ServiceImage src={service.imageUrl} alt={service.name} category={service.category} className="h-40 w-full" />
          <div className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{service.category}</p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">{service.name}</h2>
            <p className="mt-3 text-2xl font-extrabold text-indigo-600">{formatPrice(service.price)}</p>
            <p className="mt-3 text-xs text-slate-500">Your booking starts as Pending until our team approves it.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
