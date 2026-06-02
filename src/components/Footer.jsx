import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin, FiFacebook } from 'react-icons/fi';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [globalContent, setGlobalContent] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getPageContent('global');
      if (data) setGlobalContent(data);
    })();
  }, []);

  const email = globalContent?.email || 'quyen.ba@email.com';
  const phone = globalContent?.phone || '+84 xxx xxx xxx';
  const address = globalContent?.address || 'TP. Hồ Chí Minh, Việt Nam';
  const footerBio = globalContent?.footerBio || 'Chuyên viên Phân tích Nghiệp vụ...';
  const social = globalContent?.social || {};

  return (
    <footer className="footer" style={{ borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#4b5563', padding: '4rem 1rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
        
        <div>
          <h3 style={{ color: '#111827', fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '1px' }}>QUYEN<span style={{ color: '#2563eb' }}>.</span></h3>
          
          {/* RICH TEXT CHO FOOTER BIO */}
          <div style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#6b7280' }} dangerouslySetInnerHTML={{ __html: footerBio }} />
        </div>

        <div>
          <h4 style={{ color: '#111827', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase' }}>Liên Kết</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <li><Link to="/" style={{ color: '#4b5563', fontSize: '0.95rem', textDecoration: 'none' }}>Trang Chủ</Link></li>
            <li><Link to="/about" style={{ color: '#4b5563', fontSize: '0.95rem', textDecoration: 'none' }}>Giới Thiệu</Link></li>
            <li><Link to="/projects" style={{ color: '#4b5563', fontSize: '0.95rem', textDecoration: 'none' }}>Kho Dự Án</Link></li>
            <li><Link to="/blog" style={{ color: '#4b5563', fontSize: '0.95rem', textDecoration: 'none' }}>Bài Viết</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#111827', fontSize: '1rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase' }}>Thông Tin Tiếp Nhận</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem', fontSize: '0.95rem', color: '#4b5563' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiMail style={{ color: '#2563eb' }} /> <span>{email}</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiPhone style={{ color: '#2563eb' }} /> <span>{phone}</span></li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><FiMapPin style={{ color: '#2563eb' }} /> <span>{address}</span></li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '3rem auto 0', paddingTop: '2rem', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>&copy; {currentYear} Quyen. Tất cả quyền được bảo lưu. Thiết kế hệ thống bởi BA.</div>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          {social.github && <a href={social.github} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: '1.2rem' }}><FiGithub /></a>}
          {social.linkedin && <a href={social.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: '1.2rem' }}><FiLinkedin /></a>}
          {social.facebook && <a href={social.facebook} target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', fontSize: '1.2rem' }}><FiFacebook /></a>}
        </div>
      </div>
    </footer>
  );
}

export default Footer;