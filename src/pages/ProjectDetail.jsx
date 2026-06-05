import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import {
  FiArrowLeft, FiClock, FiLayers, FiPaperclip, FiDownload,
  FiMaximize2, FiX, FiChevronLeft, FiChevronRight, FiExternalLink,
  FiUsers, FiTrendingUp, FiTag, FiList, FiChevronDown, FiChevronUp
} from 'react-icons/fi';

/* ═══════════════════════════════════════════════════
   LIGHTBOX
═══════════════════════════════════════════════════ */
function Lightbox({ list, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.97)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <FiX />
      </button>

      {list.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FiChevronLeft />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', fontSize: '1.3rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <FiChevronRight />
          </button>
        </>
      )}

      <img
        src={list[index]}
        alt="Phóng to"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: '10px', objectFit: 'contain', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}
      />

      {list.length > 1 && (
        <div style={{ position: 'absolute', bottom: '1.25rem', display: 'flex', gap: '6px' }}>
          {list.map((_, i) => (
            <div key={i} style={{ width: i === index ? '20px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION BLOCKS
═══════════════════════════════════════════════════ */
function TextBlock({ sec }) {
  return (
    <div
      className="rich-content"
      style={{ color: '#374151', fontSize: '0.975rem', lineHeight: '1.85' }}
      dangerouslySetInnerHTML={{ __html: sec.textContent }}
    />
  );
}

function ImageBlock({ sec, onOpenLightbox }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {sec.images.map((img, idx) => (
        <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <div
            style={{ position: 'relative', cursor: 'zoom-in' }}
            onClick={() => onOpenLightbox(sec.images.map(i => i.url), idx)}
          >
            <img
              src={img.url}
              alt=""
              style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '420px', objectFit: 'contain', backgroundColor: '#f8fafc' }}
            />
            <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15,23,42,0.7)', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiMaximize2 size={15} />
            </div>
          </div>
          {img.caption && (
            <div
              style={{ padding: '0.875rem 1rem', borderTop: '1px solid #e2e8f0', color: '#4b5563', fontSize: '0.875rem', lineHeight: '1.6', borderLeft: '3px solid #2563eb' }}
              dangerouslySetInnerHTML={{ __html: img.caption }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TableBlock({ sec }) {
  const { headers = [], rows = [] } = sec.tableData || {};
  return (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '480px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
            {headers.map((h, i) => (
              <th key={i} style={{ padding: '0.875rem 1.125rem', textAlign: 'left', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.3px' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: ri % 2 === 0 ? '#fff' : '#fafbfc' }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: '0.875rem 1.125rem', color: '#374151', lineHeight: '1.55', verticalAlign: 'top' }}>
                  {typeof cell === 'string' && cell.includes('<') ? (
                    <span dangerouslySetInnerHTML={{ __html: cell }} />
                  ) : cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                Chưa có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function FileBlock({ sec }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {sec.files.map((file, idx) => (
        <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
              <FiPaperclip color="#2563eb" size={15} /> {file.name}
            </span>
            <a
              href={file.url}
              download
              target="_blank"
              rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '7px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              <FiDownload size={13} /> Tải xuống
            </a>
          </div>
          <div style={{ backgroundColor: '#4b5563', padding: '0.5rem' }}>
            <iframe
              src={`${file.url}#toolbar=0`}
              title={file.name}
              style={{ width: '100%', height: '480px', border: 'none', borderRadius: '6px', backgroundColor: '#fff', display: 'block' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChartBlock({ sec }) {
  const max = Math.max(...(sec.chartData || []).map(d => d.value || 0), 1);
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', backgroundColor: '#fff' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '560px', margin: '0 auto' }}>
        {(sec.chartData || []).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
            <div style={{ width: '110px', fontSize: '0.82rem', fontWeight: 600, color: '#4b5563', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </div>
            <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '22px', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(item.value / max) * 100}%`,
                  height: '100%',
                  backgroundColor: sec.chartType === 'line' ? '#10b981' : '#2563eb',
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px',
                  transition: 'width 1s ease',
                }}
              >
                <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{item.value}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TOC SIDEBAR
═══════════════════════════════════════════════════ */
function TocSidebar({ sections, activeId, onClickSection, demoUrl }) {
  /* Xây dạng cây: section có children nếu có mục con */
  const buildTree = (secs) => {
    const roots = [];
    secs.forEach(sec => {
      if (sec.parentId) {
        const parent = roots.find(r => r.id === sec.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(sec);
        }
      } else {
        roots.push({ ...sec, children: [] });
      }
    });
    return roots;
  };

  const tree = buildTree(sections);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Nút Demo */}
      {demoUrl && (
        <a
          href={demoUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            backgroundColor: '#2563eb', color: '#fff', padding: '0.85rem 1rem',
            borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.35)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)'; }}
        >
          <FiExternalLink size={16} /> Xem Demo
        </a>
      )}

      {/* Mục lục */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '0.875rem 1.125rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiList size={14} color="#94a3b8" />
          <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
            Mục lục
          </span>
        </div>

        <div style={{ padding: '0.5rem 0' }}>
          {tree.length === 0 && (
            <p style={{ padding: '0.75rem 1.125rem', fontSize: '0.8rem', color: '#94a3b8' }}>Chưa có mục lục.</p>
          )}
          {tree.map(sec => (
            <div key={sec.id}>
              <button
                onClick={() => onClickSection(sec.id)}
                style={{
                  width: '100%', textAlign: 'left', background: activeId === sec.id ? '#eff6ff' : 'none',
                  border: 'none', borderLeft: activeId === sec.id ? '3px solid #2563eb' : '3px solid transparent',
                  padding: '0.55rem 1.125rem', color: activeId === sec.id ? '#2563eb' : '#4b5563',
                  fontSize: '0.85rem', fontWeight: activeId === sec.id ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  display: 'block',
                }}
                onMouseOver={e => { if (activeId !== sec.id) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; } }}
                onMouseOut={e => { if (activeId !== sec.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}
              >
                {sec.title}
              </button>

              {/* Mục con */}
              {(sec.children || []).map(child => (
                <button
                  key={child.id}
                  onClick={() => onClickSection(child.id)}
                  style={{
                    width: '100%', textAlign: 'left', background: activeId === child.id ? '#eff6ff' : 'none',
                    border: 'none', borderLeft: activeId === child.id ? '3px solid #93c5fd' : '3px solid transparent',
                    padding: '0.45rem 1.125rem 0.45rem 2rem', color: activeId === child.id ? '#2563eb' : '#6b7280',
                    fontSize: '0.8rem', fontWeight: activeId === child.id ? 700 : 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                  }}
                >
                  └ {child.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MOBILE TOC DRAWER
═══════════════════════════════════════════════════ */
function MobileTocDrawer({ sections, activeId, onClickSection, demoUrl }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem',
            backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px',
            fontSize: '0.85rem', fontWeight: 700, color: '#374151', cursor: 'pointer',
          }}
        >
          <FiList size={14} />
          Mục lục
          {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>
        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}
          >
            <FiExternalLink size={14} /> Xem Demo
          </a>
        )}
      </div>

      {open && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          {sections.map(sec => (
            <button
              key={sec.id}
              onClick={() => { onClickSection(sec.id); setOpen(false); }}
              style={{
                width: '100%', textAlign: 'left', background: activeId === sec.id ? '#eff6ff' : 'none',
                border: 'none', borderBottom: '1px solid #f8fafc', padding: '0.7rem 1rem',
                color: activeId === sec.id ? '#2563eb' : '#374151', fontSize: '0.875rem',
                fontWeight: activeId === sec.id ? 700 : 500, cursor: 'pointer',
              }}
            >
              {sec.title}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════ */
function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, list: [], index: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const sectionRefs = useRef({});

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  useEffect(() => {
    (async () => {
      const content = await getPageContent('projects');
      if (content?.projects) {
        const found = content.projects.find(p => p.slug === slug && !p.isHidden);
        setProject(found || null);
      }
      setLoading(false);
    })();
  }, [slug]);

  /* Active section tracking */
  useEffect(() => {
    if (!project) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [project]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#94a3b8' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '0.9rem' }}>Đang tải dữ liệu dự án...</span>
    </div>
  );

  if (!project) return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Dự án không tồn tại</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Hồ sơ này đã bị ẩn hoặc không tồn tại.</p>
      <Link to="/projects" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>← Quay lại danh sách</Link>
    </div>
  );

  const sections = project.sections || [];
  const flatSections = sections.flatMap(s => s.children ? [s, ...s.children] : [s]);

  return (
    <>
      <style>{`
        .pd-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
        }
        .pd-layout {
          display: grid;
          grid-template-columns: 1fr 260px;
          gap: 2.5rem;
          align-items: start;
        }
        .pd-sidebar {
          position: sticky;
          top: 80px;
        }
        .pd-sticky-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #f1f5f9;
          padding: 0.875rem 0;
          margin-bottom: 2rem;
        }
        .rich-content h1, .rich-content h2, .rich-content h3, .rich-content h4 {
          color: #1e293b; margin: 1.5rem 0 0.75rem; font-weight: 700; line-height: 1.35;
        }
        .rich-content h1 { font-size: 1.35rem; }
        .rich-content h2 { font-size: 1.2rem; }
        .rich-content h3 { font-size: 1.05rem; }
        .rich-content p { margin: 0 0 1rem; }
        .rich-content ul, .rich-content ol { padding-left: 1.5rem; margin: 0.75rem 0 1rem; }
        .rich-content li { margin-bottom: 0.4rem; }
        .rich-content strong { color: #1e293b; }
        .rich-content a { color: #2563eb; }
        .section-block {
          scroll-margin-top: 90px;
          padding: 2rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .section-block:last-child { border-bottom: none; }
        .section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 1.15rem;
          background: #2563eb;
          border-radius: 2px;
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .pd-layout {
            grid-template-columns: 1fr;
          }
          .pd-sidebar { display: none; }
          .pd-wrap { padding: 1.25rem 0.875rem 3.5rem; }
        }
        @media (max-width: 640px) {
          .pd-wrap { padding: 1rem 0.75rem 3rem; }
        }
      `}</style>

      <div className="pd-wrap">
        {/* Back link */}
        <Link
          to="/projects"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}
        >
          <FiArrowLeft size={15} /> Quay lại danh sách dự án
        </Link>

        <div className="pd-layout">
          {/* ── CỘT TRÁI: NỘI DUNG ── */}
          <div>
            {/* Sticky header */}
            <div className="pd-sticky-header">
              <h1 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.75rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                {project.title}
              </h1>
            </div>

            {/* Meta thông tin */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
              {project.category && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <FiTag size={12} /> {project.category}
                </span>
              )}
              {project.duration && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                  <FiClock size={12} /> {project.duration}
                </span>
              )}
              {project.client && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                  <FiUsers size={12} /> {project.client}
                </span>
              )}
              {project.metric && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}>
                  <FiTrendingUp size={12} /> {project.metric}
                </span>
              )}
              {sections.length > 0 && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}>
                  <FiLayers size={12} /> {sections.length} phần
                </span>
              )}
            </div>

            {/* Mô tả dự án */}
            {project.description && (
              <div
                className="rich-content"
                style={{ color: '#475569', fontSize: '0.975rem', lineHeight: '1.8', marginBottom: '2rem', padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #2563eb' }}
                dangerouslySetInnerHTML={{ __html: project.description }}
              />
            )}

            {/* Mobile TOC */}
            {isMobile && sections.length > 0 && (
              <MobileTocDrawer
                sections={flatSections}
                activeId={activeSection}
                onClickSection={scrollToSection}
                demoUrl={project.demoUrl}
              />
            )}

            {/* Sections */}
            <div>
              {sections.map(sec => (
                <div
                  key={sec.id}
                  id={sec.id}
                  className="section-block"
                  ref={el => sectionRefs.current[sec.id] = el}
                >
                  <h3 className="section-title">{sec.title}</h3>

                  {sec.type === 'text' && sec.textContent && <TextBlock sec={sec} />}
                  {sec.type === 'image' && sec.images?.length > 0 && (
                    <ImageBlock sec={sec} onOpenLightbox={(list, idx) => setLightbox({ open: true, list, index: idx })} />
                  )}
                  {sec.type === 'table' && sec.tableData?.headers && <TableBlock sec={sec} />}
                  {sec.type === 'file' && sec.files?.length > 0 && <FileBlock sec={sec} />}
                  {sec.type === 'chart' && sec.chartData && <ChartBlock sec={sec} />}

                  {/* Sub-sections */}
                  {(sec.children || []).map(child => (
                    <div
                      key={child.id}
                      id={child.id}
                      style={{ marginTop: '2rem', paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}
                      ref={el => sectionRefs.current[child.id] = el}
                    >
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#374151', marginBottom: '1rem' }}>
                        {child.title}
                      </h4>
                      {child.type === 'text' && child.textContent && <TextBlock sec={child} />}
                      {child.type === 'image' && child.images?.length > 0 && (
                        <ImageBlock sec={child} onOpenLightbox={(list, idx) => setLightbox({ open: true, list, index: idx })} />
                      )}
                      {child.type === 'table' && child.tableData?.headers && <TableBlock sec={child} />}
                      {child.type === 'file' && child.files?.length > 0 && <FileBlock sec={child} />}
                      {child.type === 'chart' && child.chartData && <ChartBlock sec={child} />}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {sections.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                <FiLayers size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>Chưa có nội dung chi tiết cho dự án này.</p>
              </div>
            )}
          </div>

          {/* ── CỘT PHẢI: SIDEBAR ── */}
          {!isMobile && (
            <div className="pd-sidebar">
              <TocSidebar
                sections={flatSections}
                activeId={activeSection}
                onClickSection={scrollToSection}
                demoUrl={project.demoUrl}
              />
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox.open && (
        <Lightbox
          list={lightbox.list}
          index={lightbox.index}
          onClose={() => setLightbox({ ...lightbox, open: false })}
          onPrev={() => setLightbox(lb => ({ ...lb, index: lb.index === 0 ? lb.list.length - 1 : lb.index - 1 }))}
          onNext={() => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.list.length }))}
        />
      )}
    </>
  );
}

export default ProjectDetail;