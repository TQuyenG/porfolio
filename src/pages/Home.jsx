import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Home() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      const c = await getPageContent('home');
      if (c) setContent(c);
    })();
  }, []);

  const title = content?.title || 'Xin Chào! Tôi là Quyen';
  const tagline = content?.tagline || 'Business Analyst Intern | Web Developer';
  const intro = content?.intro || 'Tôi đam mê phân tích nghiệp vụ hệ thống và xây dựng các giải pháp tối ưu hóa quy trình dịch vụ ứng dụng công nghệ.';
  const ctas = content?.ctas || [
    { text: 'Xem Dự Án', href: '/projects', variant: 'primary' },
    { text: 'Liên Hệ', href: '/contact', variant: 'secondary' }
  ];
  const cards = content?.cards || [
    { title: 'Dự Án Nghiên Cứu', text: 'Xem các dự án thiết kế UI/UX và phân tích hệ thống quy trình của tôi', href: '/projects' },
    { title: 'Hồ Sơ Năng Lực', text: 'Tải xuống bản tóm tắt CV và kinh nghiệm chuyên môn', href: '/resume' }
  ];

  return (
    <section className="page home-page">
      <div className="hero" style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#111827', marginBottom: '1rem' }}>{title}</h1>
        <p className="tagline" style={{ fontSize: '1.4rem', color: '#2563eb', fontWeight: 600, marginBottom: '1.5rem' }}>{tagline}</p>
        <p className="intro" style={{ fontSize: '1.15rem', color: '#4b5563', maxWidth: '700px', margin: '0 auto 2.5rem', lineHeight: '1.8' }}>{intro}</p>
        
        <div className="cta-buttons" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {ctas.map((c, i) => (
            <a key={i} href={c.href} className={c.variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '0.8rem 2rem', borderRadius: '8px' }}>
              {c.text}
            </a>
          ))}
        </div>
      </div>

      <section className="home-section">
        <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.5rem' }}>Tiêu Điểm Cá Nhân</h2>
        <div className="recent-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {cards.map((card, idx) => (
            <div className="card" key={idx} style={{ backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', border: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.75rem', color: '#111827' }}>{card.title}</h3>
              <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>{card.text}</p>
              <a href={card.href} className="link" style={{ fontWeight: 600 }}>Khám phá ngay →</a>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Home;