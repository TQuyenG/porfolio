import React, { useEffect, useState } from 'react';
import { getPageContent } from '../utils/supabaseClient';
import { FiAward, FiBriefcase, FiBookOpen, FiExternalLink } from 'react-icons/fi';

export default function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getPageContent('about');
      if (data) {
        if (data.achievements) {
          data.achievements.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        }
        setContent(data);
      }
    })();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('is-visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-section').forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, [content]);

  const pageTitle = content?.pageTitle || 'Hành Trình Chuyên Môn';
  const subtitle = content?.subtitle || 'Nền tảng, định hướng và triết lý làm việc';
  const intro = content?.intro || { title: 'Về Tôi', body: 'Đang cập nhật...' };
  const coverUrl = content?.coverUrl || '';
  const portraitUrl = content?.portraitUrl || '';
  const timeline = content?.timeline || [];
  const skills = content?.skills || [];
  const achievements = content?.achievements || [];
  const education = content?.education || [];

  return (
    <div className="page about-page" style={{ paddingBottom: 'var(--gap, 96px)' }}>
      <style>{`
        /* Kỹ thuật phá lồng để banner bung tràn 100% chiều ngang và cao 80vh */
        .ds-about-hero {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          min-height: 80vh; 
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 1.5rem;
          background-size: cover;
          background-position: center;
          margin-top: -80px; /* Chui xuống dưới Navbar */
          padding-top: 80px;
        }
        .ds-about-overlay {
          position: absolute; inset: 0; 
          background-color: rgba(15, 23, 42, 0.85); /* Tone màu Slate 900 sang trọng */
          z-index: 1;
        }
        .ds-timeline-item {
          position: relative; padding-left: 32px; margin-bottom: 32px;
        }
        .ds-timeline-item::before {
          content: ''; position: absolute; left: 0; top: 8px; width: 12px; height: 12px;
          border-radius: 50%; background-color: var(--primary, #6366F1); border: 3px solid var(--highlight, #EDE9FE);
        }
        .ds-timeline-item::after {
          content: ''; position: absolute; left: 5px; top: 24px; bottom: -32px;
          width: 2px; background-color: var(--border, #E5E7EB);
        }
        .ds-timeline-item:last-child::after { display: none; }
      `}</style>

      {/* HERO BANNER FULL */}
      <div className="ds-about-hero" style={{ backgroundImage: coverUrl ? `url(${coverUrl})` : 'none', backgroundColor: '#0f172a' }}>
        <div className="ds-about-overlay" />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '1200px', width: '100%', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ color: '#ffffff', fontSize: 'var(--font-h1, 48px)', fontWeight: 800, marginBottom: '16px', letterSpacing: '-1px' }}>{pageTitle}</h1>
          <p style={{ color: 'var(--accent, #A78BFA)', fontSize: 'var(--font-h3, 24px)', fontWeight: 500 }}>{subtitle}</p>
        </div>
      </div>

      {/* MAIN CONTENT VỚI KHOẢNG CÁCH CHUẨN DESIGN SYSTEM */}
      <div style={{ maxWidth: '1200px', margin: 'var(--gap, 96px) auto 0', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: 'var(--gap, 96px)' }}>
        
        {/* BIO & ẢNH CHÂN DUNG */}
        <section className="reveal-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-h2, 36px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '24px', letterSpacing: '-0.5px' }}>{intro.title}</h2>
            <div style={{ fontSize: 'var(--font-body, 16px)', color: 'var(--text-sub, #6B7280)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: intro.body }} />
          </div>
          {portraitUrl && (
            <div style={{ textAlign: 'center' }}>
              <img src={portraitUrl} alt="Portrait" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border, #E5E7EB)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} />
            </div>
          )}
        </section>

        {/* SKILLS TAG CLOUD */}
        {skills.length > 0 && (
          <section className="reveal-section">
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '24px' }}>Năng Lực Phân Tích & Kỹ Thuật</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {skills.map((skill, index) => (
                <div key={index} style={{ background: 'var(--bg-white, #FFFFFF)', border: '1px solid var(--border, #E5E7EB)', borderRadius: '12px', padding: '20px 24px', flex: '1 1 250px', transition: 'box-shadow 0.3s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.03)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                  <strong style={{ display: 'block', fontSize: 'var(--font-body, 16px)', color: 'var(--primary, #6366F1)', marginBottom: '8px' }}>{skill.title}</strong>
                  <span style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--text-sub, #6B7280)', lineHeight: '1.6', display: 'block' }}>{Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TIMELINE KINH NGHIỆM */}
        {timeline.length > 0 && (
          <section className="reveal-section">
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}><FiBriefcase color="var(--primary, #6366F1)"/> Kinh Nghiệm Thực Tế</h3>
            <div style={{ backgroundColor: 'var(--bg-white, #FFFFFF)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border, #E5E7EB)' }}>
              {timeline.map((item, i) => (
                <div key={i} className="ds-timeline-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: 'var(--font-h4, 18px)', fontWeight: 700, color: 'var(--text-main, #1E1B4B)', margin: 0 }}>{item.title}</h4>
                    <span style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--primary, #6366F1)', fontWeight: 700, backgroundColor: 'var(--highlight, #EDE9FE)', padding: '4px 12px', borderRadius: '20px' }}>{item.year}</span>
                  </div>
                  <p style={{ color: 'var(--text-sub, #6B7280)', fontWeight: 600, fontSize: 'var(--font-body, 16px)', marginBottom: '12px', fontStyle: 'italic' }}>{item.company}</p>
                  <div style={{ color: 'var(--text-sub, #6B7280)', fontSize: 'var(--font-body, 16px)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CHỨNG CHỈ THÀNH TỰU */}
        {achievements.length > 0 && (
          <section id="achievements" className="reveal-section" style={{ scrollMarginTop: '100px' }}>
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}><FiAward color="var(--primary, #6366F1)"/> Thành Tựu & Chứng Chỉ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {achievements.map((ach, idx) => (
                <div key={idx} style={{ background: 'var(--bg-white, #FFFFFF)', border: '1px solid var(--border, #E5E7EB)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.05)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {ach.logo ? (
                      <img src={ach.logo} alt="Org" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
                    ) : (
                      <div style={{ width: '56px', height: '56px', background: 'var(--highlight, #EDE9FE)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiAward color="var(--primary, #6366F1)" size={24}/></div>
                    )}
                    <div>
                      <h4 style={{ fontSize: 'var(--font-body, 16px)', fontWeight: 700, color: 'var(--text-main, #1E1B4B)', margin: '0 0 4px 0' }}>{ach.name}</h4>
                      <p style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--text-sub, #6B7280)', margin: 0 }}>{ach.date}</p>
                    </div>
                  </div>
                  {ach.url && (
                    <a href={ach.url} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--primary, #6366F1)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', padding: '8px 12px', backgroundColor: 'var(--surface, #FAFAFA)', borderRadius: '8px', width: 'fit-content' }}>Kiểm tra chứng chỉ <FiExternalLink/></a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <section className="reveal-section">
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}><FiBookOpen color="var(--primary, #6366F1)"/> Nền Tảng Học Vấn</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {education.map((edu, idx) => (
                <div key={idx} style={{ padding: '24px', backgroundColor: 'var(--bg-white, #FFFFFF)', border: '1px solid var(--border, #E5E7EB)', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: 'var(--font-h4, 18px)', fontWeight: 700, color: 'var(--text-main, #1E1B4B)', marginBottom: '6px', margin: 0 }}>{edu.title}</h4>
                  <p style={{ fontSize: 'var(--font-body, 16px)', color: 'var(--text-sub, #6B7280)', margin: 0 }}>
                    <strong style={{ color: 'var(--primary, #6366F1)' }}>{edu.company}</strong> <span style={{ margin: '0 8px', color: 'var(--border, #E5E7EB)' }}>|</span> {edu.date}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}