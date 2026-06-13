import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiClock, FiArrowRight, FiSearch, FiBookOpen, FiTag, FiChevronDown } from 'react-icons/fi';
import PageHero from '../components/PageHero';

/* ── Estimate reading time ── */
function readingTime(htmlContent = '') {
  const text = htmlContent.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* ── Parse "dd/mm/yyyy" (vi-VN) or fallback formats into a sortable Date ── */
function parseDate(str = '') {
  if (!str) return new Date(0);
  const parts = str.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts.map(Number);
    if (!isNaN(d) && !isNaN(m) && !isNaN(y)) return new Date(y, m - 1, d);
  }
  const fallback = new Date(str);
  return isNaN(fallback.getTime()) ? new Date(0) : fallback;
}

/* ── Scroll reveal ── */
function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.06 }
    );
    document.querySelectorAll('.reveal-section').forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const SORT_OPTIONS = [
  { value: 'featured', label: 'Nổi bật nhất' },
  { value: 'newest',   label: 'Mới nhất' },
  { value: 'oldest',   label: 'Lâu nhất' },
  { value: 'az',       label: 'A → Z' },
  { value: 'za',       label: 'Z → A' },
];

export default function Blog() {
  const [content, setContent]               = useState(null);
  const [activeCategory, setActiveCategory]  = useState('Tất cả');
  const [search, setSearch]                  = useState('');
  const [sortBy, setSortBy]                  = useState('featured');
  const [sortOpen, setSortOpen]              = useState(false);

  useEffect(() => {
    (async () => {
      const c = await getPageContent('blog');
      if (c) setContent(c);
    })();
  }, []);

  useReveal([content, activeCategory, search, sortBy]);

  const rawPosts = useMemo(
    () => (content?.posts || []).filter(p => !p.isHidden && !p.isDraft),
    [content]
  );

  const categories = useMemo(
    () => ['Tất cả', ...new Set(rawPosts.map(p => p.category || 'Chung').filter(Boolean))],
    [rawPosts]
  );

  const filtered = useMemo(() => {
    let list = activeCategory === 'Tất cả'
      ? rawPosts
      : rawPosts.filter(p => (p.category || 'Chung') === activeCategory);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q) ||
        (p.tags || []).some(t => (t || '').toLowerCase().includes(q))
      );
    }

    list = [...list];

    switch (sortBy) {
      case 'newest':
        list.sort((a, b) => parseDate(b.date) - parseDate(a.date));
        break;
      case 'oldest':
        list.sort((a, b) => parseDate(a.date) - parseDate(b.date));
        break;
      case 'az':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'vi'));
        break;
      case 'za':
        list.sort((a, b) => (b.title || '').localeCompare(a.title || '', 'vi'));
        break;
      case 'featured':
      default: {
        // Bài đã ghim lên đầu (ghim mới nhất trước), phần còn lại theo mới nhất rồi xáo nhẹ trong nhóm cùng ngày
        const pinned = list.filter(p => p.isPinned).sort((a, b) => parseDate(b.date) - parseDate(a.date));
        const rest   = list.filter(p => !p.isPinned).sort((a, b) => parseDate(b.date) - parseDate(a.date));
        list = [...pinned, ...rest];
        break;
      }
    }

    return list;
  }, [rawPosts, activeCategory, search, sortBy]);

  // Bài lớn (hero) chỉ hiển thị khi đang ở chế độ "Nổi bật nhất" và không lọc/tìm kiếm đặc biệt
  const showFeatured = sortBy === 'featured';
  const featuredPost  = showFeatured ? (filtered[0] || null) : null;
  const standardPosts = showFeatured ? filtered.slice(1) : filtered;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .bl-root { font-family:'Plus Jakarta Sans',sans-serif; background:#f8fafc; }

        /* ── Toolbar ── */
        .bl-toolbar {
          max-width:1100px; margin:0 auto;
          padding:0 clamp(0.75rem,4vw,2rem);
          display:flex; flex-direction:column; gap:0.9rem;
          margin-bottom:clamp(1.5rem,4vw,2.5rem);
        }
        .bl-toolbar-row {
          display:flex; align-items:center; gap:0.75rem; flex-wrap:wrap; justify-content:space-between;
        }
        .bl-search-wrap {
          position:relative; width:100%; max-width:420px;
        }
        .bl-search-wrap svg {
          position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#94a3b8;
        }
        .bl-search {
          width:100%; padding:0.65rem 0.9rem 0.65rem 2.5rem;
          border-radius:11px; border:1.5px solid #e2e8f0;
          font-size:0.82rem; outline:none; background:#fff;
          transition:border-color 0.2s;
        }
        .bl-search:focus { border-color:#6366f1; }

        /* ── Sort dropdown ── */
        .bl-sort-wrap { position:relative; flex-shrink:0; }
        .bl-sort-btn {
          display:inline-flex; align-items:center; gap:6px;
          padding:0.6rem 1rem; border-radius:11px;
          font-size:0.8rem; font-weight:700; cursor:pointer;
          border:1.5px solid #e2e8f0; background:#fff; color:#475569;
          transition:border-color 0.18s; white-space:nowrap;
        }
        .bl-sort-btn:hover { border-color:#6366f1; color:#6366f1; }
        .bl-sort-menu {
          position:absolute; top:calc(100% + 6px); right:0; z-index:20;
          background:#fff; border:1.5px solid #e2e8f0; border-radius:11px;
          box-shadow:0 12px 32px rgba(15,23,42,0.10);
          min-width:160px; overflow:hidden; padding:4px;
        }
        .bl-sort-item {
          display:block; width:100%; text-align:left;
          padding:0.55rem 0.8rem; border-radius:8px; border:none; background:transparent;
          font-size:0.8rem; font-weight:600; color:#475569; cursor:pointer; transition:all 0.15s;
        }
        .bl-sort-item:hover { background:#eef2ff; color:#6366f1; }
        .bl-sort-item.active { background:#6366f1; color:#fff; }

        .bl-count { font-size:0.78rem; color:#94a3b8; font-weight:600; white-space:nowrap; }

        .bl-cats {
          display:flex; gap:0.4rem; flex-wrap:wrap; align-items:center;
        }
        .bl-cat-btn {
          padding:0.36rem 0.95rem; border-radius:99px;
          font-size:clamp(0.72rem,1.6vw,0.78rem); font-weight:600;
          cursor:pointer; border:1.5px solid #e2e8f0;
          background:#fff; color:#64748b; transition:all 0.18s;
          white-space:nowrap;
        }
        .bl-cat-btn.active {
          background:#6366f1; color:#fff; border-color:#6366f1;
          box-shadow:0 4px 12px rgba(99,102,241,0.22);
        }
        .bl-cat-btn:hover:not(.active) { border-color:#6366f1; color:#6366f1; }

        /* ── Tags ── */
        .bl-tags { display:flex; gap:0.35rem; flex-wrap:wrap; }
        .bl-tag-pill {
          display:inline-flex; align-items:center; gap:3px;
          padding:0.2rem 0.6rem; border-radius:99px;
          font-size:0.66rem; font-weight:700;
          background:#f1f5f9; color:#64748b;
        }

        /* ── Inner wrapper ── */
        .bl-inner {
          max-width:1100px; margin:0 auto;
          padding:0 clamp(0.75rem,4vw,2rem) clamp(2.5rem,6vw,4rem);
        }

        /* ── Featured (hero) card ── */
        .bl-featured {
          display:grid; grid-template-columns:1fr;
          border-radius:18px; overflow:hidden;
          border:1.5px solid #e2e8f0; background:#fff;
          margin-bottom:clamp(1.5rem,4vw,2.25rem);
          transition:box-shadow 0.3s;
        }
        .bl-featured:hover { box-shadow:0 16px 44px rgba(15,23,42,0.08); }
        @media(min-width:700px){
          .bl-featured { grid-template-columns:46% 1fr; }
        }
        .bl-featured-img {
          width:100%; min-height:200px; max-height:380px;
          object-fit:cover; display:block;
        }
        .bl-featured-body {
          padding:clamp(1.2rem,3.5vw,2.2rem);
          display:flex; flex-direction:column; justify-content:center; gap:0.7rem;
        }
        .bl-cat-pill {
          display:inline-flex; align-items:center;
          padding:0.24rem 0.75rem; border-radius:99px;
          font-size:0.64rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;
          background:#eef2ff; color:#6366f1; width:fit-content;
        }
        .bl-featured-title {
          font-family:'Fraunces',serif;
          font-size:clamp(1.1rem,2.6vw,1.65rem); font-weight:900; color:#0f172a;
          line-height:1.25; margin:0;
        }
        .bl-featured-title a { color:inherit; text-decoration:none; }
        .bl-featured-title a:hover { color:#6366f1; }
        .bl-featured-excerpt {
          font-size:clamp(0.78rem,1.6vw,0.86rem); color:#64748b; line-height:1.75;
          display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-meta {
          display:flex; align-items:center; gap:0.85rem; flex-wrap:wrap;
          font-size:0.72rem; color:#94a3b8; font-weight:600;
          padding-top:0.75rem; border-top:1px solid #f1f5f9;
        }
        .bl-meta-item { display:flex; align-items:center; gap:5px; }
        .bl-read-link {
          display:inline-flex; align-items:center; gap:6px;
          color:#6366f1; font-weight:700; text-decoration:none;
          font-size:0.78rem; margin-left:auto;
          transition:gap 0.2s;
        }
        .bl-read-link:hover { gap:10px; }

        /* ── Post grid: magazine style, 2-3 cols on small, more on large ── */
        .bl-grid {
          display:grid;
          grid-template-columns:repeat(2,1fr);
          gap:clamp(0.75rem,2vw,1.25rem);
        }
        @media(min-width:560px){
          .bl-grid { grid-template-columns:repeat(3,1fr); }
        }
        @media(min-width:860px){
          .bl-grid { grid-template-columns:repeat(4,1fr); }
        }
        @media(min-width:1180px){
          .bl-grid { grid-template-columns:repeat(5,1fr); }
        }

        .bl-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:14px;
          overflow:hidden; display:flex; flex-direction:column;
          transition:all 0.28s cubic-bezier(0.23,1,0.32,1);
        }
        .bl-card:hover {
          transform:translateY(-4px);
          box-shadow:0 14px 32px rgba(15,23,42,0.08);
          border-color:#c7d2fe;
        }
        .bl-card-img-wrap {
          height:clamp(110px,18vw,150px); overflow:hidden; flex-shrink:0;
        }
        .bl-card-img {
          width:100%; height:100%; object-fit:cover; display:block;
          transition:transform 0.45s cubic-bezier(0.23,1,0.32,1);
        }
        .bl-card:hover .bl-card-img { transform:scale(1.06); }
        .bl-card-img-placeholder {
          width:100%; height:100%; background:linear-gradient(135deg,#eef2ff,#e0e7ff);
          display:flex; align-items:center; justify-content:center; color:#a5b4fc;
        }
        .bl-card-body {
          padding:clamp(0.7rem,2vw,1rem);
          flex:1; display:flex; flex-direction:column; gap:0.4rem;
        }
        .bl-card-top { display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap; }
        .bl-card-title {
          font-size:clamp(0.78rem,1.8vw,0.9rem); font-weight:800; color:#0f172a; line-height:1.35;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-card-title a { color:inherit; text-decoration:none; }
        .bl-card-title a:hover { color:#6366f1; }
        .bl-card-excerpt {
          font-size:clamp(0.7rem,1.4vw,0.78rem); color:#64748b; line-height:1.6; flex:1;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-card-footer {
          display:flex; align-items:center; justify-content:space-between; gap:0.4rem;
          padding-top:0.6rem; border-top:1px solid #f1f5f9; margin-top:auto;
          flex-wrap:wrap;
        }
        .bl-card-footer-meta {
          display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;
        }
        .bl-card-footer-meta span {
          font-size:0.66rem; color:#94a3b8; display:flex; align-items:center; gap:3px;
        }
        .bl-card .bl-read-link { font-size:0.7rem; }

        .bl-pinned-badge {
          font-size:0.62rem; font-weight:800; color:#d97706; background:#fef3c7;
          padding:0.16rem 0.55rem; border-radius:99px; text-transform:uppercase; letter-spacing:0.05em;
        }

        /* ── Empty ── */
        .bl-empty {
          grid-column:1/-1; text-align:center;
          padding:clamp(2.5rem,6vw,4rem) 1rem; color:#94a3b8;
        }
        .bl-empty h3 { font-size:1.05rem; color:#64748b; margin-bottom:0.5rem; }
        .bl-empty p { font-size:0.85rem; }
      `}</style>

      <div className="bl-root page blog-page">
        <PageHero
          title={content?.pageTitle || 'Góc Chia Sẻ Kiến Thức'}
          subtitle={content?.subtitle || 'Phân tích, chia sẻ và tổng hợp kiến thức nghiệp vụ BA'}
          bgImage={content?.coverUrl || ''}
        />

        {/* ── Toolbar: search + sort + category ── */}
        <div className="bl-toolbar reveal-section">
          <div className="bl-toolbar-row">
            <div className="bl-search-wrap">
              <FiSearch size={14} />
              <input
                className="bl-search"
                type="text"
                placeholder="Tìm kiếm bài viết, tag..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <span className="bl-count">{filtered.length} bài viết</span>

              <div className="bl-sort-wrap">
                <button className="bl-sort-btn" onClick={() => setSortOpen(o => !o)}>
                  {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sắp xếp'}
                  <FiChevronDown size={13} />
                </button>
                {sortOpen && (
                  <>
                    <div style={{ position:'fixed', inset:0, zIndex:10 }} onClick={() => setSortOpen(false)} />
                    <div className="bl-sort-menu">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`bl-sort-item${sortBy === opt.value ? ' active' : ''}`}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bl-cats">
            {categories.map(cat => (
              <button
                key={cat}
                className={`bl-cat-btn${activeCategory === cat ? ' active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="bl-inner">
          {/* ── Featured (hero) ── */}
          {featuredPost && (
            <div className="bl-featured reveal-section">
              {featuredPost.coverImage
                ? <img src={featuredPost.coverImage} alt={featuredPost.title} className="bl-featured-img" />
                : (
                  <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:200 }}>
                    <FiBookOpen size={40} color="rgba(255,255,255,0.2)" />
                  </div>
                )
              }
              <div className="bl-featured-body">
                {featuredPost.isPinned && (
                  <span className="bl-pinned-badge">Nổi bật</span>
                )}
                <span className="bl-cat-pill">{featuredPost.category || 'Chung'}</span>
                <h2 className="bl-featured-title">
                  <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <div
                  className="bl-featured-excerpt"
                  dangerouslySetInnerHTML={{ __html: featuredPost.excerpt }}
                />
                {(featuredPost.tags || []).length > 0 && (
                  <div className="bl-tags">
                    {featuredPost.tags.slice(0, 4).map((t, i) => (
                      <span key={i} className="bl-tag-pill"><FiTag size={10} /> {t}</span>
                    ))}
                  </div>
                )}
                <div className="bl-meta">
                  <span className="bl-meta-item"><FiClock size={12} /> {featuredPost.date}</span>
                  <span className="bl-meta-item"><FiBookOpen size={12} /> {readingTime(featuredPost.content || featuredPost.excerpt)} phút đọc</span>
                  <Link to={`/blog/${featuredPost.slug}`} className="bl-read-link">
                    Đọc bài viết <FiArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Grid ── */}
          <div className="bl-grid">
            {standardPosts.length === 0 && !featuredPost && (
              <div className="bl-empty">
                <FiBookOpen size={36} style={{ marginBottom:'0.85rem', opacity:0.3 }} />
                <h3>Không tìm thấy bài viết</h3>
                <p>Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
              </div>
            )}
            {standardPosts.map(post => (
              <div key={post.id} className="bl-card reveal-section">
                <div className="bl-card-img-wrap">
                  {post.coverImage
                    ? <img src={post.coverImage} alt={post.title} className="bl-card-img" />
                    : (
                      <div className="bl-card-img-placeholder">
                        <FiBookOpen size={26} />
                      </div>
                    )
                  }
                </div>
                <div className="bl-card-body">
                  <div className="bl-card-top">
                    <span className="bl-cat-pill" style={{ fontSize:'0.6rem' }}>{post.category || 'Chung'}</span>
                    {post.isPinned && <span className="bl-pinned-badge">Nổi bật</span>}
                  </div>
                  <div className="bl-card-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </div>
                  <div
                    className="bl-card-excerpt"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
                  {(post.tags || []).length > 0 && (
                    <div className="bl-tags">
                      {post.tags.slice(0, 2).map((t, i) => (
                        <span key={i} className="bl-tag-pill"><FiTag size={9} /> {t}</span>
                      ))}
                    </div>
                  )}
                  <div className="bl-card-footer">
                    <div className="bl-card-footer-meta">
                      <span><FiClock size={11} /> {post.date}</span>
                      <span><FiBookOpen size={11} /> {readingTime(post.content || post.excerpt)} phút</span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="bl-read-link">
                      Đọc <FiArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}