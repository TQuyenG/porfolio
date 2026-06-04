import React, { useEffect, useState } from 'react';
import { getPageContent } from '../utils/supabaseClient';
import { FiAward, FiBriefcase, FiBookOpen, FiExternalLink } from 'react-icons/fi';
import PageHero from '../components/PageHero';

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

  // HỆ THỐNG LẮNG NGHE HIỆU ỨNG CUỘN TRANG (SCROLL REVEAL)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
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
    <div className="page about-page" style={{ paddingBottom: 'clamp(3rem, 6vw, 6rem)' }}>
      
      <PageHero title={pageTitle} subtitle={subtitle} bgImage={coverUrl} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: 'clamp(3rem, 6vw, 6rem)' }}>
        
        {/* KHỐI 1: VỀ TÔI */}
        <section className="reveal-section mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '3rem', alignItems: 'start' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-h2, 36px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '1.5rem', letterSpacing: '-0.5px' }}>{intro.title}</h2>
            <div style={{ fontSize: 'var(--font-body, 16px)', color: 'var(--text-sub, #6B7280)', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: intro.body }} />
          </div>
          {portraitUrl && (
            <div style={{ textAlign: 'center' }}>
              <img src={portraitUrl} alt="Portrait" style={{ width: '100%', maxWidth: '400px', borderRadius: '16px', border: '1px solid var(--border, #E5E7EB)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }} />
            </div>
          )}
        </section>

        {/* KHỐI 2: NĂNG LỰC */}
        {skills.length > 0 && (
          <section className="reveal-section">
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '1.5rem' }}>Năng Lực Phân Tích & Kỹ Thuật</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {skills.map((skill, index) => (
                <div key={index} className="resume-box" style={{ background: 'var(--bg-white, #FFFFFF)', border: '1px solid var(--border, #E5E7EB)', borderRadius: '12px', padding: '1.5rem', flex: '1 1 250px', transition: 'box-shadow 0.3s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.03)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                  <strong style={{ display: 'block', fontSize: 'var(--font-body, 16px)', color: 'var(--primary, #6366F1)', marginBottom: '0.5rem' }}>{skill.title}</strong>
                  <span style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--text-sub, #6B7280)', lineHeight: '1.6', display: 'block' }}>{Array.isArray(skill.items) ? skill.items.join(', ') : skill.items}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KHỐI 3: KINH NGHIỆM */}
        {timeline.length > 0 && (
          <section className="reveal-section">
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><FiBriefcase color="var(--primary, #6366F1)"/> Kinh Nghiệm Thực Tế</h3>
            <div className="resume-box" style={{ backgroundColor: 'var(--bg-white, #FFFFFF)', padding: '2.5rem', borderRadius: '24px', border: '1px solid var(--border, #E5E7EB)' }}>
              {timeline.map((item, i) => (
                <div key={i} style={{ position: 'relative', paddingLeft: '2rem', marginBottom: '2rem' }}>
                  <div style={{ content: '""', position: 'absolute', left: 0, top: '8px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary, #6366F1)', border: '3px solid var(--highlight, #EDE9FE)' }} />
                  {i !== timeline.length - 1 && <div style={{ content: '""', position: 'absolute', left: '5px', top: '24px', bottom: '-32px', width: '2px', backgroundColor: 'var(--border, #E5E7EB)' }} />}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '0.5rem', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: 'var(--font-h4, 18px)', fontWeight: 700, color: 'var(--text-main, #1E1B4B)', margin: 0 }}>{item.title}</h4>
                    <span style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--primary, #6366F1)', fontWeight: 700, backgroundColor: 'var(--highlight, #EDE9FE)', padding: '0.2rem 0.8rem', borderRadius: '20px' }}>{item.year}</span>
                  </div>
                  <p style={{ color: 'var(--text-sub, #6B7280)', fontWeight: 600, fontSize: 'var(--font-body, 16px)', marginBottom: '0.8rem', fontStyle: 'italic' }}>{item.company}</p>
                  <div style={{ color: 'var(--text-sub, #6B7280)', fontSize: 'var(--font-body, 16px)', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KHỐI 4: CHỨNG CHỈ */}
        {achievements.length > 0 && (
          <section id="achievements" className="reveal-section" style={{ scrollMarginTop: '100px' }}>
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><FiAward color="var(--primary, #6366F1)"/> Thành Tựu & Chứng Chỉ</h3>
            <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
              {achievements.map((ach, idx) => (
                <div key={idx} className="resume-box" style={{ background: 'var(--bg-white, #FFFFFF)', border: '1px solid var(--border, #E5E7EB)', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.05)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
                    <a href={ach.url} target="_blank" rel="noreferrer" style={{ fontSize: 'var(--font-small, 14px)', color: 'var(--primary, #6366F1)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: 'auto', padding: '0.5rem 0.8rem', backgroundColor: 'var(--surface, #FAFAFA)', borderRadius: '8px', width: 'fit-content' }}>Kiểm tra chứng chỉ <FiExternalLink/></a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KHỐI 5: HỌC VẤN */}
        {education.length > 0 && (
          <section className="reveal-section">
            <h3 style={{ fontSize: 'var(--font-h3, 24px)', fontWeight: 800, color: 'var(--text-main, #1E1B4B)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}><FiBookOpen color="var(--primary, #6366F1)"/> Nền Tảng Học Vấn</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {education.map((edu, idx) => (
                <div key={idx} className="resume-box" style={{ padding: '1.5rem', backgroundColor: 'var(--bg-white, #FFFFFF)', border: '1px solid var(--border, #E5E7EB)', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: 'var(--font-h4, 18px)', fontWeight: 700, color: 'var(--text-main, #1E1B4B)', marginBottom: '0.4rem', margin: 0 }}>{edu.title}</h4>
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