import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import {
  FiAward, FiBriefcase, FiBookOpen, FiExternalLink,
  FiMapPin, FiArrowRight, FiZap, FiTarget, FiStar,
  FiCheckCircle, FiClock, FiTrendingUp, FiUsers,
  FiActivity, FiMonitor, FiSmartphone, FiGlobe,
  FiDatabase, FiCloud, FiHeart, FiSmile, FiMessageCircle,
  FiThumbsUp, FiCoffee, FiTool, FiShield,
  FiCode, FiLayers, FiEdit3, FiFileText, FiSearch,
  FiBarChart2, FiPieChart, FiSend, FiMail, FiGithub,
  FiLinkedin, FiFolderPlus, FiBookmark,
} from 'react-icons/fi';
import PageHero from '../components/PageHero';

/* ─── Icon map ─── */
const ICON_MAP = {
  briefcase: FiBriefcase, trending: FiTrendingUp, users: FiUsers, zap: FiZap,
  target: FiTarget, award: FiAward, clock: FiClock, activity: FiActivity,
  monitor: FiMonitor, smartphone: FiSmartphone, globe: FiGlobe,
  database: FiDatabase, cloud: FiCloud, heart: FiHeart, smile: FiSmile,
  message: FiMessageCircle, thumbsup: FiThumbsUp, check: FiCheckCircle,
  star: FiStar, coffee: FiCoffee, tool: FiTool, shield: FiShield,
  code: FiCode, layers: FiLayers, edit: FiEdit3, file: FiFileText,
  search: FiSearch, barchart: FiBarChart2, piechart: FiPieChart,
  book: FiBookOpen, send: FiSend, mappin: FiMapPin,
  mail: FiMail, linkedin: FiLinkedin, github: FiGithub,
  folder: FiFolderPlus, bookmark: FiBookmark,
};
function DynIcon({ name, size = 18, color, style }) {
  const C = ICON_MAP[name] || FiZap;
  return <C size={size} color={color} style={style} />;
}

/* ─── Scroll reveal ─── */
function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll('.reveal-section').forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ─── Section wrapper with fade-up ─── */
function Section({ id, children, style }) {
  return (
    <section id={id} className="reveal-section" style={{ scrollMarginTop: 100, ...style }}>
      {children}
    </section>
  );
}

/* ─── Eyebrow label ─── */
function Eyebrow({ icon, text, color = '#6366f1', bg = '#eef2ff' }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      background: bg, color, padding: '0.3rem 0.9rem', borderRadius: 99,
      fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
      letterSpacing: '0.08em', marginBottom: '0.9rem',
    }}>
      <DynIcon name={icon} size={11} color={color} />
      {text}
    </div>
  );
}

/* ─── Section heading ─── */
function Heading({ children, sub }) {
  return (
    <div style={{ marginBottom: 'clamp(1.4rem,3vw,2.2rem)' }}>
      <h2 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 'clamp(1.5rem,3.5vw,2.4rem)',
        fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.15,
      }}>{children}</h2>
      {sub && <p style={{ color: '#64748b', fontSize: 'clamp(0.85rem,1.8vw,1rem)', marginTop: '0.5rem', lineHeight: 1.6 }}>{sub}</p>}
    </div>
  );
}

export default function About() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await getPageContent('about');
      if (data) {
        if (data.achievements) {
          data.achievements.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
        }
        setContent(data);
      }
    })();
  }, []);

  useReveal([content]);

  const pageTitle   = content?.pageTitle  || 'Hành Trình Chuyên Môn';
  const subtitle    = content?.subtitle   || 'Nền tảng, định hướng và triết lý làm việc';
  const intro       = content?.intro      || { title: 'Về Tôi', body: '' };
  const coverUrl    = content?.coverUrl   || '';
  const portraitUrl = content?.portraitUrl || '';
  const timeline    = content?.timeline   || [];
  const skills      = content?.skills     || [];
  const achievements= content?.achievements || [];
  const education   = content?.education  || [];
  const values      = content?.values     || [];
  const goals       = content?.goals      || [];   /* section mới */

  /* Split skills: tools vs soft */
  const toolGroups  = skills.filter(s => !s.isSoft);
  const softGroups  = skills.filter(s => s.isSoft);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .ab-root { font-family:'Plus Jakarta Sans',sans-serif; }

        /* ── wrapper ── */
        .ab-wrap {
          max-width: 1120px; margin: 0 auto;
          padding: 0 clamp(1rem,4vw,2rem);
          display: flex; flex-direction: column;
          gap: clamp(3.5rem,7vw,6rem);
          padding-bottom: clamp(3rem,6vw,6rem);
        }

        /* ── Section divider ── */
        .ab-divider {
          width: 48px; height: 3px;
          background: linear-gradient(90deg,#6366f1,#38bdf8);
          border-radius: 99px; margin-bottom: 1.5rem;
        }

        /* ── Intro split ── */
        .ab-intro-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(2rem,5vw,4rem);
          align-items: center;
        }
        @media(min-width:760px){
          .ab-intro-grid { grid-template-columns: 1fr 380px; }
        }
        .ab-portrait {
          width:100%; border-radius:20px;
          border:1px solid #e2e8f0;
          box-shadow: 0 20px 48px rgba(15,23,42,0.08);
          object-fit:cover; max-height:480px;
          display:block;
        }
        .ab-portrait-wrap { position:relative; }
        .ab-portrait-badge {
          position:absolute; bottom:-16px; left:50%; transform:translateX(-50%);
          background:#fff; border:1px solid #e2e8f0; border-radius:99px;
          padding:0.5rem 1.2rem; font-size:0.78rem; font-weight:700;
          color:#6366f1; white-space:nowrap;
          box-shadow:0 4px 16px rgba(99,102,241,0.12);
          display:flex; align-items:center; gap:6px;
        }

        /* ── Values ── */
        .ab-values-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));
          gap:1rem;
        }
        .ab-value-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:16px;
          padding:clamp(1.1rem,2.5vw,1.5rem);
          display:flex; flex-direction:column; gap:0.75rem;
          transition: all 0.25s;
        }
        .ab-value-card:hover {
          border-color:#c7d2fe; transform:translateY(-4px);
          box-shadow:0 14px 36px rgba(99,102,241,0.09);
        }
        .ab-value-icon {
          width:40px; height:40px; border-radius:11px;
          display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .ab-value-title { font-size:clamp(0.9rem,2vw,1rem); font-weight:800; color:#0f172a; }
        .ab-value-desc  { font-size:clamp(0.78rem,1.6vw,0.86rem); color:#64748b; line-height:1.65; }

        /* ── Skills / Toolkit ── */
        .ab-toolkit-outer { display:flex; flex-direction:column; gap:1.2rem; }
        .ab-toolkit-group {
          border:1px solid #e2e8f0; border-radius:16px;
          overflow:hidden; background:#fff;
        }
        .ab-toolkit-header {
          display:flex; align-items:center; gap:10px;
          padding:1rem clamp(1rem,2.5vw,1.4rem);
          border-bottom:1px solid #f1f5f9;
        }
        .ab-toolkit-badge {
          font-size:0.7rem; font-weight:800; text-transform:uppercase;
          letter-spacing:0.08em; color:#fff;
          padding:0.25rem 0.75rem; border-radius:6px;
          display:flex; align-items:center; gap:5px;
        }
        .ab-toolkit-body { padding:1rem clamp(1rem,2.5vw,1.4rem); }
        .ab-tags { display:flex; flex-wrap:wrap; gap:0.5rem; }
        .ab-tag {
          background:#f8fafc; border:1.5px solid #e2e8f0;
          color:#334155; padding:0.38rem 0.85rem; border-radius:99px;
          font-size:clamp(0.75rem,1.5vw,0.82rem); font-weight:600;
          transition:all 0.2s;
        }
        .ab-tag:hover { border-color:#6366f1; color:#4338ca; background:#eef2ff; }

        /* ── Timeline ── */
        .ab-timeline { display:flex; flex-direction:column; }
        .ab-tl-item {
          display:grid;
          grid-template-columns:1fr;
          gap:0;
          padding-left:1.8rem;
          position:relative;
          padding-bottom:2.5rem;
        }
        @media(min-width:640px){
          .ab-tl-item {
            grid-template-columns:140px 1fr;
            padding-left:0;
            gap:1.5rem;
          }
        }
        .ab-tl-item::before {
          content:'';
          position:absolute;
          left:0;
          top:10px; bottom:0;
          width:2px;
          background:linear-gradient(180deg,#6366f1 0%,#e2e8f0 100%);
        }
        @media(min-width:640px){
          .ab-tl-item::before { left:139px; }
        }
        .ab-tl-item:last-child::before { display:none; }
        .ab-tl-dot {
          position:absolute;
          left:-5px; top:7px;
          width:12px; height:12px; border-radius:50%;
          background:#6366f1; border:3px solid #eef2ff;
          box-shadow:0 0 0 3px rgba(99,102,241,0.15);
        }
        @media(min-width:640px){ .ab-tl-dot { left:134px; } }
        .ab-tl-year {
          font-size:0.78rem; font-weight:800; color:#6366f1;
          background:#eef2ff; padding:0.25rem 0.7rem; border-radius:6px;
          width:fit-content; margin-bottom:0.5rem;
        }
        @media(min-width:640px){ .ab-tl-year { margin-bottom:0; margin-top:4px; text-align:right; } }
        .ab-tl-card {
          background:#fff; border:1px solid #f1f5f9; border-radius:14px;
          padding:clamp(1rem,2.5vw,1.4rem);
          margin-bottom:0;
        }
        .ab-tl-title { font-size:clamp(0.95rem,2vw,1.05rem); font-weight:800; color:#0f172a; margin-bottom:0.25rem; }
        .ab-tl-company { font-size:0.82rem; color:#6366f1; font-weight:700; margin-bottom:0.75rem; font-style:italic; }
        .ab-tl-desc { font-size:clamp(0.82rem,1.7vw,0.9rem); color:#475569; line-height:1.75; }

        /* ── Achievements ── */
        .ab-ach-grid {
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));
          gap:1.2rem;
        }
        .ab-ach-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:16px;
          padding:clamp(1.1rem,2.5vw,1.5rem);
          display:flex; gap:1rem; align-items:flex-start;
          transition:all 0.25s;
        }
        .ab-ach-card:hover { border-color:#c7d2fe; transform:translateY(-3px); box-shadow:0 10px 28px rgba(99,102,241,0.09); }
        .ab-ach-logo {
          width:52px; height:52px; border-radius:12px;
          background:#f1f5f9; object-fit:contain; flex-shrink:0;
          border:1px solid #e2e8f0;
        }
        .ab-ach-logo-placeholder {
          width:52px; height:52px; border-radius:12px;
          background:#eef2ff; display:flex; align-items:center; justify-content:center;
          flex-shrink:0;
        }
        .ab-ach-name { font-size:clamp(0.88rem,2vw,0.96rem); font-weight:800; color:#0f172a; margin-bottom:0.2rem; }
        .ab-ach-date { font-size:0.78rem; color:#94a3b8; font-weight:600; margin-bottom:0.6rem; }
        .ab-ach-link {
          display:inline-flex; align-items:center; gap:5px;
          font-size:0.78rem; color:#6366f1; font-weight:700; text-decoration:none;
          background:#eef2ff; padding:0.3rem 0.8rem; border-radius:8px;
        }
        .ab-ach-link:hover { background:#e0e7ff; }

        /* ── Education ── */
        .ab-edu-list { display:flex; flex-direction:column; gap:0.9rem; }
        .ab-edu-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:14px;
          padding:clamp(1rem,2.5vw,1.3rem) clamp(1.1rem,2.5vw,1.6rem);
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:0.75rem;
          transition:border-color 0.2s;
        }
        .ab-edu-card:hover { border-color:#c7d2fe; }
        .ab-edu-major { font-size:clamp(0.92rem,2vw,1rem); font-weight:800; color:#0f172a; }
        .ab-edu-school { font-size:0.82rem; color:#6366f1; font-weight:700; margin-top:0.15rem; }
        .ab-edu-date {
          font-size:0.78rem; font-weight:700; color:#6366f1;
          background:#eef2ff; padding:0.25rem 0.75rem; border-radius:8px;
          white-space:nowrap;
        }

        /* ── Goals — zigzag ── */
        .ab-goals-zz {
          display: flex;
          flex-direction: column;
          gap: clamp(3rem,6vw,5rem);
        }
        .ab-goal-zz {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(1.5rem,4vw,3rem);
          align-items: center;
        }
        @media(min-width:700px){
          .ab-goal-zz { grid-template-columns: 1fr 1fr; }
          .ab-goal-zz.reverse { direction: rtl; }
          .ab-goal-zz.reverse > * { direction: ltr; }
        }
        .ab-goal-zz-text {
          display: flex; flex-direction: column; gap: 1rem;
        }
        .ab-goal-zz-type {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 0.3rem 0.9rem; border-radius: 99px;
          font-size: 0.72rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.08em; width: fit-content;
          background: linear-gradient(135deg,#fef3c7,#fde68a);
          color: #92400e;
        }
        .ab-goal-zz-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.15rem,2.8vw,1.5rem);
          font-weight: 900; color: #0f172a; line-height: 1.2;
        }
        .ab-goal-zz-desc {
          font-size: clamp(0.85rem,1.8vw,0.95rem);
          color: #475569; line-height: 1.8;
        }
        .ab-goal-zz-imgs {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(100%,180px), 1fr));
          gap: 0.75rem;
        }
        .ab-goal-zz-img {
          width: 100%; aspect-ratio: 4/3;
          object-fit: cover; border-radius: 14px;
          box-shadow: 0 8px 24px rgba(15,23,42,0.1);
          transition: transform 0.3s;
        }
        .ab-goal-zz-img:hover { transform: scale(1.03); }
        .ab-goal-zz-placeholder {
          width: 100%; aspect-ratio: 4/3;
          border-radius: 14px;
          background: linear-gradient(135deg,#fef3c7,#fde68a);
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Timeline images ── */
        .ab-tl-images {
          display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.875rem;
        }
        .ab-tl-img {
          width: 90px; height: 68px; object-fit: cover;
          border-radius: 8px; border: 1px solid #e2e8f0;
          cursor: zoom-in; transition: transform 0.2s;
        }
        .ab-tl-img:hover { transform: scale(1.04); }

        /* ── CTA band ── */
        .ab-cta-band {
          background:linear-gradient(135deg,#1e1b4b 0%,#312e81 100%);
          border-radius:20px; padding:clamp(2rem,5vw,3rem);
          display:flex; justify-content:space-between; align-items:center;
          flex-wrap:wrap; gap:1.5rem;
        }
        .ab-cta-band h3 {
          font-family:'Fraunces',serif;
          font-size:clamp(1.3rem,3vw,1.9rem); font-weight:900; color:#fff; margin:0 0 0.4rem 0;
        }
        .ab-cta-band p { color:#a5b4fc; margin:0; font-size:clamp(0.85rem,1.8vw,0.95rem); }
        .ab-cta-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:linear-gradient(135deg,#6366f1,#38bdf8);
          color:#fff; padding:0.85rem 2rem; border-radius:12px;
          font-weight:700; text-decoration:none; white-space:nowrap;
          font-size:clamp(0.85rem,1.8vw,0.95rem); transition:all 0.2s;
        }
        .ab-cta-btn:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,0.4); }
      `}</style>

      <div className="page about-page ab-root">
        <PageHero title={pageTitle} subtitle={subtitle} bgImage={coverUrl} />

        <div className="ab-wrap">

          {/* ══ 1. INTRO ══ */}
          <Section id="intro">
            <Eyebrow icon="smile" text="Về Tôi" />
            <div className="ab-intro-grid">
              <div>
                <div className="ab-divider" />
                <Heading>{intro.title || 'Về Tôi'}</Heading>
                <div
                  style={{ fontSize:'clamp(0.9rem,1.9vw,1.05rem)', color:'#475569', lineHeight:1.85 }}
                  dangerouslySetInnerHTML={{ __html: intro.body }}
                />
                {values.length > 0 && (
                  <div style={{ marginTop:'2rem' }}>
                    <p style={{ fontSize:'0.78rem', fontWeight:800, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1rem' }}>Triết Lý & Giá Trị Cốt Lõi</p>
                    <div className="ab-values-grid" style={{ gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,190px),1fr))', gap:'0.75rem' }}>
                      {values.map((v, i) => {
                        const bg = v.color || '#eef2ff';
                        const iconColor = v.iconColor || '#6366f1';
                        return (
                          <div key={i} className="ab-value-card" style={{ padding:'1rem', gap:'0.5rem' }}>
                            <div className="ab-value-icon" style={{ background: bg, width:34, height:34, borderRadius:9 }}>
                              <DynIcon name={v.icon || 'star'} size={15} color={iconColor} />
                            </div>
                            <div className="ab-value-title" style={{ fontSize:'0.88rem' }}>{v.title}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              {portraitUrl && (
                <div className="ab-portrait-wrap">
                  <img src={portraitUrl} alt="Portrait" className="ab-portrait" />
                  <div className="ab-portrait-badge">
                    <DynIcon name="mappin" size={12} color="#6366f1" />
                    Ho Chi Minh City, Vietnam
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* ══ 2. GOALS & VISION — zigzag, TRƯỚC Skills ══ */}
          {goals.length > 0 && (
            <Section id="goals">
              <Eyebrow icon="target" text="Định Hướng" color="#0e7490" bg="#cffafe" />
              <div className="ab-divider" style={{ background: 'linear-gradient(90deg,#0891b2,#f59e0b)' }} />
              <Heading sub="Mục tiêu ngắn hạn, dài hạn và định hướng phát triển sự nghiệp.">
                Mục Tiêu & Định Hướng
              </Heading>
              <div className="ab-goals-zz">
                {goals.map((g, i) => {
                  const imgs = g.images && g.images.length > 0 ? g.images : (g.image ? [g.image] : []);
                  return (
                    <div key={i} className={`ab-goal-zz${i % 2 === 1 ? ' reverse' : ''}`}>
                      {/* Text side */}
                      <div className="ab-goal-zz-text">
                        <div className="ab-goal-zz-type">
                          <DynIcon name={g.icon || 'target'} size={11} color="#92400e" />
                          {g.type || 'Mục tiêu'}
                        </div>
                        <div className="ab-goal-zz-title">{g.title}</div>
                        <div className="ab-goal-zz-desc">{g.desc}</div>
                      </div>
                      {/* Image side */}
                      <div className="ab-goal-zz-imgs">
                        {imgs.length > 0
                          ? imgs.map((src, ii) => (
                              <img key={ii} src={src} alt={g.title} className="ab-goal-zz-img" />
                            ))
                          : (
                            <div className="ab-goal-zz-placeholder">
                              <DynIcon name={g.icon || 'target'} size={48} color="rgba(146,64,14,0.2)" />
                            </div>
                          )
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ══ 3. SKILLS & TOOLKIT ══ */}
          {skills.length > 0 && (
            <Section id="toolkit">
              <Eyebrow icon="tool" text="Chuyên Môn" color="#0891b2" bg="#e0f2fe" />
              <div className="ab-divider" style={{ background:'linear-gradient(90deg,#0891b2,#6366f1)' }} />
              <Heading sub="Bộ công cụ và năng lực phân tích nghiệp vụ được xây dựng qua thực tiễn dự án.">
                Skills & BA Toolkit
              </Heading>
              <div className="ab-toolkit-outer">
                {skills.map((group, gi) => {
                  const items = Array.isArray(group.items)
                    ? group.items
                    : (group.items || '').split(',').map(s => s.trim()).filter(Boolean);
                  const badgeBg = group.badgeColor || '#6366f1';
                  return (
                    <div key={gi} className="ab-toolkit-group">
                      <div className="ab-toolkit-header">
                        <span className="ab-toolkit-badge" style={{ background: badgeBg }}>
                          <DynIcon name={group.icon || 'tool'} size={11} color="#fff" />
                          {group.title}
                        </span>
                        <span style={{ fontSize:'0.78rem', color:'#94a3b8', fontWeight:600 }}>
                          {items.length} kỹ năng
                        </span>
                      </div>
                      <div className="ab-toolkit-body">
                        <div className="ab-tags">
                          {items.map((item, ii) => (
                            <span key={ii} className="ab-tag">{item}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* ══ 4. TIMELINE (Kinh nghiệm) ══ */}
          {timeline.length > 0 && (
            <Section id="experience">
              <Eyebrow icon="briefcase" text="Kinh Nghiệm" color="#0f766e" bg="#ccfbf1" />
              <div className="ab-divider" style={{ background:'linear-gradient(90deg,#0f766e,#6366f1)' }} />
              <Heading sub="Hành trình xây dựng năng lực qua các dự án thực tiễn.">
                Hành Trình Chuyên Môn
              </Heading>
              <div className="ab-timeline">
                {timeline.map((item, i) => (
                  <div key={i} className="ab-tl-item">
                    <div className="ab-tl-dot" />
                    <div>
                      <div className="ab-tl-year">{item.year}</div>
                    </div>
                    <div className="ab-tl-card">
                      <div className="ab-tl-title">{item.title}</div>
                      {item.company && <div className="ab-tl-company">{item.company}</div>}
                      {(item.desc || item.description) && (
                        <div className="ab-tl-desc" dangerouslySetInnerHTML={{ __html: item.desc || item.description }} />
                      )}
                      {/* Ảnh minh họa */}
                      {(item.images && item.images.length > 0) && (
                        <div className="ab-tl-images">
                          {item.images.map((src, ii) => (
                            <img key={ii} src={src} alt="" className="ab-tl-img" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
          {achievements.length > 0 && (
            <Section id="achievements">
              <Eyebrow icon="award" text="Chứng Chỉ & Thành Tựu" color="#b45309" bg="#fef3c7" />
              <div className="ab-divider" style={{ background:'linear-gradient(90deg,#d97706,#6366f1)' }} />
              <Heading sub="Các chứng chỉ và giải thưởng đã được xác nhận bởi tổ chức uy tín.">
                Thành Tựu & Chứng Chỉ
              </Heading>
              <div className="ab-ach-grid">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="ab-ach-card">
                    {ach.logo
                      ? <img src={ach.logo} alt="Org" className="ab-ach-logo" />
                      : <div className="ab-ach-logo-placeholder"><FiAward size={22} color="#6366f1" /></div>
                    }
                    <div style={{ flex:1, minWidth:0 }}>
                      <div className="ab-ach-name">{ach.name}</div>
                      <div className="ab-ach-date">{ach.date}</div>
                      {ach.url && (
                        <a href={ach.url} target="_blank" rel="noreferrer" className="ab-ach-link">
                          Kiểm tra chứng chỉ <FiExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ══ 5. EDUCATION ══ */}
          {education.length > 0 && (
            <Section id="education">
              <Eyebrow icon="book" text="Học Vấn" color="#7c3aed" bg="#f5f3ff" />
              <div className="ab-divider" style={{ background:'linear-gradient(90deg,#7c3aed,#6366f1)' }} />
              <Heading sub="Nền tảng học thuật và kiến thức chuyên ngành.">
                Nền Tảng Học Vấn
              </Heading>
              <div className="ab-edu-list">
                {education.map((edu, idx) => (
                  <div key={idx} className="ab-edu-card">
                    <div>
                      <div className="ab-edu-major">{edu.title}</div>
                      <div className="ab-edu-school">{edu.company}</div>
                    </div>
                    <div className="ab-edu-date">{edu.date}</div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ══ CTA ══ */}
          <Section>
            <div className="ab-cta-band">
              <div>
                <h3>Sẵn sàng cộng tác?</h3>
                <p>Hãy cùng nhau xây dựng giải pháp nghiệp vụ tối ưu.</p>
              </div>
              <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
                <Link to="/projects" className="ab-cta-btn">Xem Dự Án <FiArrowRight size={15} /></Link>
                <Link to="/contact" style={{ ...{}, display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(255,255,255,0.1)', color:'#e2e8f0', padding:'0.85rem 2rem', borderRadius:'12px', fontWeight:700, textDecoration:'none', fontSize:'clamp(0.85rem,1.8vw,0.95rem)', border:'1px solid rgba(255,255,255,0.18)', transition:'all 0.2s' }}>Liên Hệ</Link>
              </div>
            </div>
          </Section>

        </div>
      </div>
    </>
  );
}