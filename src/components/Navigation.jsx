import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navigation.css';

function Navigation() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          QUYEN
        </Link>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>
              Trang Chủ
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>
              Giới Thiệu
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/projects" className="nav-link" onClick={() => setMenuOpen(false)}>
              Dự Án
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/resume" className="nav-link" onClick={() => setMenuOpen(false)}>
              CV
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/blog" className="nav-link" onClick={() => setMenuOpen(false)}>
              Blog
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/library" className="nav-link" onClick={() => setMenuOpen(false)}>
              Thư Viện
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/private" className="nav-link" onClick={() => setMenuOpen(false)}>
              Riêng Tư
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>
              Liên Lạc
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
