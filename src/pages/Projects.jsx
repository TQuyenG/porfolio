import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Projects() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      const c = await getPageContent('projects');
      if (c) setContent(c);
    })();
  }, []);

  const pageTitle = content?.pageTitle || 'Sản Phẩm Nghiên Cứu & Phát Triển';
  const subtitle = content?.subtitle || 'Danh sách các dự án ứng dụng thực tế nghiệp vụ hệ thống và lập trình';
  
  const projects = content?.projects || [
    { id: 1, title: 'Hệ thống Quản lý Quy trình KFC', description: 'Phân tích hệ thống nghiệp vụ, chuẩn hóa quy trình chuỗi cung ứng dựa trên nền tảng module hóa ERP.', technologies: ['BPMN 2.0', 'Odoo ERP', 'Requirement Analysis'], link: '#' },
    { id: 2, title: 'Ứng dụng Tour Du Lịch LocalMate', description: 'Ứng dụng kết nối du khách và hướng dẫn viên địa phương, tối ưu hóa thuật toán đề xuất thông minh.', technologies: ['React Native', 'Node.js', 'MySQL'], link: '#' }
  ];

  return (
    <section className="page projects-page">
      <div className="page-header">
        <h1>{pageTitle}</h1>
        <p className="subtitle">{subtitle}</p>
      </div>

      <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        {projects.map((project) => (
          <div key={project.id} className="project-card" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease' }}>
            <div className="project-content" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.3rem', color: '#111827', marginBottom: '0.75rem' }}>{project.title}</h3>
              <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1 }}>{project.description}</p>
              
              <div className="project-tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(project.technologies || []).map((tech, idx) => (
                  <span key={idx} className="tech-badge" style={{ backgroundColor: '#f3f4f6', color: '#2563eb', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                    {tech}
                  </span>
                ))}
              </div>
              <a href={project.link || '#'} className="project-link" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                Chi tiết dự án →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;