import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiStar, FiClock, FiSearch, FiFilter } from 'react-icons/fi';
import PageHero from '../components/PageHero';

function Projects() {
  const [content, setContent] = useState(null);
  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Trạng thái điều khiển việc Rút gọn/Xem thêm các Tag Phân loại
  const [showAllTags, setShowAllTags] = useState(false);
  const MAX_TAGS_VISIBLE = 8; // Số lượng Tag hiển thị mặc định

  useEffect(() => {
    (async () => {
      const c = await getPageContent('projects');
      if (c) setContent(c);
    })();
  }, []);

  // HOOK HIỆU ỨNG CUỘN
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
  }, [content, selectedTag, searchQuery, showAllTags]);

  const rawProjects = (content?.projects || []).filter(p => !p.isHidden);
  const sortedProjects = [...rawProjects].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  const allTags = ['All', ...new Set(rawProjects.flatMap(p => p.technologies || []))];

  // Logic hiển thị Tags (Rút gọn hoặc Mở rộng)
  const visibleTags = showAllTags ? allTags : allTags.slice(0, MAX_TAGS_VISIBLE);

  const filteredProjects = sortedProjects.filter(p => {
    const matchesTag = selectedTag === 'All' || p.technologies?.includes(selectedTag);
    const matchesSearch = p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  return (
    <section className="page projects-page">
      
      {/* KHỐI CSS TỐI ƯU HÓA KHÔNG GIAN CHO MOBILE */}
      <style>{`
        .projects-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem 4rem 1.5rem;
        }
        @media (max-width: 768px) {
          .projects-container {
            padding: 0 0.5rem 4rem 0.5rem; /* Giảm tối đa padding 2 bên trên Mobile */
          }
        }
      `}</style>

      <PageHero 
        title={content?.pageTitle || 'Kho Hồ Sơ Dự Án'} 
        subtitle={content?.subtitle || 'Tổng hợp mô hình hóa quy trình hệ thống kịch bản nghiệp vụ'} 
        bgImage={content?.coverUrl || ''} 
      />

      <div className="projects-container">
        
        {/* THANH TÌM KIẾM & PHÂN LOẠI CÓ HIỆU ỨNG */}
        <div className="reveal-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', backgroundColor: '#ffffff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              type="text" 
              placeholder="Tìm kiếm dự án, công nghệ đặc tả..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginRight: '0.5rem' }}>
              <FiFilter /> Phân loại:
            </span>
            
            {/* Vòng lặp hiển thị Tags (Đã thu nhỏ size và fix màu tương phản) */}
            {visibleTags.map(tag => (
              <button 
                key={tag} 
                onClick={() => setSelectedTag(tag)} 
                style={{ 
                  padding: '0.35rem 0.8rem', borderRadius: '20px', border: '1px solid #cbd5e1', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: selectedTag === tag ? '#2563eb' : '#f8fafc', 
                  color: selectedTag === tag ? '#ffffff' : '#475569',
                  fontWeight: selectedTag === tag ? 700 : 600
                }}
              >
                {tag}
              </button>
            ))}

            {/* Nút Xem thêm / Rút gọn */}
            {allTags.length > MAX_TAGS_VISIBLE && (
              <button 
                onClick={() => setShowAllTags(!showAllTags)} 
                style={{ 
                  padding: '0.35rem 0.8rem', borderRadius: '20px', border: '1px dashed #94a3b8', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: 'transparent', color: '#2563eb', fontWeight: 700
                }}
              >
                {showAllTags ? 'Rút gọn' : `Xem thêm +${allTags.length - MAX_TAGS_VISIBLE}`}
              </button>
            )}
          </div>
        </div>

        {/* LƯỚI CARD TỰ ĐỘNG RESPONSIVE */}
        <div className="projects-grid mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '2rem' }}>
          {filteredProjects.map((project) => (
            <div 
              key={project.id} 
              className="project-card reveal-section" 
              style={{ 
                backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative',
                border: project.isPinned ? '2px solid #2563eb' : '1px solid #cbd5e1',
                boxShadow: project.isPinned ? '0 4px 20px rgba(37, 99, 235, 0.15)' : '0 4px 10px rgba(0,0,0,0.02)'
              }}
            >
              {project.isPinned && (
                <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.75rem', fontWeight: 800, padding: '0.3rem 0.8rem', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FiStar fill="#d97706" /> Nổi bật
                </span>
              )}
              
              <div className="project-content" style={{ padding: '1.8rem', flex: 1, display: 'flex', flexDirection: 'column', marginTop: project.isPinned ? '1rem' : '0' }}>
                
                {/* Đã bọc Tiêu đề vào Link để click được */}
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.6rem', lineHeight: 1.4 }}>
                  <Link to={`/projects/${project.slug}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                    {project.title}
                  </Link>
                </h3>

                {project.duration && (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem', fontWeight: 600 }}>
                    <FiClock /> {project.duration}
                  </div>
                )}

                <div style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }} dangerouslySetInnerHTML={{ __html: project.description }} />
                
                <div className="project-tech" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem' }}>
                  {(project.technologies || []).map((tech, idx) => (
                    <span key={idx} style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Nút View Project đã được gán mã màu cứng tương phản cao */}
                <Link 
                  to={`/projects/${project.slug}`} 
                  style={{ 
                    backgroundColor: '#2563eb', color: '#ffffff', border: 'none', textAlign: 'center', borderRadius: '8px', 
                    padding: '0.8rem', fontSize: '0.95rem', fontWeight: 700, textDecoration: 'none', display: 'block', transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  Khám Phá Dự Án →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '3rem', fontSize: '1.1rem' }}>Không tìm thấy dự án phù hợp với từ khóa.</p>
        )}
      </div>
    </section>
  );
}

export default Projects;