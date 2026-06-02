import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navigation.css';
import { supabase } from '../utils/supabaseClient';
import { FiUser, FiSettings } from 'react-icons/fi';

function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" style={{ letterSpacing: '2px' }}>
          QUYEN<span style={{ color: '#10b981' }}>.</span>
        </Link>
        
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>☰</button>
        
        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li className="nav-item"><Link to="/" className="nav-link" onClick={() => setMenuOpen(false)}>Trang Chủ</Link></li>
          <li className="nav-item"><Link to="/about" className="nav-link" onClick={() => setMenuOpen(false)}>Giới Thiệu</Link></li>
          <li className="nav-item"><Link to="/projects" className="nav-link" onClick={() => setMenuOpen(false)}>Dự Án</Link></li>
          <li className="nav-item"><Link to="/resume" className="nav-link" onClick={() => setMenuOpen(false)}>Hồ Sơ</Link></li>
          <li className="nav-item"><Link to="/contact" className="nav-link" onClick={() => setMenuOpen(false)}>Liên Lạc</Link></li>
          
          {/* Nút Admin tinh tế nằm ở cuối */}
          <li className="nav-item" style={{ display: 'flex', alignItems: 'center', marginLeft: '1rem' }}>
            <Link to="/admin" onClick={() => setMenuOpen(false)} style={{ 
              color: isAdmin ? '#10b981' : '#6b7280', 
              fontSize: '1.2rem', 
              padding: '0.5rem',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }} title={isAdmin ? 'Trang quản trị' : 'Đăng nhập'}>
              {isAdmin ? <FiSettings /> : <FiUser />}
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;