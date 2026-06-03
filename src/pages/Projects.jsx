import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiStar, FiClock, FiSearch, FiFilter } from 'react-icons/fi';

function Projects() {
  const [content, setContent] = useState(null);
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      const c = await getPageContent('projects');
      if (c) setContent(c);
    })();
  }, []);

  const rawProjects = (content?.projects || []).filter(p => !p.isHidden);
  // Ưu tiên đưa dự án ghim lên hàng đầu
  const sortedProjects = [...rawProjects].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  
  // Trích xuất tự động toàn bộ tags có trong DB
  const allTags = ['All', ...new Set(rawProjects.flatMap(p => p.technologies || []))];

  // Khối logic kết hợp tìm kiếm lẫn phân loại danh mục đồng thời
  const filteredProjects = sortedProjects.filter(p => {
    const matchesTag = selectedTag === 'All' || p.technologies?.includes(selectedTag);
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <section className="page projects-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      <div className="page-header" style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-h1)', fontWeight: 800, color: 'var(--text-main)' }}>{content?.pageTitle || 'Kho Hồ Sơ Dự Án'}</h1>
        <p className="subtitle" style={{ color: 'var(--text-sub)', fontSize: 'var(--font-body)' }}>{content?.subtitle || 'Tổng hợp mô hình hóa quy trình hệ thống kịch bản nghiệp vụ'}</p>
      </div>

      {/* SEARCH VÀ FILTER BAR CHUẨN UI/UX */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'var(--bg-white)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '3rem' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-sub)' }} />
          <input 
            type="text" 
            placeholder="Tìm kiếm dự án, công nghệ đặc tả..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', fontSize: 'var(--font-body)' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-small)', color: 'var(--text-sub)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginRight: '0.5rem' }}><FiFilter /> Phân loại:</span>
          {allTags.map(tag => (
            <button 
              key={tag} 
              onClick={() => setSelectedTag(tag)} 
              style={{ 
                padding: '0.4rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: 'var(--font-small)', cursor: 'pointer', transition: 'all 0.2s',
                backgroundColor: selectedTag === tag ? 'var(--primary-color)' : '#ffffff', 
                color: selectedTag === tag ? '#ffffff' : 'var(--text-sub)',
                fontWeight: selectedTag === tag ? 700 : 500
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* GRID CARDS TRÌNH DIỄN */}
      <div className="projects-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {filteredProjects.map((project) => (
          <div 
            key={project.id} 
            className="project-card" 
            style={{ 
              backgroundColor: 'var(--bg-white)', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
              border: project.isPinned ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
              boxShadow: project.isPinned ? '0 4px 20px var(--highlight-color)' : 'none'
            }}
          >
            {project.isPinned && (
              <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'var(--highlight-color)', color: 'var(--primary-color)', fontSize: '12px', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><FiStar fill="var(--primary-color)" /> Nổi bật</span>
            )}
            
            <div className="project-content" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', marginTop: project.isPinned ? '1rem' : '0' }}>
              <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{project.title}</h3>
              {project.duration && (
                <div style={{ color: 'var(--text-sub)', fontSize: 'var(--font-small)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem', fontWeight: 500 }}><FiClock /> {project.duration}</div>
              )}
              <div style={{ color: 'var(--text-sub)', fontSize: 'var(--font-body)', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }} dangerouslySetInnerHTML={{ __html: project.description }} />
              
              <div className="project-tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                {(project.technologies || []).map((tech, idx) => (
                  <span key={idx} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--primary-color)', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '12px', fontWeight: 700, border: '1px solid var(--border-color)' }}>{tech}</span>
                ))}
              </div>
              <Link to={`/projects/${project.slug}`} className="btn btn-primary" style={{ backgroundColor: 'var(--primary-color)', border: 'none', textAlign: 'center', borderRadius: '8px', padding: '0.75rem', fontSize: 'var(--font-body)' }}>Khám Phá Kịch Bản Nghiệp Vụ →</Link>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-sub)', padding: '3rem' }}>Không tìm thấy dự án phù hợp với từ khóa.</p>
      )}
    </section>
  );
}

export default Projects;