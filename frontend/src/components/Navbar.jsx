import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/services', label: 'Services' },
    ...(isCustomer ? [{ to: '/my-bookings', label: 'My Bookings' }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ];

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'
    }`;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <CalendarCheck size={20} />
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">
            Quick<span className="text-indigo-600">Serve</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <span className="text-sm text-slate-600">
                Hi, <span className="font-semibold text-slate-900">{user.name.split(' ')[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn-secondary !px-4 !py-2">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary !px-4 !py-2">Login</Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile navigation */}
      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <hr className="border-slate-100" />
            {user ? (
              <>
                <p className="text-sm text-slate-600">
                  Signed in as <span className="font-semibold text-slate-900">{user.name}</span>
                </p>
                <button onClick={handleLogout} className="btn-secondary">
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="btn-secondary flex-1" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn-primary flex-1" onClick={() => setOpen(false)}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
