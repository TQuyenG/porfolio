import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiStar, FiClock, FiSearch, FiFilter, FiX, FiArrowRight, FiUsers, FiTrendingUp, FiTag } from 'react-icons/fi';
import PageHero from '../components/PageHero';

/* ─── Helper: strip HTML tags để search trong description ─── */
const stripHtml = (html = '') => html.replace(/<[^>]*>/g, '');

/* ─── Màu sắc cho từng category ngành nghề ─── */
const CATEGORY_COLORS = {
  FINTECH:      { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  HEALTHCARE:   { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  ECOMMERCE:    { bg: '#fdf4ff', text: '#9333ea', border: '#e9d5ff' },
  EDUCATION:    { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
  LOGISTICS:    { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' },
  GOVERNMENT:   { bg: '#fef3c7', text: '#92400e', border: '#fde68a' },
  RETAIL:       { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
  DEFAULT:      { bg: '#f8fafc', text: '#475569', border: '#cbd5e1' },
};

function getCategoryStyle(cat) {
  const key = (cat || '').toUpperCase();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.DEFAULT;
}

/* ─── Component: Project Card ─── */
function ProjectCard({ project }) {
  const catStyle = getCategoryStyle(project.category);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="project-card reveal-section"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: project.isPinned ? '2px solid #2563eb' : '1px solid #e2e8f0',
        boxShadow: hovered
          ? '0 20px 40px rgba(0,0,0,0.12)'
          : project.isPinned
          ? '0 4px 20px rgba(37,99,235,0.12)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Ảnh bìa dự án */}
      {project.coverImage && (
        <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
          <img
            src={project.coverImage}
            alt={project.title}
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
          />
          {/* Overlay gradient nhẹ */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.3) 0%, transparent 60%)' }} />
        </div>
      )}

      {/* Badge Nổi bật */}
      {project.isPinned && (
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          backgroundColor: '#fef3c7', color: '#b45309',
          fontSize: '0.7rem', fontWeight: 800, padding: '0.25rem 0.65rem',
          borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px',
          border: '1px solid #fde68a', backdropFilter: 'blur(4px)',
        }}>
          <FiStar size={11} fill="#b45309" /> NỔI BẬT
        </div>
      )}

      {/* Nội dung card */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

        {/* Hàng tags: category + duration */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {project.category && (
            <span style={{
              backgroundColor: catStyle.bg, color: catStyle.text,
              border: `1px solid ${catStyle.border}`,
              padding: '0.2rem 0.6rem', borderRadius: '6px',
              fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              {project.category}
            </span>
          )}
          {project.duration && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
              <FiClock size={11} /> {project.duration}
            </span>
          )}
        </div>

        {/* Tiêu đề */}
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, margin: 0 }}>
          <Link to={`/projects/${project.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>
            {project.title}
          </Link>
        </h3>

        {/* Client */}
        {project.client && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
            <FiUsers size={12} />
            <span>{project.client}</span>
          </div>
        )}

        {/* Mô tả */}
        <div
          style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: '1.6', flex: 1,
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
          dangerouslySetInnerHTML={{ __html: project.description }}
        />

        {/* Metric highlight */}
        {project.metric && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            backgroundColor: '#f0fdf4', color: '#16a34a',
            padding: '0.4rem 0.75rem', borderRadius: '8px',
            fontSize: '0.78rem', fontWeight: 700, border: '1px solid #bbf7d0',
          }}>
            <FiTrendingUp size={13} /> {project.metric}
          </div>
        )}

        {/* Tech badges */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {(project.technologies || []).slice(0, 5).map((tech, idx) => (
            <span key={idx} style={{
              backgroundColor: '#eff6ff', color: '#3b82f6',
              padding: '0.2rem 0.55rem', borderRadius: '5px',
              fontSize: '0.7rem', fontWeight: 700, border: '1px solid #dbeafe',
            }}>
              {tech}
            </span>
          ))}
          {(project.technologies || []).length > 5 && (
            <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontWeight: 600, alignSelf: 'center' }}>
              +{project.technologies.length - 5}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          to={`/projects/${project.slug}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            backgroundColor: hovered ? '#1d4ed8' : '#2563eb',
            color: '#ffffff', textDecoration: 'none',
            padding: '0.65rem 1rem', borderRadius: '8px',
            fontSize: '0.85rem', fontWeight: 700,
            transition: 'background-color 0.2s',
            marginTop: '0.25rem',
          }}
        >
          Xem chi tiết <FiArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

/* ─── Main Component ─── */
function Projects() {
  const [content, setContent] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedTech, setSelectedTech] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('category'); // 'category' | 'tech'
  const [showAllFilters, setShowAllFilters] = useState(false);
  const MAX_FILTERS = 7;

  useEffect(() => {
    (async () => {
      const c = await getPageContent('projects');
      if (c) setContent(c);
    })();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [content, selectedCategory, selectedTech, searchQuery]);

  const rawProjects = (content?.projects || []).filter(p => !p.isHidden);
  const sorted = [...rawProjects].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  /* Danh sách filter */
  const allCategories = ['Tất cả', ...new Set(rawProjects.map(p => p.category).filter(Boolean))];
  const allTechs = ['Tất cả', ...new Set(rawProjects.flatMap(p => p.technologies || []))];

  const activeFilters = filterMode === 'category' ? allCategories : allTechs;
  const visibleFilters = showAllFilters ? activeFilters : activeFilters.slice(0, MAX_FILTERS);

  /* Filter logic */
  const filtered = sorted.filter(p => {
    const byCat = selectedCategory === 'Tất cả' || p.category === selectedCategory;
    const byTech = selectedTech === 'Tất cả' || (p.technologies || []).includes(selectedTech);
    const q = searchQuery.toLowerCase();
    const bySearch = !q || p.title?.toLowerCase().includes(q) || stripHtml(p.description).toLowerCase().includes(q) || p.client?.toLowerCase().includes(q);
    return byCat && byTech && bySearch;
  });

  const pinnedCount = filtered.filter(p => p.isPinned).length;

  return (
    <section className="page projects-page">
      <style>{`
        .projects-wrap {
          max-width: 1140px;
          margin: 0 auto;
          padding: 0 1.5rem 5rem;
        }
        .filter-bar {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1.25rem 1.5rem;
          margin-bottom: 2.5rem;
          box-shadow: 0 2px 12px rgba(0,0,0,0.03);
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border-radius: 10px;
          border: 1.5px solid #e2e8f0;
          font-size: 0.9rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          background: #f8fafc;
          box-sizing: border-box;
        }
        .search-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
          background: #fff;
        }
        .filter-tab {
          padding: 0.35rem 0.9rem;
          border-radius: 8px;
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          letter-spacing: 0.3px;
        }
        .projects-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
          gap: 1.75rem;
        }
        .empty-state {
          grid-column: 1 / -1;
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }
        @media (max-width: 640px) {
          .projects-wrap { padding: 0 0.75rem 3rem; }
          .filter-bar { padding: 1rem; border-radius: 12px; }
          .projects-grid-layout { gap: 1.25rem; }
        }
      `}</style>

      <PageHero
        title={content?.pageTitle || 'Kho Hồ Sơ Dự Án'}
        subtitle={content?.subtitle || 'Tổng hợp mô hình hóa quy trình & hệ thống kịch bản nghiệp vụ'}
        bgImage={content?.coverUrl || ''}
      />

      <div className="projects-wrap">

        {/* ── Thanh filter ── */}
        <div className="filter-bar reveal-section">

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} size={16} />
            <input
              className="search-input"
              type="text"
              placeholder="Tìm kiếm theo tên dự án, công nghệ, khách hàng..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}
              >
                <FiX size={16} />
              </button>
            )}
          </div>

          {/* Toggle mode + filter chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            {/* Mode toggle */}
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '8px', marginRight: '0.5rem' }}>
              {[['category', 'Ngành'], ['tech', 'Công nghệ']].map(([mode, label]) => (
                <button
                  key={mode}
                  onClick={() => { setFilterMode(mode); setShowAllFilters(false); if (mode === 'category') setSelectedTech('Tất cả'); else setSelectedCategory('Tất cả'); }}
                  style={{
                    padding: '0.3rem 0.7rem', borderRadius: '6px', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                    backgroundColor: filterMode === mode ? '#fff' : 'transparent',
                    color: filterMode === mode ? '#2563eb' : '#64748b',
                    boxShadow: filterMode === mode ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <FiFilter size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />{label}
                </button>
              ))}
            </div>

            {/* Filter chips */}
            {visibleFilters.map(f => {
              const active = filterMode === 'category' ? selectedCategory === f : selectedTech === f;
              const catStyle = f !== 'Tất cả' && filterMode === 'category' ? getCategoryStyle(f) : null;
              return (
                <button
                  key={f}
                  className="filter-tab"
                  onClick={() => {
                    if (filterMode === 'category') setSelectedCategory(f);
                    else setSelectedTech(f);
                  }}
                  style={{
                    backgroundColor: active ? (catStyle?.bg || '#2563eb') : '#f8fafc',
                    color: active ? (catStyle?.text || '#fff') : '#64748b',
                    border: active ? `1.5px solid ${catStyle?.border || '#2563eb'}` : '1.5px solid #e2e8f0',
                  }}
                >
                  {f}
                </button>
              );
            })}

            {activeFilters.length > MAX_FILTERS && (
              <button
                onClick={() => setShowAllFilters(v => !v)}
                style={{
                  padding: '0.35rem 0.75rem', borderRadius: '8px', border: '1.5px dashed #cbd5e1',
                  fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                  background: 'transparent', color: '#2563eb',
                }}
              >
                {showAllFilters ? 'Rút gọn ↑' : `+${activeFilters.length - MAX_FILTERS} nữa`}
              </button>
            )}
          </div>
        </div>

        {/* ── Stats bar ── */}
        {filtered.length > 0 && (
          <div className="reveal-section" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Hiển thị <strong style={{ color: '#1e293b' }}>{filtered.length}</strong> dự án
            </span>
            {pinnedCount > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', color: '#b45309', fontWeight: 600, backgroundColor: '#fef3c7', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                <FiStar size={11} fill="#b45309" /> {pinnedCount} nổi bật
              </span>
            )}
          </div>
        )}

        {/* ── Grid dự án ── */}
        <div className="projects-grid-layout">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}

          {filtered.length === 0 && (
            <div className="empty-state">
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ color: '#475569', marginBottom: '0.5rem' }}>Không tìm thấy dự án phù hợp</h3>
              <p style={{ fontSize: '0.9rem' }}>Thử thay đổi từ khóa hoặc bộ lọc khác.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Tất cả'); setSelectedTech('Tất cả'); }}
                style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Projects;