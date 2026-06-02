import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiStar, FiClock } from 'react-icons/fi';

function Projects() {
  const [content, setContent] = useState(null);
  const [selectedTag, setSelectedTag] = useState('All');

  useEffect(() => {
    (async () => {
      const c = await getPageContent('projects');
      if (c) setContent(c);
    })();
  }, []);

  const rawProjects = (content?.projects || []).filter(p => !p.isHidden);
  const sortedProjects = [...rawProjects].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  const allTags = ['All', ...new Set(rawProjects.flatMap(p => p.technologies || []))];
  const displayProjects = selectedTag === 'All' ? sortedProjects : sortedProjects.filter(p => p.technologies?.includes(selectedTag));

  return (
    <section className="page projects-page">
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>{content?.pageTitle || 'Danh mục Hồ sơ Dự án'}</h1>
        <p className="subtitle">{content?.subtitle || 'Trải nghiệm phân tích nghiệp vụ và phát triển hệ thống'}</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginBottom: '3rem' }}>
        {allTags.map(tag => (
          <button key={tag} onClick={() => setSelectedTag(tag)} style={{ padding: '0.5rem 1.2rem', borderRadius: '20px', border: '1px solid #d1d5db', backgroundColor: selectedTag === tag ? '#2563eb' : '#ffffff', color: selectedTag === tag ? '#ffffff' : '#4b5563', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{tag}</button>
        ))}
      </div>

      <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
        {displayProjects.map((project) => (
          <div key={project.id} className="project-card" style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: project.isPinned ? '2px solid #f59e0b' : '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            {project.isPinned && <div style={{ position: 'absolute', top: '15px', right: '15px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#fef3c7', padding: '0.3rem 0.8rem', borderRadius: '20px' }}><FiStar fill="#f59e0b" /> Nổi bật</div>}
            <div className="project-content" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', marginTop: project.isPinned ? '1rem' : '0' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '0.5rem' }}>{project.title}</h3>
              {project.duration && <div style={{ color: '#6b7280', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}><FiClock /> {project.duration}</div>}
              
              {/* RICH TEXT CHO MÔ TẢ DỰ ÁN (THẺ LƯỚI) */}
              <div style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1rem', marginBottom: '1.5rem', flex: 1 }} dangerouslySetInnerHTML={{ __html: project.description }} />
              
              <div className="project-tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(project.technologies || []).map((tech, idx) => <span key={idx} style={{ backgroundColor: '#f3f4f6', color: '#2563eb', padding: '0.3rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>{tech}</span>)}
              </div>
              <Link to={`/projects/${project.slug}`} className="btn btn-primary" style={{ textAlign: 'center', padding: '0.8rem', borderRadius: '8px', display: 'block' }}>Xem Hồ Sơ Chi Tiết</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Projects;