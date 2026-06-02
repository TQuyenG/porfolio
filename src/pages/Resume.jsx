import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Resume() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      const c = await getPageContent('resume');
      if (c) setContent(c);
    })();
  }, []);

  const header = content?.header || { name: 'NGUYỄN TÚ QUYÊN', contact: 'quyen.ba@email.com | +84 901 234 567', location: 'TP. Hồ Chí Minh, Việt Nam' };
  const overview = content?.overview || 'Kỹ sư Phân tích Nghiệp vụ (BA) hệ thống công nghệ thông tin với tư duy tối ưu hóa logic quy trình nghiệp vụ dịch vụ.';
  const experiences = content?.experiences || [
    { title: 'Business Analyst Intern', date: '6 Tháng', company: 'Giải pháp Công nghệ Hệ thống Doanh nghiệp', bullets: ['Thu thập yêu cầu nghiệp vụ hệ thống thực tế và quản lý tài liệu đặc tả phần mềm.', 'Vẽ mô hình hóa quy trình hệ thống hiện tại và tương lai bằng chuẩn hóa đồ họa BPMN 2.0.'] }
  ];
  const skills = content?.skills || [
    { title: 'Nghiệp Vụ Công Việc', items: ['Requirement Analysis', 'BPMN 2.0 Workflow Modelling', 'Figma Wireframing'] }
  ];
  const cvUrl = content?.cvUrl || '#';

  return (
    <section className="page resume-page">
      <div className="page-header">
        <h1>Hồ Sơ Năng Lực</h1>
        <p className="subtitle">Bản tóm tắt quá trình học tập và làm việc thực tế</p>
      </div>

      <div className="resume-container" style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.01)', maxWidth: '800px', margin: '0 auto' }}>
        <div className="resume-header" style={{ textAlign: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '2px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '2rem', color: '#111827', fontWeight: 800, letterSpacing: '0.5px' }}>{header.name}</h2>
          <p style={{ color: '#4b5563', margin: '0.5rem 0' }}>{header.contact}</p>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>{header.location}</p>
        </div>

        <section className="resume-section" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.4rem', marginBottom: '1rem' }}>TỔNG QUAN</h3>
          <p style={{ color: '#374151', lineHeight: '1.7' }}>{overview}</p>
        </section>

        <section className="resume-section" style={{ marginBottom: '2rem' }}>
          <h3>KINH NGHIỆM THỰC TẾ</h3>
          {experiences.map((exp, idx) => (
            <div className="resume-item" key={idx} style={{ marginBottom: '1.5rem' }}>
              <div className="resume-header-item" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                <h4 style={{ color: '#111827' }}>{exp.title}</h4>
                <span style={{ color: '#6b7280' }}>{exp.date}</span>
              </div>
              <p className="company" style={{ color: '#2563eb', fontStyle: 'italic', marginBottom: '0.5rem' }}>{exp.company}</p>
              <ul style={{ paddingLeft: '1.2rem', color: '#4b5563', lineHeight: '1.6' }}>
                {(exp.bullets || []).map((b, i) => <li key={i} style={{ marginBottom: '0.25rem' }}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>

        <section className="resume-section" style={{ marginBottom: '2.5rem' }}>
          <h3>KỸ NĂNG NỀN TẢNG</h3>
          <div className="skills-list" style={{ display: 'grid', gap: '0.75rem' }}>
            {skills.map((s, i) => (
              <div key={i} style={{ color: '#374151' }}>
                <strong style={{ color: '#111827' }}>{s.title}:</strong> {s.items.join(', ')}
              </div>
            ))}
          </div>
        </section>

        <div className="resume-actions" style={{ textAlign: 'center', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <a href={cvUrl} download className="btn btn-primary" style={{ padding: '0.8rem 2.5rem', borderRadius: '6px' }}>
            Tải Bản CV Đầy Đủ (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}

export default Resume;