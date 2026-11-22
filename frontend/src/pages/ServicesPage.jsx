import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CATEGORIES } from '../utils/constants';

export default function ServicesPage() {
  const [params, setParams] = useSearchParams();
  const search = params.get('search') || '';
  const category = params.get('category') || '';

  const [input, setInput] = useState(search);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => setInput(search), [search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    api.get('/services', { params: { search, category } })
      .then(({ data }) => { if (!cancelled) setServices(data); })
      .catch((err) => { if (!cancelled) setError(getErrorMessage(err, 'Could not load services.')); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [search, category]);

  const setFilter = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const chip = (active) =>
    `rounded-full px-4 py-2 text-sm font-medium transition ${
      active ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-indigo-50'
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Our Services</h1>
      <p className="mt-2 text-slate-500">Find the right professional for the job.</p>

      <form onSubmit={(e) => { e.preventDefault(); setFilter('search', input.trim()); }}
            className="mt-8 flex max-w-xl gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={input} onChange={(e) => setInput(e.target.value)}
                 placeholder="Search services" aria-label="Search services" className="input pl-11" />
        </div>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={() => setFilter('category', '')} className={chip(!category)}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c.name} onClick={() => setFilter('category', c.name)}
                  className={chip(category.toLowerCase() === c.name.toLowerCase())}>
            {c.name}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner label="Loading services..." />}
      {error && <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && services.length === 0 && (
        <div className="card mt-10 p-10 text-center text-slate-500">No services match your search.</div>
      )}
      {!loading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => <ServiceCard key={s.id} service={s} />)}
        </div>
      )}
    </div>
  );
}
