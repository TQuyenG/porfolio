import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Navigation.css';
import { supabase } from '../utils/supabaseClient';
import { FiUser, FiSettings, FiX, FiMenu } from 'react-icons/fi';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const location = useLocation();

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || '';
      if (data?.session?.user && (!adminEmail || data.session.user.email === adminEmail)) {
        setIsAdmin(true);
      }
    };
    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || '';
      setIsAdmin(!!(session?.user && (!adminEmail || session.user.email === adminEmail)));
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <style>{`
        .navbar {
          position: sticky !important;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 9999 !important;
          background-color: ${isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff'} !important;
          backdrop-filter: ${isScrolled ? 'blur(10px)' : 'none'};
          box-shadow: ${isScrolled ? '0 4px 20px rgba(0, 0, 0, 0.05)' : 'none'} !important;
          transition: background-color 0.3s ease, box-shadow 0.3s ease, backdrop-filter 0.3s ease;
          height: 80px; 
          border-bottom: ${isScrolled ? 'none' : '1px solid rgba(0,0,0,0.05)'};
        }

        .nav-container {
          display: flex !important;
          justify-content: space-between !important; 
          align-items: center !important;
          width: 100%;
          max-width: 1200px;
          height: 100%;
          margin: 0 auto;
          padding: 0 1.5rem;
        }

        .nav-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: transform 0.2s ease;
        }
        
        .nav-logo:hover {
          transform: scale(1.05);
        }

        .nav-menu {
          display: flex !important;
          align-items: center;
          gap: 2.5rem; 
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav-link {
          text-decoration: none;
          font-size: 1rem;
          transition: all 0.2s;
          padding: 0.5rem 0;
          position: relative;
        }

        .nav-link.active {
          color: #6366f1 !important; 
          font-weight: 800 !important;
        }
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #6366f1;
          border-radius: 4px;
        }
        
        .nav-link:not(.active) {
          color: #64748b;
          font-weight: 600;
        }
        .nav-link:hover:not(.active) {
          color: #6366f1;
        }

        .menu-toggle {
          display: none;
          background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #1e1b4b;
        }
        
        @media (max-width: 768px) {
          .menu-toggle { display: block; } 
          
          .nav-menu {
            position: absolute;
            top: 80px; 
            left: 0; 
            right: 0;
            background: #ffffff;
            flex-direction: column !important;
            padding: 2rem !important;
            gap: 1.5rem !important;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            transform: translateY(-150%);
            opacity: 0;
            transition: all 0.4s ease;
            pointer-events: none;
          }
          
          .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }
          
          .nav-link.active::after {
            display: none; 
          }
        }
      `}</style>

      <nav className="navbar">
        <div className="nav-container">
          
          {/* SỬ DỤNG PUBLIC_URL ĐỂ FIX LỖI ĐƯỜNG DẪN ẢNH */}
          <Link to="/" className="nav-logo">
            <img 
              src={process.env.PUBLIC_URL + '/images/logo.png'} 
              alt="Quyen Logo" 
              style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
            />
          </Link>
          
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
          
          <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Trang Chủ</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Giới Thiệu</Link>
            </li>
            <li className="nav-item">
              <Link to="/projects" className={`nav-link ${isActive('/projects') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dự Án</Link>
            </li>
            <li className="nav-item">
              <Link to="/blog" className={`nav-link ${isActive('/blog') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Bài Viết</Link>
            </li>
            <li className="nav-item">
              <Link to="/resume" className={`nav-link ${isActive('/resume') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Hồ Sơ</Link>
            </li>
            <li className="nav-item">
              <Link to="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Liên Lạc</Link>
            </li>
            <li className="nav-item" style={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ 
                color: isAdmin ? '#10b981' : '#cbd5e1', 
                fontSize: '1.2rem', 
                padding: '0.6rem',
                borderRadius: '50%',
                backgroundColor: isActive('/admin') ? '#e0e7ff' : '#f8fafc',
                border: isActive('/admin') ? '1px solid #6366f1' : '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s'
              }} title={isAdmin ? 'Trang quản trị' : 'Đăng nhập'}>
                {isAdmin ? <FiSettings /> : <FiUser />}
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default Navigation;