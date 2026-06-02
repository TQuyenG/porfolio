import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Resume() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchResumeData = async () => {
      const c = await getPageContent('resume');
      if (c) setContent(c);
    };
    fetchResumeData();
  }, []);

  const header = content?.header || { name: 'NGUYỄN TÚ QUYÊN', contact: 'quyen.ba@email.com', location: 'HCM, Vietnam' };
  const overview = content?.overview || 'Đang cập nhật hồ sơ...';
  const cvUrl = content?.cvUrl || '#';
  const experiences = content?.experiences || [];
  const skills = content?.skills || [];
  
  // Trích xuất chế độ hiển thị do Admin cài đặt (mặc định là hiển thị cả hai)
  const displayMode = content?.displayMode || 'both';

  return (
    <section className="page resume-page" style={{ padding: '2rem 0' }}>
      <div className="resume-container" style={{ backgroundColor: '#ffffff', padding: '3.5rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', maxWidth: '840px', margin: '0 auto', border: '1px solid #f3f4f6' }}>
        
        <div className="resume-header" style={{ textAlign: 'center', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '2px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '2.2rem', color: '#111827', fontWeight: 800, letterSpacing: '0.5px', margin: '0 0 0.75rem 0' }}>{header.name}</h2>
          <p style={{ color: '#4b5563', margin: '0.4rem 0', fontSize: '1.05rem', fontWeight: 500 }}>{header.contact}</p>
          <p style={{ color: '#9ca3af', fontSize: '0.95rem', margin: 0 }}>{header.location}</p>
        </div>

        {/* 1. KHỐI HỒ SƠ ĐỘNG (WEB FORMAT) - CHỈ HIỂN THỊ NẾU CHẾ ĐỘ LÀ 'both' HOẶC 'dynamic_only' */}
        {(displayMode === 'both' || displayMode === 'dynamic_only') && (
          <>
            <section className="resume-section" style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.2rem', letterSpacing: '0.5px' }}>TỔNG QUAN NĂNG LỰC</h3>
              <div style={{ color: '#374151', lineHeight: '1.8', fontSize: '1.05rem', margin: 0 }} dangerouslySetInnerHTML={{ __html: overview }} />
            </section>

            {experiences.length > 0 && (
              <section className="resume-section" style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.2rem', letterSpacing: '0.5px' }}>QUÁ TRÌNH LÀM VIỆC THỰC TẾ</h3>
                {experiences.map((exp, idx) => (
                  <div className="resume-item" key={idx} style={{ marginBottom: '2rem' }}>
                    <div className="resume-header-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 600, marginBottom: '0.4rem' }}>
                      <h4 style={{ color: '#111827', fontSize: '1.15rem', margin: 0 }}>{exp.title}</h4>
                      <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>{exp.date}</span>
                    </div>
                    <p className="company" style={{ color: '#2563eb', fontStyle: 'italic', margin: '0 0 0.75rem 0', fontWeight: 500 }}>{exp.company}</p>
                    <div style={{ color: '#4b5563', lineHeight: '1.7', margin: 0 }} dangerouslySetInnerHTML={{ __html: exp.description || '' }} />
                  </div>
                ))}
              </section>
            )}

            {skills.length > 0 && (
              <section className="resume-section" style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.2rem', letterSpacing: '0.5px' }}>KỸ NĂNG NỀN TẢNG BA</h3>
                <div className="skills-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {skills.map((s, i) => (
                    <div key={i} style={{ color: '#374151', fontSize: '1.05rem' }}>
                      <strong style={{ color: '#111827', fontWeight: 600 }}>{s.title}:</strong> {Array.isArray(s.items) ? s.items.join(', ') : s.items}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {/* 2. KHỐI TRÌNH ĐỌC PDF TRỰC TIẾP - CHỈ HIỂN THỊ NẾU CHẾ ĐỘ LÀ 'both' HOẶC 'pdf_only' */}
        {(displayMode === 'both' || displayMode === 'pdf_only') && cvUrl !== '#' && cvUrl && (
          <section className="resume-section" style={{ marginBottom: '3rem', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#2563eb', fontWeight: 700, borderBottom: '1px solid #e5e7eb', paddingBottom: '0.5rem', marginBottom: '1.5rem', letterSpacing: '0.5px' }}>BẢN GỐC HỒ SƠ CV (PDF)</h3>
            <div style={{ backgroundColor: '#94a3b8', padding: '0.8rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              <iframe src={`${cvUrl}#toolbar=0`} title="CV Viewer" style={{ width: '100%', height: '900px', border: 'none', backgroundColor: '#fff', borderRadius: '8px' }} />
            </div>
          </section>
        )}

        <div className="resume-actions" style={{ textAlign: 'center', paddingTop: '2.5rem', borderTop: '1px solid #e5e7eb' }}>
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '0.9rem 3rem', borderRadius: '8px', fontSize: '1rem', fontWeight: 600 }}>Tải Về Máy (Download PDF)</a>
        </div>
      </div>
    </section>
  );
}

export default Resume;