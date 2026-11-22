import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Sparkles,
  ThumbsUp,
} from 'lucide-react';
import api, { getErrorMessage } from '../api/axios';
import ServiceCard from '../components/ServiceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { CATEGORIES } from '../utils/constants';

const STEPS = [
  {
    icon: Search,
    title: 'Choose a service',
    text: 'Browse transparent pricing across trusted home services and pick what you need.',
  },
  {
    icon: CalendarDays,
    title: 'Pick a date & time',
    text: 'Select a convenient slot that fits your schedule and enter your address.',
  },
  {
    icon: ClipboardCheck,
    title: 'Get it confirmed',
    text: 'Our operations team reviews and approves your booking promptly.',
  },
  {
    icon: ThumbsUp,
    title: 'Sit back & relax',
    text: 'A background-checked professional arrives on time and gets the job done.',
  },
];

const QUICK_TAGS = ['Deep Cleaning', 'Plumbing Repair', 'AC Service', 'Electrician'];

export default function HomePage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api
      .get('/services')
      .then(({ data }) => {
        if (!cancelled) setFeatured(data.slice(0, 3));
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, 'Could not load services.'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/services?search=${encodeURIComponent(query.trim())}` : '/services');
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-50/90 via-white to-slate-50/50">
        {/* Decorative ambient glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[420px] w-[780px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/40 via-purple-200/35 to-sky-200/40 blur-3xl"
        />

        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-sm backdrop-blur">
            <Sparkles size={14} className="text-indigo-600" />
            <span>On-demand home care, simplified</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:leading-[1.1]">
            Book Trusted Services,{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
              Anytime.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Cleaning, plumbing, electrical repairs, and appliance care. Verified local professionals at your doorstep in just a few clicks.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-col gap-2.5 rounded-3xl border border-slate-200/90 bg-white p-2 shadow-xl shadow-indigo-950/5 sm:flex-row sm:rounded-full"
          >
            <div className="relative flex flex-1 items-center">
              <Search size={19} className="pointer-events-none absolute left-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What service do you need today?"
                aria-label="Search services"
                className="w-full rounded-full border-0 bg-transparent py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 sm:text-base"
              />
            </div>
            <button
              type="submit"
              className="btn-primary inline-flex items-center justify-center gap-2 !rounded-full !px-7 !py-3 text-sm font-semibold shadow-md shadow-indigo-600/20 transition hover:shadow-lg hover:shadow-indigo-600/30"
            >
              <span>Search</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick search pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-medium text-slate-400">Popular:</span>
            {QUICK_TAGS.map((tag) => (
              <Link
                key={tag}
                to={`/services?search=${encodeURIComponent(tag)}`}
                className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50/70 hover:text-indigo-700"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-slate-200/70 pt-8 text-xs font-medium text-slate-500 sm:text-sm">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Verified Professionals
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-indigo-600" />
              Upfront Transparent Pricing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={16} className="text-violet-600" />
              Flexible Time Slots
            </span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Explore Specialties
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Popular Categories
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            Jump straight into the service category you need help with.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map(({ name, icon: Icon }) => (
            <Link
              key={name}
              to={`/services?category=${encodeURIComponent(name)}`}
              className="group relative flex flex-col items-center gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1.5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-950/5"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-all duration-200 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:from-indigo-600 group-hover:to-violet-600 group-hover:text-white group-hover:shadow-md group-hover:shadow-indigo-600/25">
                <Icon size={24} />
              </span>
              <span className="text-sm font-semibold text-slate-800 transition-colors group-hover:text-indigo-600">
                {name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y border-slate-200/70 bg-slate-50/80">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Top Picks
              </span>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Featured Services
              </h2>
            </div>
            <Link
              to="/services"
              className="group inline-flex items-center gap-1.5 self-start rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 sm:self-auto"
            >
              <span>View all services</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {loading && (
            <div className="mt-10">
              <LoadingSpinner label="Loading services..." />
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          )}

          {!loading && !error && featured.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No services available yet. Please check back soon.
            </div>
          )}

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Simple Process
          </span>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            How It Works
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500 sm:text-base">
            From booking to doorstep service in four straightforward steps.
          </p>
        </div>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Connecting line on desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[12%] right-[12%] top-8 hidden border-t-2 border-dashed border-indigo-200 lg:block"
          />

          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className="relative flex flex-col items-center rounded-2xl border border-slate-200/70 bg-white p-6 text-center shadow-sm transition hover:border-indigo-200 hover:shadow-md"
            >
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                <Icon size={26} />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-indigo-100 bg-white text-xs font-extrabold text-indigo-600 shadow-sm">
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-12 text-center text-white shadow-xl shadow-indigo-900/15 sm:px-12 sm:py-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-950/20 blur-2xl"
          />

          <h2 className="relative text-2xl font-extrabold tracking-tight sm:text-4xl">
            Ready to book your next home service?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-sm text-indigo-100 sm:text-base">
            Explore all available services, compare transparent rates, and schedule a slot in under a minute.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-indigo-600 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
            >
              <span>Browse All Services</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}