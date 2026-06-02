import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      const c = await getPageContent('about');
      if (c) setContent(c);
    })();
  }, []);

  const pageTitle = content?.pageTitle || 'Câu Chuyện Hành Trình';
  const subtitle = content?.subtitle || 'Thông tin chi tiết về định hướng và nền tảng chuyên môn';
  
  const intro = content?.intro || {
    title: 'Xin chào, tôi là một Chuyên viên Phân tích Nghiệp vụ tương lai',
    body: 'Tôi tập trung chuyên sâu vào quy trình mô hình hóa hệ thống doanh nghiệp (BPMN 2.0), thiết kế giải pháp trải nghiệm người dùng wireframe chuyên nghiệp và vận dụng linh hoạt cấu trúc dữ liệu để tối ưu hóa hiệu suất vận hành hệ thống.'
  };

  const skills = content?.skills || [
    { title: 'Nghiệp Vụ Hệ Thống', items: ['Phân tích yêu cầu (Requirement Analysis)', 'Mô hình hóa quy trình (BPMN 2.0)', 'Thiết kế Wireframe / Mockup (Figma)'] },
    { title: 'Công Nghệ Phát Triển', items: ['React / React Native', 'Node.js / Express', 'Cơ sở dữ liệu MySQL / PostgreSQL'] }
  ];

  return (
    <section className="page about-page">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>

      <div className="about-content" style={{ display: 'grid', gap: '2.5rem' }}>
        <div className="about-intro" style={{ backgroundColor: '#fff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#111827', marginBottom: '1rem' }}>{intro.title}</h2>
          <p style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: '1.8' }}>{intro.body}</p>
        </div>

        <section className="about-section">
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#1f2937', fontWeight: 700 }}>Năng Lực Chuyên Môn</h3>
          <div className="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {skills.map((s, i) => (
              <div key={i} className="skill-card" style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ fontSize: '1.2rem', color: '#2563eb', marginBottom: '1rem', fontWeight: 600 }}>{s.title}</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {(s.items || []).map((it, idx) => (
                    <li key={idx} style={{ padding: '0.4rem 0', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span> {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

export default About;