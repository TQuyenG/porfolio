import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiChevronLeft, FiChevronRight, FiX, FiStar, FiClock, FiMapPin, FiArrowRight, FiBriefcase, FiTrendingUp, FiUsers, FiZap } from 'react-icons/fi';

/* ─── Animated counter ─── */
function CountUp({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / 50) || 1;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, 30);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

function Home() {
  const [content, setContent] = useState(null);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    (async () => {
      const homeData = await getPageContent('home');
      if (homeData) setContent(homeData);
      const projectsData = await getPageContent('projects');
      if (projectsData?.projects) {
        setPinnedProjects(projectsData.projects.filter(p => p.isPinned && !p.isHidden));
      }
    })();
  }, []);

  const title      = content?.title      || 'Xin Chào! Tôi là Quyen';
  const tagline    = content?.tagline    || 'Business Analyst Intern · Web Developer';
  const intro      = content?.intro      || 'Tôi đam mê phân tích nghiệp vụ hệ thống và xây dựng các giải pháp tối ưu hóa quy trình.';
  const ctas       = content?.ctas       || [{ text: 'Xem Dự Án', href: '/projects', variant: 'primary' }, { text: 'Liên Hệ', href: '/contact', variant: 'secondary' }];
  const gallery    = content?.gallery    || [];
  const avatarUrl  = content?.avatarUrl  || null;
  const bannerUrl  = content?.bannerUrl  || null;
  const location   = content?.location   || 'Ho Chi Minh City, Vietnam';
  const openToWork = content?.openToWork !== false;

  const stats = content?.stats || [
    { icon: 'briefcase', value: 5,  suffix: '+', label: 'Dự Án BA' },
    { icon: 'trending',  value: 2,  suffix: '+', label: 'Năm Kinh Nghiệm' },
    { icon: 'users',     value: 10, suffix: '+', label: 'Stakeholders' },
    { icon: 'zap',       value: 3,  suffix: '',  label: 'Lĩnh Vực Chuyên Môn' },
  ];

  const highlightedSkills = content?.highlightedSkills || [
    'Requirements Elicitation', 'BPMN / UML', 'SQL & Data Analysis',
    'Agile / Scrum', 'Stakeholder Management', 'Figma Wireframing',
  ];

  const iconMap = { briefcase: <FiBriefcase />, trending: <FiTrendingUp />, users: <FiUsers />, zap: <FiZap /> };

  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = ()  => setLightboxIndex(null);
  const nextImage = (e) => { e.stopPropagation(); setLightboxIndex(p => (p + 1) % gallery.length); };
  const prevImage = (e) => { e.stopPropagation(); setLightboxIndex(p => (p === 0 ? gallery.length - 1 : p - 1)); };

  return (
    <section className="page home-page hp-root" style={{ padding: 0, overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .hp-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── CẤU TRÚC HERO CHUẨN (SỬA LỖI VỊ TRÍ & MÀU NỀN) ── */
        .hp-hero {
          position: relative;
          min-height: calc(100svh - 60px);
          display: flex;
          align-items: center; /* Ép nội dung chữ nằm giữa theo chiều dọc */
          padding: 4rem 5%;
          color: #fff;
          margin-top: -60px;
          /* Màu dự phòng: Xám đen chuyên nghiệp (Slate 900), khử hoàn toàn màu tím */
          background-color: #0f172a; 
          background-size: cover;
          background-position: center;
        }
        
        .hp-hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background: radial-gradient(ellipse 70% 60% at 80% 20%, rgba(56,189,248,0.08) 0%, transparent 60%),
                      radial-gradient(ellipse 60% 50% at 10% 80%, rgba(14,165,233,0.05) 0%, transparent 60%);
        }
        .hp-hero-bg::after {
          content:''; position:absolute; inset:0;
          background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .hp-hero-inner {
          position: relative; z-index: 2; 
          width: 100%; max-width: 1200px; margin: 0 auto;
          display: flex;
          animation: hp-fadeUp 0.9s ease both;
        }
        @keyframes hp-fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }

        .hp-hero-text {
          width: 100%;
          padding-top: 40px; /* Đẩy nhẹ xuống để không dính Navbar */
        }

        .hp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
          color: #e2e8f0; padding: 0.45rem 1.1rem; border-radius: 99px;
          font-size: clamp(0.75rem,2vw,0.88rem); font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 2rem;
          backdrop-filter: blur(4px);
        }
        .hp-badge-dot { width: 8px; height: 8px; background: #4ade80; border-radius: 50%; box-shadow: 0 0 8px #4ade80; animation: hp-pulse 2s infinite; }
        @keyframes hp-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        .hp-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.4rem, 7vw, 5.5rem);
          font-weight: 900; line-height: 1.08; letter-spacing: -0.02em;
          margin-bottom: 1.4rem;
        }
        .hp-hero h1 em { font-style: italic; color: #38bdf8; }

        .hp-hero-tagline {
          font-size: clamp(0.95rem,2.2vw,1.2rem); font-weight: 500;
          color: #94a3b8; margin-bottom: 1.6rem;
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }
        .hp-hero-tagline span { color: #64748b; }

        .hp-hero-intro {
          font-size: clamp(0.95rem,2vw,1.1rem); color: #cbd5e1;
          line-height: 1.85; max-width: 600px; margin-bottom: 2.8rem;
        }

        .hp-cta-row { display: flex; gap: 1rem; flex-wrap: wrap; }
        .hp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg,#2563eb,#38bdf8);
          color: #fff; padding: 0.85rem 2.2rem; border-radius: 12px;
          font-weight: 700; font-size: clamp(0.9rem,2vw,1rem);
          text-decoration: none; transition: all 0.25s; border: none; cursor: pointer;
        }
        .hp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(37,99,235,0.4); color:#fff; }
        .hp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #e2e8f0;
          border: 1.5px solid rgba(255,255,255,0.2);
          padding: 0.85rem 2.2rem; border-radius: 12px;
          font-weight: 600; font-size: clamp(0.9rem,2vw,1rem);
          text-decoration: none; transition: all 0.25s;
        }
        .hp-btn-outline:hover { border-color: #38bdf8; color: #38bdf8; }

        .hp-avatar-wrap {
          display: none;
        }

        /* KHỐI ẢNH CHÂN DUNG OUT-OF-BOUND (CHỈ HIỆN TRÊN DESKTOP) */
        @media (min-width: 900px) {
          .hp-hero-text {
            max-width: 55%; /* Ép chữ nằm gọn bên trái */
          }
          .hp-avatar-wrap {
            display: block;
            position: absolute;
            bottom: 0;         /* KHÓA CHẶT ẢNH DÍNH VÀO ĐƯỜNG BIÊN DƯỚI */
            right: 5%;         /* Căn lề phải 5% */
            height: 85%;       /* Thu nhỏ ảnh lại theo yêu cầu (chiếm 85% chiều cao) */
            max-width: 40%;    /* Giới hạn độ rộng để không đè lên chữ */
            z-index: 1;        
            pointer-events: none;
            animation: hp-fadeUp 1.1s 0.2s ease both;
          }
          .hp-avatar-wrap img {
            width: 100%;
            height: 100%;
            object-fit: contain;
            object-position: bottom right; /* Bắt buộc ảnh luôn rớt sát xuống đáy */
            filter: drop-shadow(-15px 15px 25px rgba(0,0,0,0.5));
          }
        }

        .hp-location {
          display: inline-flex; align-items: center; gap: 6px;
          color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;
        }

        /* ── STATS BAR ── */
        .hp-stats-bar {
          background: #fff; border-top: 1px solid #e2e8f0;
          padding: clamp(2rem,4vw,3rem) clamp(1rem,5vw,4rem);
        }
        .hp-stats-grid {
          max-width: 900px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }
        @media (min-width: 640px) { .hp-stats-grid { grid-template-columns: repeat(4,1fr); } }
        .hp-stat-card {
          text-align: center; padding: 1.5rem 1rem;
          border: 1px solid #f1f5f9; border-radius: 16px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .hp-stat-card:hover { box-shadow: 0 8px 24px rgba(37,99,235,0.08); transform: translateY(-3px); }
        .hp-stat-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #eff6ff; display: flex; align-items: center; justify-content: center;
          color: #2563eb; font-size: 1.2rem; margin: 0 auto 0.9rem;
        }
        .hp-stat-num {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem,5vw,2.6rem); font-weight: 900; color: #0f172a; line-height: 1;
        }
        .hp-stat-label { font-size: 0.78rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.4rem; }

        /* ── SKILLS STRIP ── */
        .hp-skills-strip {
          background: #f8fafc; padding: clamp(2rem,4vw,3rem) clamp(1rem,5vw,4rem);
          border-top: 1px solid #e2e8f0;
        }
        .hp-skills-inner { max-width: 1000px; margin: 0 auto; }
        .hp-skills-title { font-size: clamp(1.1rem,2.5vw,1.4rem); font-weight: 800; color: #0f172a; margin-bottom: 1.2rem; }
        .hp-skills-tags { display: flex; flex-wrap: wrap; gap: 0.6rem; }
        .hp-skill-tag {
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #475569; padding: 0.5rem 1.1rem; border-radius: 99px;
          font-size: clamp(0.78rem,1.8vw,0.88rem); font-weight: 600;
          transition: all 0.2s;
        }
        .hp-skill-tag:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

        /* ── PINNED PROJECTS ── */
        .hp-projects { padding: clamp(3rem,6vw,5rem) clamp(1rem,5vw,4rem); background: #fff; }
        .hp-projects-inner { max-width: 1100px; margin: 0 auto; }
        .hp-section-label {
          display: inline-flex; align-items: center; gap: 8px;
          background: #fef3c7; color: #b45309;
          padding: 0.35rem 1rem; border-radius: 99px;
          font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
          margin-bottom: 1rem;
        }
        .hp-section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.6rem,4vw,2.8rem); font-weight: 900; color: #0f172a;
          margin-bottom: clamp(1.5rem,4vw,3rem);
        }
        .hp-proj-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 640px) { .hp-proj-grid { grid-template-columns: repeat(auto-fill,minmax(320px,1fr)); } }
        .hp-proj-card {
          border: 1.5px solid #f1f5f9; border-radius: 20px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
          background: #fff;
        }
        .hp-proj-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(15,23,42,0.08); border-color: #dbeafe; }
        .hp-proj-accent { height: 4px; background: linear-gradient(90deg,#2563eb,#38bdf8); }
        .hp-proj-body { padding: clamp(1.2rem,3vw,1.8rem); flex:1; display:flex; flex-direction:column; }
        .hp-proj-pin-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fef3c7; color: #b45309;
          font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 99px;
          margin-bottom: 1rem; width: fit-content;
        }
        .hp-proj-title { font-size: clamp(1rem,2.5vw,1.25rem); font-weight: 800; color: #0f172a; margin-bottom: 0.5rem; }
        .hp-proj-duration { font-size: 0.82rem; color: #94a3b8; display: flex; align-items: center; gap: 5px; margin-bottom: 0.9rem; }
        .hp-proj-desc { color: #475569; font-size: clamp(0.85rem,2vw,0.95rem); line-height: 1.7; flex:1; margin-bottom: 1.2rem; }
        .hp-proj-techs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.4rem; }
        .hp-proj-tech { background: #eff6ff; color: #1d4ed8; font-size: 0.75rem; font-weight: 700; padding: 0.3rem 0.8rem; border-radius: 8px; }
        .hp-proj-link {
          display: inline-flex; align-items: center; gap: 6px;
          background: #0f172a; color: #fff;
          padding: 0.7rem 1.4rem; border-radius: 10px; font-weight: 700;
          font-size: 0.88rem; text-decoration: none; transition: background 0.2s;
          align-self: flex-start;
        }
        .hp-proj-link:hover { background: #1e293b; }
        .hp-all-projects-wrap { text-align: center; margin-top: clamp(2rem,4vw,3rem); }
        .hp-btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          border: 2px solid #e2e8f0; border-radius: 12px;
          padding: 0.85rem 2.2rem; font-weight: 700;
          color: #475569; text-decoration: none; transition: all 0.2s;
          font-size: clamp(0.88rem,2vw,1rem);
        }
        .hp-btn-ghost:hover { border-color: #2563eb; color: #2563eb; }

        /* ── GALLERY ── */
        .hp-gallery { padding: clamp(3rem,5vw,4rem) 0; background: #f8fafc; border-top: 1px solid #e2e8f0; overflow: hidden; }
        .hp-gallery-header { text-align: center; padding: 0 1rem; margin-bottom: clamp(1.5rem,3vw,2rem); }
        .hp-gallery-header h2 { font-family:'Fraunces',serif; font-size:clamp(1.4rem,3.5vw,2.2rem); font-weight:900; color:#0f172a; margin-bottom:0.3rem; }
        .hp-gallery-header p { color:#94a3b8; font-size:clamp(0.83rem,1.8vw,0.95rem); }

        .hp-marquee { overflow: hidden; white-space: nowrap; width: 100%; padding: 0.5rem 0 1.5rem; }
        .hp-marquee-track { display: inline-flex; gap: 1.2rem; animation: hp-scroll 35s linear infinite; }
        .hp-marquee-track:hover { animation-play-state: paused; }
        @keyframes hp-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(calc(-50% - 0.6rem))} }
        .hp-gallery-thumb {
          flex: 0 0 auto; width: clamp(200px,40vw,300px); height: clamp(130px,25vw,200px);
          border-radius: 14px; overflow: hidden; cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
          border: 2px solid transparent;
        }
        .hp-gallery-thumb:hover { transform: scale(1.08) translateY(-10px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); border-color: #2563eb; }
        .hp-gallery-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

        /* ── LIGHTBOX ── */
        .hp-lightbox { position: fixed; inset: 0; background: rgba(2,6,23,0.95); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .hp-lb-close { position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 44px; height: 44px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .hp-lb-close:hover { background: rgba(239,68,68,0.6); }
        .hp-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: #fff; width: 48px; height: 48px; border-radius: 50%; font-size: 1.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .hp-lb-nav:hover { background: rgba(255,255,255,0.25); }
        .hp-lb-prev { left: 16px; } .hp-lb-next { right: 16px; }
        .hp-lb-img { max-width: min(90vw,900px); max-height: 85svh; border-radius: 12px; object-fit: contain; animation: hp-zoomIn 0.25s ease; }
        @keyframes hp-zoomIn { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }
      `}</style>

      {/* ── HERO ── */}
      <div className="hp-hero" style={{
        backgroundImage: bannerUrl ? `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${bannerUrl})` : 'none'
      }}>
        <div className="hp-hero-bg" />
        
        <div className="hp-hero-inner">
          <div className="hp-hero-text">
            {openToWork && (
              <div className="hp-badge">
                <span className="hp-badge-dot" />
                Đang tìm kiếm cơ hội mới
              </div>
            )}
            <h1>
              {title.includes('Quyen') ? (
                <>Xin Chào! Tôi là <em>Quyen</em></>
              ) : (
                title
              )}
            </h1>
            <div className="hp-hero-tagline">
              {tagline.split('·').map((t, i, arr) => (
                <React.Fragment key={i}>{t.trim()}{i < arr.length - 1 && <span>·</span>}</React.Fragment>
              ))}
            </div>
            {location && (
              <div className="hp-location"><FiMapPin size={14} /> {location}</div>
            )}
            <div className="hp-hero-intro" dangerouslySetInnerHTML={{ __html: intro }} />
            <div className="hp-cta-row">
              {ctas.map((c, i) => (
                c.variant === 'primary'
                  ? <a key={i} href={c.href} className="hp-btn-primary">{c.text} <FiArrowRight /></a>
                  : <a key={i} href={c.href} className="hp-btn-outline">{c.text}</a>
              ))}
            </div>
          </div>
        </div>

        {/* Khối Avatar: Khóa chặt vào đáy của hp-hero */}
        <div className="hp-avatar-wrap">
          {avatarUrl && <img src={avatarUrl} alt="Portrait" />}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="hp-stats-bar">
        <div className="hp-stats-grid">
          {stats.map((s, i) => (
            <div className="hp-stat-card" key={i}>
              <div className="hp-stat-icon">{iconMap[s.icon] || <FiZap />}</div>
              <div className="hp-stat-num"><CountUp target={s.value} suffix={s.suffix} /></div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SKILLS STRIP ── */}
      {highlightedSkills.length > 0 && (
        <div className="hp-skills-strip">
          <div className="hp-skills-inner">
            <div className="hp-skills-title">Chuyên Môn Nổi Bật</div>
            <div className="hp-skills-tags">
              {highlightedSkills.map((s, i) => (
                <span key={i} className="hp-skill-tag">{s}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PINNED PROJECTS ── */}
      {pinnedProjects.length > 0 && (
        <div className="hp-projects">
          <div className="hp-projects-inner">
            <div className="hp-section-label"><FiStar size={12} /> Dự Án Nổi Bật</div>
            <div className="hp-section-title">Những Gì Tôi Đã Làm</div>
            <div className="hp-proj-grid">
              {pinnedProjects.map((project) => (
                <div className="hp-proj-card" key={project.id}>
                  <div className="hp-proj-accent" />
                  <div className="hp-proj-body">
                    <div className="hp-proj-pin-badge"><FiStar size={10} /> Được ghim</div>
                    <div className="hp-proj-title">{project.title}</div>
                    {project.duration && (
                      <div className="hp-proj-duration"><FiClock size={12} /> {project.duration}</div>
                    )}
                    <div className="hp-proj-desc" dangerouslySetInnerHTML={{ __html: project.description }} />
                    {(project.technologies || []).length > 0 && (
                      <div className="hp-proj-techs">
                        {project.technologies.map((t, idx) => <span key={idx} className="hp-proj-tech">{t}</span>)}
                      </div>
                    )}
                    <Link to={`/projects/${project.slug}`} className="hp-proj-link">
                      Xem chi tiết <FiArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="hp-all-projects-wrap">
              <Link to="/projects" className="hp-btn-ghost">
                Toàn bộ dự án <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── GALLERY ── */}
      {gallery.length > 0 && (
        <div className="hp-gallery">
          <div className="hp-gallery-header">
            <h2>Thư Viện Hình Ảnh</h2>
            <p>Nhấp vào ảnh để xem kích thước đầy đủ</p>
          </div>
          <div className="hp-marquee">
            <div className="hp-marquee-track">
              {[...gallery, ...gallery, ...gallery, ...gallery].map((imgUrl, idx) => {
                const realIndex = idx % gallery.length;
                return (
                  <div key={idx} className="hp-gallery-thumb" onClick={() => openLightbox(realIndex)}>
                    <img src={imgUrl} alt={`Ảnh ${realIndex + 1}`} loading="lazy" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX ── */}
      {lightboxIndex !== null && (
        <div className="hp-lightbox" onClick={closeLightbox}>
          <button className="hp-lb-close" onClick={closeLightbox}><FiX /></button>
          <button className="hp-lb-nav hp-lb-prev" onClick={prevImage}><FiChevronLeft /></button>
          <img src={gallery[lightboxIndex]} alt="Phóng to" className="hp-lb-img" onClick={e => e.stopPropagation()} />
          <button className="hp-lb-nav hp-lb-next" onClick={nextImage}><FiChevronRight /></button>
        </div>
      )}
    </section>
  );
}

export default Home;