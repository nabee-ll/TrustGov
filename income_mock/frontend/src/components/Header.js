import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = user ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/file-return', label: 'File Return' },
        { to: '/my-returns', label: 'My Returns' },
        { to: '/calculator', label: 'Tax Calculator' },
        { to: '/refund', label: 'Refund Status' },
    ] : [];

    return (
        <header style={styles.header}>
            {/* Top bar */}
            <div style={styles.topBar}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={styles.brand}>
                        <div style={styles.logo}>IT</div>
                        <div>
                            <div style={styles.brandTitle}>Income Tax Department</div>
                            <div style={styles.brandSub}>Government of India — e-Filing Portal</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {user ? (
                            <>
                                <span style={styles.userPill}>👤 {user.name?.split(' ')[0]} | {user.pan}</span>
                                <button className="btn btn-sm" style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
                            </>
                        ) : (
                            <div style={{ display: 'flex', gap: 8 }}>
                                <Link to="/login" className="btn btn-sm btn-secondary">Login</Link>
                                <Link to="/register" className="btn btn-sm btn-primary">Register</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav bar */}
            {user && (
                <nav style={styles.nav}>
                    <div className="container" style={{ display: 'flex', gap: 4 }}>
                        {navLinks.map(l => (
                            <Link key={l.to} to={l.to} style={{
                                ...styles.navLink,
                                ...(location.pathname === l.to ? styles.navLinkActive : {})
                            }}>{l.label}</Link>
                        ))}
                        <Link to="/profile" style={{
                            ...styles.navLink, marginLeft: 'auto',
                            ...(location.pathname === '/profile' ? styles.navLinkActive : {})
                        }}>My Profile</Link>
                    </div>
                </nav>
            )}
        </header>
    );
}

const styles = {
    header: { background: '#003580', boxShadow: '0 2px 12px rgba(0,0,0,.2)', position: 'sticky', top: 0, zIndex: 100 },
    topBar: { padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,.12)' },
    brand: { display: 'flex', alignItems: 'center', gap: 14 },
    logo: { width: 44, height: 44, background: '#f7a800', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18, color: '#002060', fontFamily: 'Playfair Display, serif' },
    brandTitle: { color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: 'Playfair Display, serif' },
    brandSub: { color: 'rgba(255,255,255,.6)', fontSize: 11 },
    userPill: { background: 'rgba(255,255,255,.12)', color: '#fff', padding: '5px 12px', borderRadius: 20, fontSize: 13 },
    logoutBtn: { background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.3)' },
    nav: { background: '#002060', padding: '0' },
    navLink: { color: 'rgba(255,255,255,.75)', padding: '10px 16px', fontSize: 13, fontWeight: 500, display: 'block', borderBottom: '2px solid transparent', transition: 'all .15s' },
    navLinkActive: { color: '#f7a800', borderBottom: '2px solid #f7a800' },
};