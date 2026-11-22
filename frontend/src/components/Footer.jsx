import { Link } from 'react-router-dom';
import { CalendarCheck, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-100 bg-slate-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <CalendarCheck size={20} />
            </span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              Quick<span className="text-indigo-600">Serve</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm text-slate-500">
            Book trusted home services in a few clicks. Cleaning, plumbing, electrical work and more.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Quick Links</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-500">
            <li><Link to="/" className="hover:text-indigo-600">Home</Link></li>
            <li><Link to="/services" className="hover:text-indigo-600">Services</Link></li>
            <li><Link to="/login" className="hover:text-indigo-600">Login</Link></li>
            <li><Link to="/register" className="hover:text-indigo-600">Create account</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Contact</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-500">
            <li className="flex items-center gap-2"><Mail size={16} /> support@quickserve.example</li>
            <li className="flex items-center gap-2"><Phone size={16} /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> Kolhapur, Maharashtra</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} QuickServe. All rights reserved.
      </div>
    </footer>
  );
}
