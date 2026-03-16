import React from 'react';

export default function Footer() {
    return (
        <footer style={styles.footer}>
            <div className="container" style={{ textAlign: 'center' }}>
                <p style={styles.text}>© {new Date().getFullYear()} Income Tax Department, Government of India</p>
                <p style={styles.sub}>This is an educational demo clone. Not affiliated with the Government of India.</p>
            </div>
        </footer>
    );
}

const styles = {
    footer: { background: '#002060', padding: '20px 0', marginTop: 'auto' },
    text: { color: 'rgba(255,255,255,.7)', fontSize: 13 },
    sub: { color: 'rgba(255,255,255,.35)', fontSize: 11, marginTop: 4 },
};