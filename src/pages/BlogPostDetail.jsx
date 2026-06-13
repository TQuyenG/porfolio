import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import {
  FiArrowLeft, FiClock, FiBookOpen, FiShare2,
  FiArrowRight, FiList, FiX, FiTag,
} from 'react-icons/fi';

/* ── Reading time ── */
function readingTime(html = '') {
  const words = html.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/* ── Extract headings for ToC ── */
function extractHeadings(html = '') {
  const div = document.createElement('div');
  div.innerHTML = html;
  const nodes = div.querySelectorAll('h2,h3,h4');
  return Array.from(nodes).map((node, i) => ({
    id: `heading-${i}`,
    text: node.innerText || node.textContent,
    level: parseInt(node.tagName[1], 10),
  }));
}

/* ── Inject IDs into content HTML ── */
function injectHeadingIds(html = '') {
  let idx = 0;
  return html.replace(/<(h[234])(.*?)>/gi, (match, tag, attrs) => {
    const id = `heading-${idx++}`;
    return `<${tag}${attrs} id="${id}">`;
  });
}

export default function BlogPostDetail() {
  const { slug }            = useParams();
  const [post, setPost]     = useState(null);
  const [global, setGlobal] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tocOpen, setTocOpen] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const contentRef = useRef(null);
  const progressRef = useRef(null);

  useEffect(() => {
    (async () => {
      const [blogData, globalData] = await Promise.all([
        getPageContent('blog'),
        getPageContent('global'),
      ]);
      if (globalData) setGlobal(globalData);
      if (blogData?.posts) {
        const found = blogData.posts.find(p => p.slug === slug && !p.isHidden);
        setPost(found || null);
        if (found) {
          setRelated(
            blogData.posts
              .filter(p => p.id !== found.id && !p.isHidden && !p.isDraft && (p.category || 'Chung') === (found.category || 'Chung'))
              .slice(0, 3)
          );
        }
      }
      setLoading(false);
    })();
  }, [slug]);

  /* Reading progress bar */
  useEffect(() => {
    if (!post) return;
    const handleScroll = () => {
      const el = contentRef.current;
      if (!el || !progressRef.current) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight + 80;
      const pct = Math.min(100, Math.max(0, (-rect.top / total) * 100));
      progressRef.current.style.width = `${pct}%`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post]);

  /* Active heading tracker */
  useEffect(() => {
    if (!post) return;
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => { if (e.isIntersecting) setActiveHeading(e.target.id); });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );
    document.querySelectorAll('#post-content h2,#post-content h3,#post-content h4')
      .forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [post]);

  const processedContent = useMemo(() => post ? injectHeadingIds(post.content || '') : '', [post]);
  const headings = useMemo(() => post ? extractHeadings(post.content || '') : [], [post]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); setTocOpen(false); }
  };

  /* Share */
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  if (loading) return (
    <div style={{ textAlign:'center', padding:'6rem 1rem', color:'#94a3b8' }}>
      <div style={{ width:40, height:40, border:'3px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', margin:'0 auto 1.5rem', animation:'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Đang tải bài viết...
    </div>
  );

  if (!post) return (
    <div style={{ textAlign:'center', padding:'6rem 1rem' }}>
      <FiBookOpen size={48} style={{ color:'#cbd5e1', marginBottom:'1rem' }} />
      <h2 style={{ color:'#0f172a', marginBottom:'0.5rem' }}>Bài viết không tồn tại</h2>
      <p style={{ color:'#64748b', marginBottom:'2rem' }}>Nội dung đã bị ẩn hoặc chưa được xuất bản.</p>
      <Link to="/blog" style={{ background:'#6366f1', color:'#fff', padding:'0.75rem 2rem', borderRadius:'10px', textDecoration:'none', fontWeight:700 }}>← Về trang Blog</Link>
    </div>
  );

  const authorName = global?.authorName || 'Quyên';
  const authorRole = global?.authorRole || 'Business Analyst & Web Developer';
  const authorAvatar = global?.authorAvatar || null;
  const rt = readingTime(post.content || '');

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');

        .bpd-root { font-family:'Plus Jakarta Sans',sans-serif; background:#f8fafc; min-height:100vh; }

        /* Progress bar */
        .bpd-progress-bar {
          position:fixed; top:80px; left:0; height:3px; z-index:9998;
          background:linear-gradient(90deg,#6366f1,#38bdf8);
          width:0%; transition:width 0.1s linear; border-radius:0 2px 2px 0;
        }

        /* Layout */
        .bpd-layout {
          max-width:1160px; margin:0 auto;
          padding:clamp(1.5rem,4vw,3rem) clamp(1rem,4vw,2rem);
          display:grid;
          grid-template-columns:1fr;
          gap:2rem;
          align-items:start;
        }
        @media(min-width:900px){
          .bpd-layout {
            grid-template-columns:1fr 260px;
            gap:3rem;
          }
        }

        /* Article */
        .bpd-article {
          background:#fff; border-radius:20px;
          border:1px solid #e2e8f0;
          overflow:hidden;
          min-width:0;
        }
        .bpd-cover {
          width:100%; max-height:440px; object-fit:cover; display:block;
        }
        .bpd-article-body {
          padding:clamp(1.5rem,4vw,3rem);
        }

        /* Header */
        .bpd-header { margin-bottom:2rem; padding-bottom:2rem; border-bottom:1px solid #f1f5f9; }
        .bpd-cat-pill {
          display:inline-flex; padding:0.28rem 0.85rem; border-radius:99px;
          font-size:0.72rem; font-weight:800; text-transform:uppercase; letter-spacing:0.06em;
          background:#eef2ff; color:#6366f1; margin-bottom:1rem;
        }
        .bpd-tags { display:flex; gap:0.4rem; flex-wrap:wrap; margin:0.9rem 0 0; }
        .bpd-tag-pill {
          display:inline-flex; align-items:center; gap:4px;
          padding:0.24rem 0.7rem; border-radius:99px;
          font-size:0.72rem; font-weight:700;
          background:#f1f5f9; color:#64748b;
        }
        .bpd-title {
          font-family:'Fraunces',serif;
          font-size:clamp(1.6rem,4vw,2.8rem);
          font-weight:900; color:#0f172a; line-height:1.15;
          margin:0 0 1.2rem 0;
        }
        .bpd-meta {
          display:flex; align-items:center; gap:1.2rem;
          flex-wrap:wrap; font-size:0.82rem; color:#94a3b8; font-weight:600;
        }
        .bpd-meta-item { display:flex; align-items:center; gap:5px; }

        /* Rich content typography */
        .bpd-content {
          font-family:'Lora',serif;
          font-size:clamp(1rem,2vw,1.12rem);
          line-height:1.95;
          color:#374151;
        }
        .bpd-content h2 {
          font-family:'Fraunces',serif; font-size:clamp(1.25rem,2.8vw,1.7rem);
          font-weight:900; color:#0f172a; margin:2.5rem 0 1rem;
          padding-bottom:0.5rem; border-bottom:2px solid #f1f5f9;
          scroll-margin-top:100px;
        }
        .bpd-content h3 {
          font-family:'Plus Jakarta Sans',sans-serif; font-size:clamp(1.05rem,2.2vw,1.3rem);
          font-weight:800; color:#1e293b; margin:2rem 0 0.8rem;
          scroll-margin-top:100px;
        }
        .bpd-content h4 {
          font-family:'Plus Jakarta Sans',sans-serif; font-size:clamp(0.95rem,2vw,1.1rem);
          font-weight:700; color:#334155; margin:1.5rem 0 0.6rem;
          scroll-margin-top:100px;
        }
        .bpd-content p { margin:0 0 1.4rem 0; }
        .bpd-content ul, .bpd-content ol { padding-left:1.6rem; margin:0 0 1.4rem; }
        .bpd-content li { margin-bottom:0.5rem; }
        .bpd-content blockquote {
          border-left:4px solid #6366f1; margin:2rem 0;
          padding:1rem 1.5rem; background:#f5f3ff; border-radius:0 12px 12px 0;
          font-style:italic; color:#4338ca;
        }
        .bpd-content a { color:#6366f1; font-weight:600; }
        .bpd-content img {
          width:100%; border-radius:12px; margin:1.5rem 0;
          box-shadow:0 8px 24px rgba(0,0,0,0.07);
        }
        .bpd-content table {
          width:100%; border-collapse:collapse; margin:1.5rem 0;
          font-family:'Plus Jakarta Sans',sans-serif; font-size:0.9rem;
          border-radius:10px; overflow:hidden; border:1px solid #e2e8f0;
        }
        .bpd-content th {
          background:#f8fafc; color:#0f172a; font-weight:700;
          padding:0.85rem 1rem; text-align:left; border-bottom:2px solid #e2e8f0;
        }
        .bpd-content td {
          padding:0.75rem 1rem; border-bottom:1px solid #f1f5f9; color:#374151;
        }
        .bpd-content tr:last-child td { border-bottom:none; }
        .bpd-content tr:nth-child(even) td { background:#fafafa; }
        .bpd-content code {
          background:#f1f5f9; color:#6366f1; padding:0.15rem 0.45rem;
          border-radius:5px; font-size:0.9em;
        }
        .bpd-content pre {
          background:#0f172a; color:#e2e8f0; padding:1.5rem;
          border-radius:12px; overflow-x:auto; margin:1.5rem 0;
          font-size:0.88rem; line-height:1.7;
        }
        .bpd-content pre code { background:none; color:inherit; padding:0; }
        /* Media embed */
        .bpd-content iframe, .bpd-content video {
          width:100%; border-radius:12px; margin:1.5rem 0;
          max-height:460px; border:none;
        }
        .bpd-content .embed-wrap {
          position:relative; padding-bottom:56.25%; height:0; overflow:hidden;
          border-radius:12px; margin:1.5rem 0;
        }
        .bpd-content .embed-wrap iframe {
          position:absolute; top:0; left:0; width:100%; height:100%; margin:0; border-radius:0;
        }

        /* Author */
        .bpd-author {
          display:flex; align-items:center; gap:1.2rem;
          padding:1.8rem; background:#f8fafc; border-radius:16px;
          margin-top:3rem; border:1px solid #f1f5f9;
          flex-wrap:wrap;
        }
        .bpd-avatar {
          width:54px; height:54px; border-radius:50%; object-fit:cover;
          border:2px solid #e2e8f0; flex-shrink:0;
        }
        .bpd-avatar-placeholder {
          width:54px; height:54px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,#6366f1,#38bdf8);
          display:flex; align-items:center; justify-content:center;
          color:#fff; font-size:1.3rem; font-weight:800;
          font-family:'Fraunces',serif;
        }
        .bpd-author-name { font-size:1rem; font-weight:800; color:#0f172a; }
        .bpd-author-role { font-size:0.82rem; color:#64748b; margin-top:0.15rem; }

        /* Share */
        .bpd-share-btn {
          display:inline-flex; align-items:center; gap:6px;
          border:1.5px solid #e2e8f0; background:#fff; color:#475569;
          padding:0.5rem 1rem; border-radius:99px; font-size:0.82rem;
          font-weight:700; cursor:pointer; margin-left:auto;
          transition:all 0.2s;
        }
        .bpd-share-btn:hover { border-color:#6366f1; color:#6366f1; }

        /* Sidebar / ToC */
        .bpd-sidebar {
          display:flex; flex-direction:column; gap:1.2rem;
        }
        @media(min-width:900px){
          .bpd-sidebar { position:sticky; top:100px; }
        }
        .bpd-toc-card {
          background:#fff; border:1.5px solid #e2e8f0; border-radius:16px;
          overflow:hidden;
        }
        .bpd-toc-header {
          display:flex; align-items:center; justify-content:space-between;
          padding:1rem 1.2rem; border-bottom:1px solid #f1f5f9;
        }
        .bpd-toc-title {
          font-size:0.78rem; font-weight:800; text-transform:uppercase;
          letter-spacing:0.08em; color:#0f172a;
          display:flex; align-items:center; gap:7px;
        }
        .bpd-toc-body {
          padding:0.8rem;
          max-height:calc(100svh - 260px);
          overflow-y:auto;
        }
        .bpd-toc-item {
          display:block; width:100%; text-align:left; background:none; border:none;
          padding:0.45rem 0.75rem; border-radius:8px; cursor:pointer;
          font-size:0.82rem; font-weight:500; color:#64748b;
          transition:all 0.18s; text-decoration:none;
          line-height:1.5;
        }
        .bpd-toc-item:hover { background:#f1f5f9; color:#0f172a; }
        .bpd-toc-item.active { background:#eef2ff; color:#6366f1; font-weight:700; }
        .bpd-toc-item.level-3 { padding-left:1.4rem; font-size:0.78rem; }
        .bpd-toc-item.level-4 { padding-left:2rem; font-size:0.75rem; }

        /* Mobile ToC toggle */
        .bpd-toc-toggle {
          display:none; position:fixed; bottom:1.5rem; right:1.5rem;
          width:50px; height:50px; border-radius:50%;
          background:#6366f1; color:#fff; border:none; cursor:pointer;
          box-shadow:0 8px 24px rgba(99,102,241,0.35);
          align-items:center; justify-content:center; font-size:1.3rem; z-index:900;
          transition:all 0.2s;
        }
        @media(max-width:899px){
          .bpd-toc-toggle { display:flex; }
          .bpd-sidebar { display:none; }
          .bpd-toc-mobile {
            position:fixed; bottom:0; left:0; right:0; z-index:1000;
            background:#fff; border-top:1.5px solid #e2e8f0;
            border-radius:20px 20px 0 0;
            padding:1.5rem 1.5rem 2rem;
            max-height:60svh; overflow-y:auto;
            box-shadow:0 -8px 32px rgba(15,23,42,0.14);
            transform:translateY(0);
            animation:slideUp 0.3s ease;
          }
          @keyframes slideUp{ from{transform:translateY(100%)} to{transform:translateY(0)} }
        }

        /* Related posts */
        .bpd-related { margin-top:2rem; }
        .bpd-related-title {
          font-size:0.78rem; font-weight:800; text-transform:uppercase;
          letter-spacing:0.08em; color:#94a3b8; margin-bottom:0.9rem;
          padding-bottom:0.5rem; border-bottom:1px solid #f1f5f9;
        }
        .bpd-related-item {
          display:flex; gap:0.9rem; padding:0.9rem 0;
          border-bottom:1px solid #f8fafc; text-decoration:none;
          align-items:flex-start; transition:all 0.18s;
        }
        .bpd-related-item:hover { padding-left:4px; }
        .bpd-related-item:last-child { border-bottom:none; }
        .bpd-related-thumb {
          width:58px; height:58px; border-radius:10px; object-fit:cover;
          flex-shrink:0; border:1px solid #f1f5f9;
        }
        .bpd-related-thumb-ph {
          width:58px; height:58px; border-radius:10px; flex-shrink:0;
          background:#f1f5f9; display:flex; align-items:center; justify-content:center;
        }
        .bpd-related-name {
          font-size:0.82rem; font-weight:700; color:#0f172a; line-height:1.4;
          display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;
        }
        .bpd-related-date { font-size:0.72rem; color:#94a3b8; margin-top:0.25rem; }
      `}</style>

      {/* Reading progress */}
      <div ref={progressRef} className="bpd-progress-bar" />

      <div className="bpd-root" ref={contentRef}>
        <div className="bpd-layout">

          {/* ── LEFT: Article ── */}
          <div>
            {/* Back link */}
            <Link to="/blog" style={{ display:'inline-flex', alignItems:'center', gap:'7px', color:'#64748b', textDecoration:'none', fontWeight:700, fontSize:'0.88rem', marginBottom:'1.4rem', padding:'0.45rem 1rem', borderRadius:'99px', background:'#fff', border:'1.5px solid #e2e8f0', transition:'all 0.2s' }}
              onMouseOver={e => e.currentTarget.style.borderColor='#6366f1'}
              onMouseOut={e => e.currentTarget.style.borderColor='#e2e8f0'}
            >
              <FiArrowLeft size={14} /> Về trang Blog
            </Link>

            <div className="bpd-article">
              {post.coverImage && (
                <img src={post.coverImage} alt={post.title} className="bpd-cover" />
              )}
              <div className="bpd-article-body">
                <div className="bpd-header">
                  <span className="bpd-cat-pill">{post.category || 'Chung'}</span>
                  <h1 className="bpd-title">{post.title}</h1>
                  <div className="bpd-meta">
                    <span className="bpd-meta-item"><FiClock size={13} /> {post.date}</span>
                    <span className="bpd-meta-item"><FiBookOpen size={13} /> {rt} phút đọc</span>
                    <button className="bpd-share-btn" onClick={handleShare}>
                      <FiShare2 size={13} /> Chia sẻ
                    </button>
                  </div>
                  {(post.tags || []).length > 0 && (
                    <div className="bpd-tags">
                      {post.tags.map((t, i) => (
                        <span key={i} className="bpd-tag-pill"><FiTag size={11} /> {t}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rich content */}
                <div
                  id="post-content"
                  className="bpd-content"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />

                {/* Author */}
                <div className="bpd-author">
                  {authorAvatar
                    ? <img src={authorAvatar} alt={authorName} className="bpd-avatar" />
                    : <div className="bpd-avatar-placeholder">{authorName[0]}</div>
                  }
                  <div>
                    <div className="bpd-author-name">{authorName}</div>
                    <div className="bpd-author-role">{authorRole}</div>
                  </div>
                  <button className="bpd-share-btn" onClick={handleShare}>
                    <FiShare2 size={13} /> Chia sẻ bài viết
                  </button>
                </div>

                {/* Back to blog */}
                <div style={{ marginTop:'2.5rem', display:'flex', justifyContent:'center' }}>
                  <Link to="/blog" style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'#0f172a', color:'#fff', padding:'0.85rem 2rem', borderRadius:'12px', textDecoration:'none', fontWeight:700, fontSize:'0.9rem', transition:'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background='#1e293b'}
                    onMouseOut={e => e.currentTarget.style.background='#0f172a'}
                  >
                    <FiArrowLeft size={14} /> Xem thêm bài viết khác
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Sidebar (desktop) ── */}
          <div className="bpd-sidebar">
            {/* ToC */}
            {headings.length > 0 && (
              <div className="bpd-toc-card">
                <div className="bpd-toc-header">
                  <span className="bpd-toc-title"><FiList size={14} /> Mục Lục</span>
                  <span style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600 }}>{headings.length} mục</span>
                </div>
                <div className="bpd-toc-body">
                  {headings.map(h => (
                    <button
                      key={h.id}
                      className={`bpd-toc-item level-${h.level}${activeHeading === h.id ? ' active' : ''}`}
                      onClick={() => scrollTo(h.id)}
                    >
                      {h.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="bpd-toc-card">
                <div className="bpd-toc-header">
                  <span className="bpd-toc-title"><FiArrowRight size={14} /> Bài Liên Quan</span>
                </div>
                <div style={{ padding:'0.5rem 1rem 1rem' }}>
                  {related.map(r => (
                    <Link key={r.id} to={`/blog/${r.slug}`} className="bpd-related-item">
                      {r.coverImage
                        ? <img src={r.coverImage} alt={r.title} className="bpd-related-thumb" />
                        : <div className="bpd-related-thumb-ph"><FiBookOpen size={18} color="#94a3b8" /></div>
                      }
                      <div>
                        <div className="bpd-related-name">{r.title}</div>
                        <div className="bpd-related-date">{r.date}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile ToC toggle ── */}
      {headings.length > 0 && (
        <>
          <button className="bpd-toc-toggle" onClick={() => setTocOpen(v => !v)}>
            {tocOpen ? <FiX /> : <FiList />}
          </button>
          {tocOpen && (
            <>
              <div
                style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', zIndex:999, backdropFilter:'blur(2px)' }}
                onClick={() => setTocOpen(false)}
              />
              <div className="bpd-toc-mobile">
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                  <span style={{ fontSize:'0.82rem', fontWeight:800, color:'#0f172a', textTransform:'uppercase', letterSpacing:'0.06em', display:'flex', alignItems:'center', gap:7 }}>
                    <FiList size={14} /> Mục Lục
                  </span>
                  <button onClick={() => setTocOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:'1.2rem' }}><FiX /></button>
                </div>
                {headings.map(h => (
                  <button
                    key={h.id}
                    className={`bpd-toc-item level-${h.level}${activeHeading === h.id ? ' active' : ''}`}
                    style={{ width:'100%' }}
                    onClick={() => scrollTo(h.id)}
                  >
                    {h.text}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}