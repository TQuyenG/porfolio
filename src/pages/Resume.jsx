import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Resume() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getPageContent('resume');
      if (mounted) setContent(c);
    })();
    return () => { mounted = false; };
  }, []);

  const header = content?.header || { name: 'QUYEN - Web Developer', contact: 'Email: your.email@example.com | Phone: +84 xxx xxx xxx', location: 'Your City, Vietnam' };
  const overview = content?.overview || 'Web developer có kinh nghiệm trong phát triển ứng dụng web hiện đại với React, Node.js và các công nghệ backend khác.';
  const experiences = content?.experiences || [{ title: 'Web Developer', date: '2022 - Hiện tại', company: 'Công ty ABC', bullets: ['Phát triển và bảo trì các ứng dụng web với React', 'Tối ưu hóa performance và SEO', 'Làm việc với API RESTful'] }];
  const skills = content?.skills || [{ title: 'Frontend', items: ['React', 'JavaScript', 'HTML', 'CSS', 'Responsive Design'] }, { title: 'Backend', items: ['Node.js', 'Express', 'Python', 'SQL'] }];
  const education = content?.education || [{ title: 'Cử nhân Công nghệ Thông tin', date: '2018 - 2022', company: 'Đại học XYZ' }];
  const cvUrl = content?.cvUrl || '/documents/CV-Quyen.pdf';

  return (
    <section className="page resume-page">
      <div className="page-header">
        <h1>CV / Resume</h1>
        <p className="subtitle">Thông tin chuyên môn của tôi</p>
      </div>

      <div className="resume-container">
        <div className="resume-header">
          <h2>{header.name}</h2>
          <p>{header.contact}</p>
          <p>{header.location}</p>
        </div>

        <section className="resume-section">
          <h3>TỔNG QUAN</h3>
          <p>{overview}</p>
        </section>

        <section className="resume-section">
          <h3>KINH NGHIỆM</h3>
          {experiences.map((exp, idx) => (
            <div className="resume-item" key={idx}>
              <div className="resume-header-item">
                <h4>{exp.title}</h4>
                <span className="date">{exp.date}</span>
              </div>
              <p className="company">{exp.company}</p>
              <ul>
                {(exp.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>

        <section className="resume-section">
          <h3>KỸ NĂNG</h3>
          <div className="skills-list">
            {skills.map((s, i) => (
              <div key={i}><strong>{s.title}:</strong> {s.items.join(', ')}</div>
            ))}
          </div>
        </section>

        <section className="resume-section">
          <h3>HỌC VẤN</h3>
          {education.map((ed, i) => (
            <div className="resume-item" key={i}>
              <div className="resume-header-item">
                <h4>{ed.title}</h4>
                <span className="date">{ed.date}</span>
              </div>
              <p className="company">{ed.company}</p>
            </div>
          ))}
        </section>

        <section className="resume-section">
          <h3>CHỨNG CHỈ & GIẢI THƯỞNG</h3>
          <ul>
            {(content?.awards || ['React Advanced - Certificate (2023)', 'Full Stack Web Developer - Bootcamp (2022)']).map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </section>

        <div className="resume-actions">
          <a href={cvUrl} download className="btn btn-primary">Tải CV (PDF)</a>
          <p className="note">✔ CV có sẵn để tải về. Liên hệ nếu cần phiên bản chi tiết hơn.</p>
        </div>
      </div>
    </section>
  );
}

export default Resume;
