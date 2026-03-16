import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Home', path: '/' },
  {
    label: 'Individual/HUF', children: [
      { label: 'Salaried Employees', path: '#' },
      { label: 'Business/Profession', path: '#' },
      { label: 'Senior Citizen', path: '#' },
      { label: 'Non Resident', path: '#' },
      { label: 'HUF', path: '#' },
    ]
  },
  {
    label: 'Company', children: [
      { label: 'Domestic Company', path: '#' },
      { label: 'Foreign Company', path: '#' },
    ]
  },
  {
    label: 'Non-Company', children: [
      { label: 'AOP/BOI/Trust', path: '#' },
      { label: 'Firm/LLP', path: '#' },
    ]
  },
  { label: 'Tax Calculator', path: '/tax-calculator' },
  { label: 'Refund Status', path: '/refund-status' },
  { label: 'Downloads', path: '#' },
];

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      {/* Top bar */}
      <div className="header-top">
        <div className="header-top-inner">
          <Link to="/" className="logo-area">
            <div className="logo-icon">IT</div>
            <div className="logo-text">
              <h1>Income Tax Department</h1>
              <p>Government of India — e-Filing Portal</p>
            </div>
          </Link>
          <div className="header-actions">
            {isAuthenticated ? (
              <>
                <span className="user-greeting">👤 {user?.name?.split(' ')[0]}</span>
                <button className="btn-register" onClick={() => navigate('/dashboard')}>Dashboard</button>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <button className="btn-register" onClick={() => navigate('/dashboard')}>Dashboard</button>
            )}
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <nav className="nav-bar">
        <div className="nav-inner">
          {navItems.map((item, i) =>
            item.children ? (
              <div key={i} className="nav-item dropdown">
                <button className="nav-link">{item.label} ▾</button>
                <div className="dropdown-menu">
                  {item.children.map((child, j) => (
                    <Link key={j} to={child.path} className="dropdown-item">{child.label}</Link>
                  ))}
                </div>
              </div>
            ) : (
              <div key={i} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link${location.pathname === item.path ? ' active' : ''}`}
                >
                  {item.label}
                </Link>
              </div>
            )
          )}
          {isAuthenticated && (
            <>
              <div className="nav-item">
                <Link to="/file-return" className={`nav-link${location.pathname === '/file-return' ? ' active' : ''}`}>
                  File Return
                </Link>
              </div>
              <div className="nav-item">
                <Link to="/my-returns" className={`nav-link${location.pathname === '/my-returns' ? ' active' : ''}`}>
                  My Returns
                </Link>
              </div>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
