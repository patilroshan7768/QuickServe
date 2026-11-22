import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ServiceImage from '../components/ServiceImage';
import { formatPrice } from '../utils/format';

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get(`/services/${id}`)
      .then(({ data }) => { if (!cancelled) setService(data); })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.status === 404
          ? 'This service does not exist or is no longer available.'
          : getErrorMessage(err, 'Could not load this service.'));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <LoadingSpinner fullPage label="Loading service..." />;

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <p role="alert" className="text-slate-600">{error}</p>
        <Link to="/services" className="btn-primary mt-6">Browse services</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/services" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600">
        <ArrowLeft size={16} /> Back to services
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <ServiceImage src={service.imageUrl} alt={service.name} category={service.category}
                      className="h-72 w-full rounded-2xl shadow-sm sm:h-96" />
        <div>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            {service.category}
          </span>
          <h1 className="mt-4 text-3xl font-extrabold text-slate-900">{service.name}</h1>
          <p className="mt-4 text-3xl font-extrabold text-indigo-600">{formatPrice(service.price)}</p>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-slate-600">{service.description}</p>
          <div className="mt-8">
            {isAdmin ? (
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                You are logged in as an admin. Only customers can book services.
              </p>
            ) : (
              <Link to={`/book/${service.id}`} className="btn-primary !px-8 !py-3">Book Now</Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
