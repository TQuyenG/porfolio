import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiClock, FiArrowRight, FiSearch, FiBookOpen } from 'react-icons/fi';
import PageHero from '../components/PageHero';

/* ── Estimate reading time ── */
function readingTime(htmlContent = '') {
  const text = htmlContent.replace(/<[^>]+>/g, '');
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
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

export default function Blog() {
  const [content, setContent]           = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [search, setSearch]             = useState('');

  useEffect(() => {
    (async () => {
      const c = await getPageContent('blog');
      if (c) setContent(c);
    })();
  }, []);

  useReveal([content, activeCategory, search]);

  const rawPosts = useMemo(
    () => (content?.posts || []).filter(p => !p.isHidden && !p.isDraft),
    [content]
  );

  const categories = useMemo(
    () => ['Tất cả', ...new Set(rawPosts.map(p => p.category).filter(Boolean))],
    [rawPosts]
  );

  const filtered = useMemo(() => {
    let list = activeCategory === 'Tất cả'
      ? rawPosts
      : rawPosts.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.excerpt || '').toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }, [rawPosts, activeCategory, search]);

  const featuredPost  = filtered[0] || null;
  const standardPosts = filtered.slice(1);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .bl-root { font-family:'Plus Jakarta Sans',sans-serif; background:#f8fafc; }

        /* ── Toolbar ── */
        .bl-toolbar {
          max-width:1100px; margin:0 auto;
          padding:0 clamp(1rem,4vw,2rem);
          display:flex; flex-direction:column; gap:1.2rem;
          margin-bottom:clamp(2rem,4vw,3rem);
        }
        .bl-search-wrap {
          position:relative; width:100%; max-width:480px;
        }
        .bl-search-wrap svg {
          position:absolute; left:14px; top:50%; transform:translateY(-50%); color:#94a3b8;
        }
        .bl-search {
          width:100%; padding:0.75rem 1rem 0.75rem 2.7rem;
          border-radius:12px; border:1.5px solid #e2e8f0;
          font-size:0.9rem; outline:none; background:#fff;
          transition:border-color 0.2s;
        }
        .bl-search:focus { border-color:#6366f1; }
        .bl-cats {
          display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;
        }
        .bl-cat-btn {
          padding:0.42rem 1.1rem; border-radius:99px;
          font-size:clamp(0.78rem,1.6vw,0.86rem); font-weight:600;
          cursor:pointer; border:1.5px solid #e2e8f0;
          background:#fff; color:#64748b; transition:all 0.18s;
          white-space:nowrap;
        }
        .bl-cat-btn.active {
          background:#6366f1; color:#fff; border-color:#6366f1;
          box-shadow:0 4px 12px rgba(99,102,241,0.22);
        }
        .bl-cat-btn:hover:not(.active) { border-color:#6366f1; color:#6366f1; }

        /* ── Inner wrapper ── */
        .bl-inner {
          max-width:1100px; margin:0 auto;
          padding:0 clamp(1rem,4vw,2rem) clamp(3rem,6vw,5rem);
        }

        /* ── Featured card ── */
        .bl-featured {
          display:grid; grid-template-columns:1fr;
          border-radius:20px; overflow:hidden;
          border:1.5px solid #e2e8f0; background:#fff;
          margin-bottom:clamp(2rem,4vw,3rem);
          transition:box-shadow 0.3s;
        }
        .bl-featured:hover { box-shadow:0 16px 44px rgba(15,23,42,0.08); }
        @media(min-width:700px){
          .bl-featured { grid-template-columns:45% 1fr; }
        }
        .bl-featured-img {
          width:100%; min-height:240px; max-height:420px;
          object-fit:cover; display:block;
        }
        .bl-featured-body {
          padding:clamp(1.6rem,4vw,2.8rem);
          display:flex; flex-direction:column; justify-content:center; gap:0.9rem;
        }
        .bl-cat-pill {
          display:inline-flex; align-items:center;
          padding:0.28rem 0.85rem; border-radius:99px;
          font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;
          background:#eef2ff; color:#6366f1; width:fit-content;
        }
        .bl-featured-title {
          font-family:'Fraunces',serif;
          font-size:clamp(1.3rem,3vw,2rem); font-weight:900; color:#0f172a;
          line-height:1.2; margin:0;
        }
        .bl-featured-title a { color:inherit; text-decoration:none; }
        .bl-featured-title a:hover { color:#6366f1; }
        .bl-featured-excerpt {
          font-size:clamp(0.85rem,1.8vw,0.95rem); color:#64748b; line-height:1.8;
          display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-meta {
          display:flex; align-items:center; gap:1rem; flex-wrap:wrap;
          font-size:0.78rem; color:#94a3b8; font-weight:600;
          padding-top:0.9rem; border-top:1px solid #f1f5f9;
        }
        .bl-meta-item { display:flex; align-items:center; gap:5px; }
        .bl-read-link {
          display:inline-flex; align-items:center; gap:6px;
          color:#6366f1; font-weight:700; text-decoration:none;
          font-size:0.85rem; margin-left:auto;
          transition:gap 0.2s;
        }
        .bl-read-link:hover { gap:10px; }

        /* ── Post grid ── */
        .bl-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));
          gap:clamp(1rem,2.5vw,1.6rem);
        }
        .bl-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:18px;
          overflow:hidden; display:flex; flex-direction:column;
          transition:all 0.28s cubic-bezier(0.23,1,0.32,1);
        }
        .bl-card:hover {
          transform:translateY(-5px);
          box-shadow:0 18px 44px rgba(15,23,42,0.08);
          border-color:#c7d2fe;
        }
        .bl-card-img-wrap {
          height:clamp(160px,22vw,210px); overflow:hidden; flex-shrink:0;
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
          padding:clamp(1rem,2.5vw,1.4rem);
          flex:1; display:flex; flex-direction:column; gap:0.55rem;
        }
        .bl-card-top { display:flex; align-items:center; gap:0.6rem; flex-wrap:wrap; }
        .bl-card-title {
          font-size:clamp(0.92rem,2vw,1.05rem); font-weight:800; color:#0f172a; line-height:1.4;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-card-title a { color:inherit; text-decoration:none; }
        .bl-card-title a:hover { color:#6366f1; }
        .bl-card-excerpt {
          font-size:clamp(0.78rem,1.6vw,0.86rem); color:#64748b; line-height:1.7; flex:1;
          display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bl-card-footer {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:0.8rem; border-top:1px solid #f1f5f9; margin-top:auto;
        }

        /* ── Empty ── */
        .bl-empty {
          grid-column:1/-1; text-align:center;
          padding:clamp(3rem,6vw,5rem) 1rem; color:#94a3b8;
        }
        .bl-empty h3 { font-size:1.2rem; color:#64748b; margin-bottom:0.5rem; }
      `}</style>

      <div className="bl-root page blog-page">
        <PageHero
          title={content?.pageTitle || 'Góc Chia Sẻ Kiến Thức'}
          subtitle={content?.subtitle || 'Phân tích, chia sẻ và tổng hợp kiến thức nghiệp vụ BA'}
          bgImage={content?.coverUrl || ''}
        />

        {/* ── Toolbar: search + category ── */}
        <div className="bl-toolbar reveal-section">
          <div style={{ display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap', justifyContent:'space-between' }}>
            <div className="bl-search-wrap">
              <FiSearch size={15} />
              <input
                className="bl-search"
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <span style={{ fontSize:'0.82rem', color:'#94a3b8', fontWeight:600, whiteSpace:'nowrap' }}>
              {filtered.length} bài viết
            </span>
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
          {/* ── Featured ── */}
          {featuredPost && (
            <div className="bl-featured reveal-section">
              {featuredPost.coverImage
                ? <img src={featuredPost.coverImage} alt={featuredPost.title} className="bl-featured-img" />
                : (
                  <div style={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:240 }}>
                    <FiBookOpen size={48} color="rgba(255,255,255,0.2)" />
                  </div>
                )
              }
              <div className="bl-featured-body">
                {featuredPost.isPinned && (
                  <span style={{ fontSize:'0.7rem', fontWeight:800, color:'#d97706', background:'#fef3c7', padding:'0.2rem 0.7rem', borderRadius:99, width:'fit-content', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                    Nổi bật
                  </span>
                )}
                <span className="bl-cat-pill">{featuredPost.category || 'Chung'}</span>
                <h2 className="bl-featured-title">
                  <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>
                <div
                  className="bl-featured-excerpt"
                  dangerouslySetInnerHTML={{ __html: featuredPost.excerpt }}
                />
                <div className="bl-meta">
                  <span className="bl-meta-item"><FiClock size={13} /> {featuredPost.date}</span>
                  <span className="bl-meta-item"><FiBookOpen size={13} /> {readingTime(featuredPost.content || featuredPost.excerpt)} phút đọc</span>
                  <Link to={`/blog/${featuredPost.slug}`} className="bl-read-link">
                    Đọc bài viết <FiArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── Grid ── */}
          <div className="bl-grid">
            {standardPosts.length === 0 && !featuredPost && (
              <div className="bl-empty">
                <FiBookOpen size={40} style={{ marginBottom:'1rem', opacity:0.3 }} />
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
                        <FiBookOpen size={32} />
                      </div>
                    )
                  }
                </div>
                <div className="bl-card-body">
                  <div className="bl-card-top">
                    <span className="bl-cat-pill" style={{ fontSize:'0.68rem' }}>{post.category || 'Chung'}</span>
                    {post.isPinned && (
                      <span style={{ fontSize:'0.68rem', color:'#d97706', background:'#fef3c7', padding:'0.18rem 0.6rem', borderRadius:99, fontWeight:800 }}>Nổi bật</span>
                    )}
                  </div>
                  <div className="bl-card-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </div>
                  <div
                    className="bl-card-excerpt"
                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                  />
                  <div className="bl-card-footer">
                    <div style={{ display:'flex', gap:'0.8rem', alignItems:'center' }}>
                      <span style={{ fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4 }}>
                        <FiClock size={12} /> {post.date}
                      </span>
                      <span style={{ fontSize:'0.75rem', color:'#94a3b8', display:'flex', alignItems:'center', gap:4 }}>
                        <FiBookOpen size={12} /> {readingTime(post.content || post.excerpt)} phút
                      </span>
                    </div>
                    <Link to={`/blog/${post.slug}`} className="bl-read-link">
                      Đọc <FiArrowRight size={13} />
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