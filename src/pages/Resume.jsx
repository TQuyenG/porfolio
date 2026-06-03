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
  
  const displayMode = content?.displayMode || 'both';

  return (
    <section className="page resume-page" style={{ padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'var(--bg-white)', padding: 'clamp(2rem, 5vw, 4rem)', borderRadius: '16px', boxShadow: '0 4px 30px rgba(0, 0, 0, 0.03)', border: '1px solid var(--border-color)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '2px dashed var(--border-color)' }}>
          <h2 style={{ fontSize: 'var(--font-h2)', color: 'var(--text-main)', fontWeight: 800, letterSpacing: '0.5px', margin: '0 0 0.5rem 0' }}>{header.name}</h2>
          <p style={{ color: 'var(--primary-color)', margin: '0.4rem 0', fontSize: 'var(--font-h4)', fontWeight: 600 }}>{header.contact}</p>
          <p style={{ color: 'var(--text-sub)', fontSize: 'var(--font-body)', margin: 0 }}>{header.location}</p>
        </div>

        {(displayMode === 'both' || displayMode === 'dynamic_only') && (
          <>
            <section style={{ marginBottom: '3rem' }}>
              <h3 style={{ fontSize: 'var(--font-h4)', color: 'var(--text-main)', fontWeight: 800, paddingBottom: '0.5rem', marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Tổng Quan Năng Lực</h3>
              <div style={{ color: 'var(--text-sub)', lineHeight: '1.8', fontSize: 'var(--font-body)' }} dangerouslySetInnerHTML={{ __html: overview }} />
            </section>

            {experiences.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: 'var(--font-h4)', color: 'var(--text-main)', fontWeight: 800, paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Kinh Nghiệm Thực Tế</h3>
                {experiences.map((exp, idx) => (
                  <div key={idx} style={{ marginBottom: '2rem', paddingLeft: '1.5rem', borderLeft: '2px solid var(--primary-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontWeight: 600, marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <h4 style={{ color: 'var(--text-main)', fontSize: 'var(--font-h4)', margin: 0, fontWeight: 700 }}>{exp.title}</h4>
                      <span style={{ color: 'var(--primary-color)', fontSize: 'var(--font-small)', fontWeight: 600, backgroundColor: 'var(--highlight-color)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{exp.date}</span>
                    </div>
                    <p style={{ color: 'var(--text-main)', margin: '0 0 1rem 0', fontWeight: 600 }}>{exp.company}</p>
                    <div style={{ color: 'var(--text-sub)', lineHeight: '1.7', fontSize: 'var(--font-body)' }} dangerouslySetInnerHTML={{ __html: exp.description || '' }} />
                  </div>
                ))}
              </section>
            )}

            {skills.length > 0 && (
              <section style={{ marginBottom: '3rem' }}>
                <h3 style={{ fontSize: 'var(--font-h4)', color: 'var(--text-main)', fontWeight: 800, paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Kỹ Năng Nền Tảng BA</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                  {skills.map((s, i) => (
                    <div key={i} style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                      <strong style={{ color: 'var(--primary-color)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>{s.title}</strong>
                      <span style={{ color: 'var(--text-sub)', fontSize: 'var(--font-small)' }}>{Array.isArray(s.items) ? s.items.join(', ') : s.items}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {(displayMode === 'both' || displayMode === 'pdf_only') && cvUrl !== '#' && cvUrl && (
          <section style={{ marginBottom: '3rem', marginTop: '2rem' }}>
            <h3 style={{ fontSize: 'var(--font-h4)', color: 'var(--text-main)', fontWeight: 800, paddingBottom: '0.5rem', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Bản Gốc Hồ Sơ CV (PDF)</h3>
            <div style={{ padding: '0.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface)' }}>
              <iframe src={`${cvUrl}#toolbar=0`} title="CV Viewer" style={{ width: '100%', height: '800px', border: 'none', backgroundColor: '#fff', borderRadius: '8px' }} />
            </div>
          </section>
        )}

        <div style={{ textAlign: 'center', paddingTop: '2.5rem', borderTop: '1px solid var(--border-color)' }}>
          <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ padding: '1rem 3rem' }}>Tải Về Máy (Download PDF)</a>
        </div>
      </div>
    </section>
  );
}

export default Resume;