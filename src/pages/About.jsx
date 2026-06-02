import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getPageContent('about');
      if (mounted) setContent(c);
    })();
    return () => { mounted = false; };
  }, []);

  const intro = content?.intro || {
    title: 'Xin Chào! 👋',
    body: 'Tôi là Quyen, một web developer passionate với X năm kinh nghiệm. Tôi yêu thích việc giải quyết vấn đề thông qua code.'
  };

  const skills = content?.skills || [
    { title: 'Frontend', items: ['React.js','JavaScript','HTML/CSS','Responsive Design'] },
    { title: 'Backend', items: ['Node.js','Python','SQL'] }
  ];

  const experiences = content?.experiences || [
    { title: 'Web Developer tại [Công ty]', date: '2022 - Hiện tại', text: 'Phát triển ứng dụng web responsive với React' }
  ];

  return (
    <section className="page about-page">
      <div className="page-header">
        <h1>{content?.pageTitle || 'Về Tôi'}</h1>
        <p className="subtitle">{content?.subtitle || 'Tìm hiểu thêm về hành trình của tôi'}</p>
      </div>

      <div className="about-content">
        <div className="about-intro">
          <h2>{intro.title}</h2>
          <p>{intro.body}</p>
        </div>

        <section className="about-section">
          <h3>Kỹ Năng Chính</h3>
          <div className="skills-grid">
            {skills.map((s, i) => (
              <div key={i} className="skill-card">
                <h4>{s.title}</h4>
                <ul>{(s.items||[]).map((it, idx) => <li key={idx}>{it}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h3>Kinh Nghiệm</h3>
          <div className="experience-list">
            {experiences.map((exp, idx) => (
              <div className="experience-item" key={idx}>
                <h4>{exp.title}</h4>
                <p className="date">{exp.date}</p>
                <p>{exp.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="about-section">
          <h3>Sở Thích & Đam Mê</h3>
          <p>{content?.interests || 'Khi không code, tôi thích đọc sách và khám phá công nghệ mới.'}</p>
        </section>
      </div>
    </section>
  );
}

export default About;
