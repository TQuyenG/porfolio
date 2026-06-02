import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navigation.css';
import { supabase } from '../utils/supabaseClient';

function Navigation() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(()=>{
    let mounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || '';
      if (session?.user && (!adminEmail || session.user.email === adminEmail)) {
        if (mounted) setIsAdmin(true);
      } else {
        if (mounted) setIsAdmin(false);
      }
    };
    check();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session)=>{
      const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || '';
      if (session?.user && (!adminEmail || session.user.email === adminEmail)) setIsAdmin(true);
      else setIsAdmin(false);
    });
    return ()=> listener.subscription.unsubscribe();
  }, []);

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
          {isAdmin && (
            <li className="nav-item">
              <Link to="/admin" className="nav-link" onClick={() => setMenuOpen(false)}>
                Admin
              </Link>
            </li>
          )}
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
