import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Projects() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getPageContent('projects');
      if (mounted) setContent(c);
    })();
    return () => { mounted = false; };
  }, []);

  const projects = content?.projects || [
    { id:1, title: 'Project 1', description: 'Mô tả dự án 1', technologies: ['React'], link:'#', image: '/images/project1.png' }
  ];

  return (
    <section className="page projects-page">
      <div className="page-header">
        <h1>{content?.pageTitle || 'Các Dự Án Của Tôi'}</h1>
        <p className="subtitle">{content?.subtitle || 'Những dự án mà tôi đã xây dựng'}</p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            {project.image && (
              <div className="project-image">
                <img src={project.image} alt={project.title} />
              </div>
            )}
            <div className="project-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-tech">
                {(project.technologies||[]).map((tech, idx) => (
                  <span key={idx} className="tech-badge">{tech}</span>
                ))}
              </div>
              <a href={project.link || '#'} className="project-link">Xem chi tiết →</a>
            </div>
          </div>
        ))}
      </div>

      <section className="projects-section">
        <h2>Hướng Dẫn</h2>
        <p>Nếu bạn muốn trao đổi chi tiết về những dự án, vui lòng liên hệ qua mục Liên Lạc.</p>
      </section>
    </section>
  );
}

export default Projects;
