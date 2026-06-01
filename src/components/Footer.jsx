import React from 'react';
import '../styles/Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Quyen. Tất cả quyền được bảo lưu.</p>
        <div className="social-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" title="GitHub">
            GitHub
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" title="LinkedIn">
            LinkedIn
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" title="Twitter">
            Twitter
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
