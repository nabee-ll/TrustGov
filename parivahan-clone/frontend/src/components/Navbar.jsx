import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App.jsx';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const navLinks = [
    { to: '/',                     label: 'Home' },
    { to: '/driving-license',      label: 'Driving Licence' },
    { to: '/vehicle-registration', label: 'Vehicle Registration' },
    { to: '/application-status',   label: 'Application Status' },
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
  ];

  return (
    <>
      {/* ── Tricolor Stripe ── */}
      <div className="flex h-1.5">
        <div className="flex-1 bg-orange-500" />
        <div className="flex-1 bg-white border-y border-gray-200" />
        <div className="flex-1 bg-green-600" />
      </div>

      {/* ── Government Header ── */}
      <div className="bg-[#003580] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Emblem */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-2xl">🇮🇳</span>
            </div>
          </div>

          {/* Title block */}
          <div className="flex-grow">
            <p className="text-xs text-blue-200 font-medium tracking-wide">भारत सरकार | Government of India</p>
            <h1 className="text-lg md:text-xl font-bold leading-tight">
              Ministry of Road Transport &amp; Highways
            </h1>
            <p className="text-sm text-orange-300 font-semibold tracking-wide">
              परिवहन सेवा | PARIVAHAN SEWA
            </p>
          </div>

          {/* Right badge */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              e-Services Portal
            </span>
            <span className="text-blue-200 text-xs">NIC | NationalInformaticsCentre</span>
          </div>
        </div>
      </div>

      {/* ── Main Nav Bar ── */}
      <nav className="bg-[#1a56db] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-11">

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors duration-150 ${
                    location.pathname === to
                      ? 'bg-white text-blue-800 font-semibold'
                      : 'text-white hover:bg-blue-700'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Auth section */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="text-white text-sm">
                    👤 <span className="font-semibold">{user?.name}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-1.5 rounded transition-colors"
                >
                  Login / Register
                </Link>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden pb-3 pt-1 border-t border-blue-600">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 text-sm text-white hover:bg-blue-700 rounded"
                >
                  {label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-blue-600">
                {isAuthenticated ? (
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-orange-300 font-semibold hover:bg-blue-700 rounded"
                  >
                    Logout ({user?.name})
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm text-orange-300 font-semibold hover:bg-blue-700 rounded"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Breadcrumb bar ── */}
      <div className="bg-gray-100 border-b border-gray-300 text-xs text-gray-500 px-4 py-1">
        <div className="max-w-7xl mx-auto">
          Home &rsaquo; <span className="text-blue-700 font-medium">Parivahan Sewa</span>
        </div>
      </div>
    </>
  );
}
