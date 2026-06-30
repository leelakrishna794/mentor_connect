import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      padding: '2rem',
      textAlign: 'center',
      borderTop: '1px solid var(--border-dark)',
      marginTop: 'auto',
      fontSize: '0.9rem',
      color: 'var(--text-secondary-dark)'
    }} className="app-footer">
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <strong>MentorConnect</strong> &copy; {new Date().getFullYear()} — Professional Mentorship Platform.
        </div>
        <div>
          Designed by Leela Krishna M | Developed using MERN Stack
        </div>
      </div>
    </footer>
  );
};

export default Footer;
