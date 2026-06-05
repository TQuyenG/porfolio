import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import {
  FiChevronLeft, FiChevronRight, FiX, FiStar, FiClock,
  FiMapPin, FiArrowRight, FiBriefcase, FiTrendingUp, FiUsers, FiZap,
  FiTarget, FiAward, FiActivity, FiMonitor, FiSmartphone,
  FiGlobe, FiDatabase, FiCloud, FiHeart, FiSmile,
  FiMessageCircle, FiThumbsUp, FiCheckCircle, FiCoffee,
  FiTool, FiShield, FiMail, FiLinkedin, FiGithub,
  FiCode, FiLayers, FiEdit3, FiFileText, FiSearch,
  FiBarChart2, FiPieChart, FiBookOpen, FiSend,
} from 'react-icons/fi';

/* ─── Icon map toàn cục ─── */
const ICON_MAP = {
  briefcase: FiBriefcase, trending: FiTrendingUp, users: FiUsers, zap: FiZap,
  target: FiTarget, award: FiAward, clock: FiClock, activity: FiActivity,
  monitor: FiMonitor, smartphone: FiSmartphone, globe: FiGlobe,
  database: FiDatabase, cloud: FiCloud, heart: FiHeart, smile: FiSmile,
  message: FiMessageCircle, thumbsup: FiThumbsUp, check: FiCheckCircle,
  star: FiStar, coffee: FiCoffee, tool: FiTool, shield: FiShield,
  mail: FiMail, linkedin: FiLinkedin, github: FiGithub,
  code: FiCode, layers: FiLayers, edit: FiEdit3, file: FiFileText,
  search: FiSearch, barchart: FiBarChart2, piechart: FiPieChart,
  book: FiBookOpen, send: FiSend, mappin: FiMapPin,
};

function DynIcon({ name, size = 18, color }) {
  const Comp = ICON_MAP[name] || FiZap;
  return <Comp size={size} color={color} />;
}

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

/* ─── Scroll reveal hook ─── */
function useScrollReveal(deps = []) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); });
    }, { threshold: 0.08 });
    document.querySelectorAll('.reveal-section').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function Home() {
  const [content, setContent] = useState(null);
  const [pinnedProjects, setPinnedProjects] = useState([]);
  const [aboutSkills, setAboutSkills] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  useEffect(() => {
    (async () => {
      const [homeData, projectsData, aboutData] = await Promise.all([
        getPageContent('home'),
        getPageContent('projects'),
        getPageContent('about'),
      ]);
      if (homeData) setContent(homeData);
      if (projectsData?.projects) {
        const ids = homeData?.pinnedProjectIds || [];
        if (ids.length > 0) {
          setPinnedProjects(
            ids.map(id => projectsData.projects.find(p => p.id === id && !p.isHidden)).filter(Boolean)
          );
        } else {
          setPinnedProjects(projectsData.projects.filter(p => p.isPinned && !p.isHidden));
        }
      }
      if (aboutData?.skills) setAboutSkills(aboutData.skills);
    })();
  }, []);

  useScrollReveal([content, pinnedProjects]);

  /* ── Data ── */
  const title      = content?.title      || 'Xin Chào! Tôi là Quyen';
  const tagline    = content?.tagline    || 'Business Analyst Intern · Web Developer';
  const intro      = content?.intro      || 'Tôi đam mê phân tích nghiệp vụ và xây dựng các giải pháp tối ưu.';
  const ctas       = content?.ctas       || [{ text: 'Xem Dự Án', href: '/projects', variant: 'primary' }, { text: 'Liên Hệ', href: '/contact', variant: 'secondary' }];
  const avatarUrl  = content?.avatarUrl  || null;
  const bannerUrl  = content?.bannerUrl  || null;
  const location   = content?.location   || 'Ho Chi Minh City, Vietnam';
  const openToWork = content?.openToWork !== false;
  const badgeText  = content?.badgeText  || 'Available for International Projects — Remote';
  const targetRoles = content?.targetRoles || '';
  const gallery    = content?.gallery    || [];

  const stats = content?.stats || [
    { icon: 'briefcase', value: 5,  suffix: '+', label: 'Dự Án BA' },
    { icon: 'trending',  value: 2,  suffix: '+', label: 'Năm Kinh Nghiệm' },
    { icon: 'users',     value: 10, suffix: '+', label: 'Stakeholders' },
    { icon: 'layers',    value: 3,  suffix: '',  label: 'Lĩnh Vực' },
  ];

  /* Achievements từ home content (thành tích công việc — khác chứng chỉ bên About) */
  const achievements = content?.achievements || [];

  /* Toolkit: lấy từ about skills, lọc những nhóm có showOnHome = true */
  const toolkitGroups = aboutSkills.filter(s => s.showOnHome);

  /* Lightbox */
  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImage = (e) => { e.stopPropagation(); setLightboxIndex(p => (p + 1) % gallery.length); };
  const prevImage = (e) => { e.stopPropagation(); setLightboxIndex(p => (p === 0 ? gallery.length - 1 : p - 1)); };

  return (
    <section className="page home-page hp-root" style={{ padding: 0, overflowX: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');

        .hp-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ══════════════════════════════════
           HERO
        ══════════════════════════════════ */
        .hp-hero {
          position: relative;
          min-height: calc(100svh - 80px);
          display: flex;
          align-items: center;
          padding: clamp(2rem,5vw,4rem) clamp(1rem,5vw,5%);
          color: #fff;
          background-color: #0a0f1e;
          background-size: cover;
          background-position: center;
          overflow: hidden;
        }
        .hp-hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 70% 55% at 75% 15%, rgba(56,189,248,0.10) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 10% 85%, rgba(99,102,241,0.08) 0%, transparent 60%);
        }
        .hp-hero-bg::after {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .hp-hero-inner {
          position: relative; z-index: 2;
          width: 100%; max-width: 1200px; margin: 0 auto;
          display: flex; align-items: flex-end; justify-content: space-between;
          gap: 2rem;
          animation: hp-fadeUp 0.85s ease both;
        }
        @keyframes hp-fadeUp { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:none} }

        .hp-hero-text { flex: 1; min-width: 0; padding-bottom: 2rem; }

        /* Badge */
        .hp-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.18);
          color: #e2e8f0; padding: 0.4rem 1rem; border-radius: 99px;
          font-size: clamp(0.7rem,1.8vw,0.82rem); font-weight: 700;
          letter-spacing: 0.04em; text-transform: uppercase; margin-bottom: 1.6rem;
          backdrop-filter: blur(6px); width: fit-content;
        }
        .hp-badge-dot {
          width: 7px; height: 7px; background: #4ade80; border-radius: 50%;
          box-shadow: 0 0 8px #4ade80; animation: hp-pulse 2s infinite;
        }
        @keyframes hp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(0.85)} }

        /* Heading */
        .hp-hero h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2.2rem, 5.5vw, 5rem);
          font-weight: 900; line-height: 1.07; letter-spacing: -0.02em;
          margin-bottom: 1.2rem;
        }
        .hp-hero h1 em { font-style: italic; color: #38bdf8; }

        .hp-hero-tagline {
          font-size: clamp(0.88rem,2vw,1.1rem); font-weight: 500;
          color: #94a3b8; margin-bottom: 0.8rem;
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .hp-hero-tagline span { color: #475569; }

        .hp-location {
          display: inline-flex; align-items: center; gap: 5px;
          color: #64748b; font-size: 0.82rem; margin-bottom: 1.4rem;
        }

        .hp-hero-intro {
          font-size: clamp(0.88rem,1.8vw,1.05rem); color: #cbd5e1;
          line-height: 1.9; max-width: 560px; margin-bottom: 2.4rem;
        }

        /* CTAs */
        .hp-cta-row { display: flex; gap: 0.9rem; flex-wrap: wrap; }
        .hp-btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg,#2563eb,#38bdf8);
          color: #fff; padding: 0.8rem 2rem; border-radius: 12px;
          font-weight: 700; font-size: clamp(0.85rem,1.8vw,0.95rem);
          text-decoration: none; transition: all 0.25s; border: none; cursor: pointer;
          white-space: nowrap;
        }
        .hp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37,99,235,0.35); color:#fff; }
        .hp-btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #e2e8f0;
          border: 1.5px solid rgba(255,255,255,0.22);
          padding: 0.8rem 2rem; border-radius: 12px;
          font-weight: 600; font-size: clamp(0.85rem,1.8vw,0.95rem);
          text-decoration: none; transition: all 0.25s; white-space: nowrap;
        }
        .hp-btn-outline:hover { border-color: #38bdf8; color: #38bdf8; }

        /* Target roles tag */
        .hp-target-tag {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 1.4rem;
          font-size: 0.78rem; font-weight: 700; color: #94a3b8;
          text-transform: uppercase; letter-spacing: 0.06em;
        }
        .hp-target-tag strong { color: #e2e8f0; }

        /* ── AVATAR (Desktop: overflow bottom-right) ── */
        .hp-avatar-wrap { display: none; }
        @media (min-width: 900px) {
          .hp-hero-text { max-width: 52%; }
          .hp-avatar-wrap {
            display: block; position: absolute;
            bottom: 0; right: clamp(2%, 5vw, 7%);
            height: 88%; max-width: 42%; z-index: 1;
            pointer-events: none;
            animation: hp-fadeUp 1.1s 0.25s ease both;
          }
          .hp-avatar-wrap img {
            width: 100%; height: 100%;
            object-fit: contain; object-position: bottom right;
            filter: drop-shadow(-12px 12px 28px rgba(0,0,0,0.55));
          }
        }
        /* Mobile avatar: small circle top-right */
        @media (max-width: 899px) {
          .hp-hero { align-items: flex-start; padding-top: clamp(3rem,8vw,5rem); }
          .hp-avatar-mobile {
            position: absolute; top: 1.2rem; right: 1rem;
            width: clamp(70px,18vw,100px); height: clamp(70px,18vw,100px);
            border-radius: 50%; overflow: hidden;
            border: 2px solid rgba(255,255,255,0.15);
            box-shadow: 0 8px 20px rgba(0,0,0,0.35);
            flex-shrink: 0;
          }
          .hp-avatar-mobile img { width:100%; height:100%; object-fit:cover; object-position:top center; }
        }
        @media (min-width: 900px) { .hp-avatar-mobile { display: none; } }

        /* ══════════════════════════════════
           STATS BAR
        ══════════════════════════════════ */
        .hp-stats-bar {
          background: #fff; border-top: 1px solid #e2e8f0;
          padding: clamp(1.8rem,4vw,2.8rem) clamp(1rem,5vw,4rem);
        }
        .hp-stats-grid {
          max-width: 960px; margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: clamp(0.8rem,2vw,1.5rem);
        }
        @media (min-width: 540px) { .hp-stats-grid { grid-template-columns: repeat(4,1fr); } }
        .hp-stat-card {
          text-align: center; padding: clamp(1rem,2.5vw,1.5rem) 0.8rem;
          border: 1px solid #f1f5f9; border-radius: 16px;
          transition: box-shadow 0.25s, transform 0.25s;
          background: #fafbff;
        }
        .hp-stat-card:hover { box-shadow: 0 8px 28px rgba(37,99,235,0.09); transform: translateY(-4px); }
        .hp-stat-icon {
          width: 40px; height: 40px; border-radius: 10px;
          background: #eff6ff; display: flex; align-items: center; justify-content: center;
          color: #2563eb; font-size: 1.1rem; margin: 0 auto 0.7rem;
        }
        .hp-stat-num {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.7rem,4vw,2.4rem); font-weight: 900; color: #0f172a; line-height: 1;
        }
        .hp-stat-label {
          font-size: clamp(0.68rem,1.5vw,0.76rem); color: #94a3b8;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 0.35rem;
        }

        /* ══════════════════════════════════
           PROVEN RESULTS (PINNED PROJECTS)
        ══════════════════════════════════ */
        .hp-projects {
          padding: clamp(3rem,6vw,5rem) clamp(1rem,5vw,4rem);
          background: #fff;
        }
        .hp-projects-inner { max-width: 1100px; margin: 0 auto; }
        .hp-section-eyebrow {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg,#fef3c7,#fde68a);
          color: #92400e;
          padding: 0.3rem 0.9rem; border-radius: 99px;
          font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em;
          margin-bottom: 0.9rem;
        }
        .hp-section-heading {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.5rem,3.5vw,2.5rem); font-weight: 900; color: #0f172a;
          margin-bottom: clamp(1.5rem,4vw,2.5rem);
          display: flex; justify-content: space-between; align-items: baseline;
          flex-wrap: wrap; gap: 0.5rem;
        }
        .hp-section-heading a {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: clamp(0.82rem,1.8vw,0.92rem); font-weight: 700;
          color: #2563eb; text-decoration: none;
          display: flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }
        .hp-section-heading a:hover { text-decoration: underline; }

        .hp-proj-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.4rem;
        }
        @media (min-width: 600px) { .hp-proj-grid { grid-template-columns: repeat(auto-fill,minmax(300px,1fr)); } }

        .hp-proj-card {
          border: 1.5px solid #f1f5f9; border-radius: 18px; overflow: hidden;
          display: flex; flex-direction: column;
          transition: all 0.3s cubic-bezier(0.23,1,0.32,1);
          background: #fff; position: relative;
        }
        .hp-proj-card:hover { transform: translateY(-5px); box-shadow: 0 18px 44px rgba(15,23,42,0.08); border-color: #bfdbfe; }
        .hp-proj-accent { height: 3px; background: linear-gradient(90deg,#2563eb,#38bdf8); flex-shrink: 0; }
        .hp-proj-body { padding: clamp(1.1rem,2.5vw,1.6rem); flex:1; display:flex; flex-direction:column; gap: 0.7rem; }

        .hp-proj-cat {
          display: inline-block;
          font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.07em;
          padding: 0.22rem 0.7rem; border-radius: 6px;
          background: #eff6ff; color: #1d4ed8;
          width: fit-content;
        }
        .hp-proj-metric {
          font-size: clamp(1.1rem,2.5vw,1.35rem); font-weight: 900; color: #0f172a;
          font-family: 'Fraunces', serif; line-height: 1.1;
        }
        .hp-proj-metric-label { font-size: 0.72rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .hp-proj-title { font-size: clamp(0.95rem,2vw,1.15rem); font-weight: 800; color: #0f172a; line-height: 1.35; }
        .hp-proj-client { font-size: 0.78rem; color: #64748b; font-weight: 600; }
        .hp-proj-duration { font-size: 0.78rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; }
        .hp-proj-desc { color: #475569; font-size: clamp(0.82rem,1.8vw,0.9rem); line-height: 1.7; flex:1; }
        .hp-proj-techs { display: flex; flex-wrap: wrap; gap: 0.4rem; }
        .hp-proj-tech { background: #f1f5f9; color: #475569; font-size: 0.7rem; font-weight: 700; padding: 0.22rem 0.65rem; border-radius: 6px; }
        .hp-proj-link {
          display: inline-flex; align-items: center; gap: 6px;
          background: #0f172a; color: #fff;
          padding: 0.6rem 1.2rem; border-radius: 9px; font-weight: 700;
          font-size: 0.82rem; text-decoration: none; transition: background 0.2s;
          align-self: flex-start; margin-top: auto;
        }
        .hp-proj-link:hover { background: #1e293b; }

        /* ══════════════════════════════════
           ACHIEVEMENTS
        ══════════════════════════════════ */
        .hp-achievements {
          padding: clamp(3rem,6vw,5rem) clamp(1rem,5vw,4rem);
          background: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        .hp-achievements-inner { max-width: 1100px; margin: 0 auto; }
        .hp-ach-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 540px) { .hp-ach-grid { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 860px) { .hp-ach-grid { grid-template-columns: repeat(4,1fr); } }
        .hp-ach-card {
          background: #fff; border: 1px solid #e2e8f0; border-radius: 16px;
          padding: clamp(1.1rem,2.5vw,1.5rem);
          display: flex; flex-direction: column; gap: 0.7rem;
          transition: all 0.25s;
        }
        .hp-ach-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(15,23,42,0.07); border-color: #c7d2fe; }
        .hp-ach-icon {
          width: 42px; height: 42px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; flex-shrink: 0;
        }
        .hp-ach-title { font-size: clamp(0.88rem,2vw,0.98rem); font-weight: 800; color: #0f172a; line-height: 1.3; }
        .hp-ach-desc { font-size: clamp(0.78rem,1.6vw,0.84rem); color: #64748b; line-height: 1.6; flex: 1; }

        /* ══════════════════════════════════
           BA TOOLKIT
        ══════════════════════════════════ */
        .hp-toolkit {
          padding: clamp(3rem,6vw,5rem) clamp(1rem,5vw,4rem);
          background: #fff;
          border-top: 1px solid #e2e8f0;
        }
        .hp-toolkit-inner { max-width: 1100px; margin: 0 auto; }
        .hp-toolkit-groups {
          display: flex; flex-direction: column; gap: 1.5rem;
        }
        .hp-toolkit-group {
          background: #f8fafc; border: 1px solid #e2e8f0;
          border-radius: 14px; padding: clamp(1rem,2.5vw,1.4rem) clamp(1.1rem,2.5vw,1.6rem);
        }
        .hp-toolkit-group-label {
          font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
          color: #fff; padding: 0.25rem 0.75rem; border-radius: 6px;
          display: inline-flex; align-items: center; gap: 5px;
          margin-bottom: 0.9rem;
        }
        .hp-toolkit-tags { display: flex; flex-wrap: wrap; gap: 0.55rem; }
        .hp-toolkit-tag {
          display: inline-flex; align-items: center; gap: 5px;
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #334155; padding: 0.42rem 0.9rem; border-radius: 99px;
          font-size: clamp(0.75rem,1.6vw,0.83rem); font-weight: 600;
          transition: all 0.2s;
        }
        .hp-toolkit-tag:hover { border-color: #6366f1; color: #4338ca; background: #eef2ff; }

        /* Fallback strip khi không có toolkit từ About */
        .hp-skills-strip {
          background: #f8fafc; padding: clamp(1.8rem,4vw,2.8rem) clamp(1rem,5vw,4rem);
          border-top: 1px solid #e2e8f0;
        }
        .hp-skills-inner { max-width: 1000px; margin: 0 auto; }
        .hp-skills-title { font-size: clamp(1rem,2.2vw,1.25rem); font-weight: 800; color: #0f172a; margin-bottom: 1rem; }
        .hp-skills-tags { display: flex; flex-wrap: wrap; gap: 0.55rem; }
        .hp-skill-tag {
          background: #fff; border: 1.5px solid #e2e8f0;
          color: #475569; padding: 0.45rem 1rem; border-radius: 99px;
          font-size: clamp(0.75rem,1.6vw,0.84rem); font-weight: 600;
          transition: all 0.2s;
        }
        .hp-skill-tag:hover { border-color: #2563eb; color: #2563eb; background: #eff6ff; }

        /* ══════════════════════════════════
           GALLERY
        ══════════════════════════════════ */
        .hp-gallery {
          padding: clamp(2.5rem,5vw,4rem) 0;
          background: #f8fafc; border-top: 1px solid #e2e8f0; overflow: hidden;
        }
        .hp-gallery-header { text-align: center; padding: 0 1rem; margin-bottom: clamp(1.2rem,3vw,2rem); }
        .hp-gallery-header h2 { font-family:'Fraunces',serif; font-size:clamp(1.3rem,3vw,2rem); font-weight:900; color:#0f172a; margin-bottom:0.2rem; }
        .hp-gallery-header p { color:#94a3b8; font-size:clamp(0.8rem,1.6vw,0.9rem); }
        .hp-marquee { overflow: hidden; white-space: nowrap; width: 100%; padding: 0.5rem 0 1rem; }
        .hp-marquee-track { display: inline-flex; gap: 1rem; animation: hp-scroll 38s linear infinite; }
        .hp-marquee-track:hover { animation-play-state: paused; }
        @keyframes hp-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(calc(-50% - 0.5rem))} }
        .hp-gallery-thumb {
          flex: 0 0 auto; width: clamp(180px,36vw,280px); height: clamp(120px,22vw,180px);
          border-radius: 12px; overflow: hidden; cursor: pointer;
          transition: all 0.35s cubic-bezier(0.175,0.885,0.32,1.275);
          border: 2px solid transparent;
        }
        .hp-gallery-thumb:hover { transform: scale(1.07) translateY(-8px); box-shadow: 0 14px 36px rgba(0,0,0,0.14); border-color: #2563eb; }
        .hp-gallery-thumb img { width:100%; height:100%; object-fit:cover; display:block; }

        /* Lightbox */
        .hp-lightbox { position: fixed; inset: 0; background: rgba(2,6,23,0.96); z-index: 999999; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); }
        .hp-lb-close { position: absolute; top: 18px; right: 18px; background: rgba(255,255,255,0.1); border: none; color: #fff; width: 42px; height: 42px; border-radius: 50%; font-size: 1.3rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .hp-lb-close:hover { background: rgba(239,68,68,0.6); }
        .hp-lb-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255,255,255,0.1); border: none; color: #fff; width: 46px; height: 46px; border-radius: 50%; font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .hp-lb-nav:hover { background: rgba(255,255,255,0.22); }
        .hp-lb-prev { left: 14px; } .hp-lb-next { right: 14px; }
        .hp-lb-img { max-width: min(90vw,880px); max-height: 85svh; border-radius: 10px; object-fit: contain; animation: hp-zoomIn 0.22s ease; }
        @keyframes hp-zoomIn { from{transform:scale(0.93);opacity:0} to{transform:scale(1);opacity:1} }

        /* Divider decoration */
        .hp-wave-divider { width: 100%; overflow: hidden; line-height: 0; }
        .hp-wave-divider svg { display: block; width: 100%; }
      `}</style>

      {/* ══ HERO ══ */}
      <div className="hp-hero" style={{
        backgroundImage: bannerUrl
          ? `linear-gradient(rgba(10,15,30,0.72), rgba(10,15,30,0.85)), url(${bannerUrl})`
          : 'none'
      }}>
        <div className="hp-hero-bg" />

        {/* Mobile avatar (small circle) */}
        {avatarUrl && (
          <div className="hp-avatar-mobile">
            <img src={avatarUrl} alt="Portrait" />
          </div>
        )}

        <div className="hp-hero-inner">
          <div className="hp-hero-text">
            {openToWork && (
              <div className="hp-badge">
                <span className="hp-badge-dot" />
                {badgeText}
              </div>
            )}
            <h1>
              {title.includes('Quyen') ? (
                <>Xin Chào! Tôi là <em>Quyen</em></>
              ) : title}
            </h1>
            <div className="hp-hero-tagline">
              {tagline.split('·').map((t, i, arr) => (
                <React.Fragment key={i}>{t.trim()}{i < arr.length - 1 && <span>·</span>}</React.Fragment>
              ))}
            </div>
            {location && (
              <div className="hp-location"><FiMapPin size={13} /> {location}</div>
            )}
            <div className="hp-hero-intro" dangerouslySetInnerHTML={{ __html: intro }} />
            <div className="hp-cta-row">
              {ctas.map((c, i) => {
                const isInternal = c.href?.startsWith('/');
                const cls = c.variant === 'primary' ? 'hp-btn-primary' : 'hp-btn-outline';
                return isInternal
                  ? <Link key={i} to={c.href} className={cls}>{c.text}{c.variant === 'primary' && <FiArrowRight size={15}/>}</Link>
                  : <a key={i} href={c.href} target="_blank" rel="noreferrer" className={cls}>{c.text}{c.variant === 'primary' && <FiArrowRight size={15}/>}</a>;
              })}
            </div>
            {targetRoles && (
              <div className="hp-target-tag">
                <FiTarget size={12} />
                Targeting: <strong>{targetRoles}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Desktop avatar (overflow) */}
        <div className="hp-avatar-wrap">
          {avatarUrl && <img src={avatarUrl} alt="Portrait" />}
        </div>
      </div>

      {/* ══ STATS BAR ══ */}
      <div className="hp-stats-bar">
        <div className="hp-stats-grid">
          {stats.map((s, i) => (
            <div className="hp-stat-card reveal-section" key={i}>
              <div className="hp-stat-icon"><DynIcon name={s.icon} size={18} /></div>
              <div className="hp-stat-num"><CountUp target={s.value} suffix={s.suffix} /></div>
              <div className="hp-stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ PROVEN RESULTS (PINNED PROJECTS) ══ */}
      {pinnedProjects.length > 0 && (
        <div className="hp-projects">
          <div className="hp-projects-inner">
            <div className="hp-section-eyebrow reveal-section">
              <FiStar size={11} /> Featured Work
            </div>
            <div className="hp-section-heading reveal-section">
              <span>Proven Results</span>
              <Link to="/projects">Xem tất cả <FiArrowRight size={13} /></Link>
            </div>
            <div className="hp-proj-grid">
              {pinnedProjects.map((project) => (
                <div className="hp-proj-card reveal-section" key={project.id}>
                  <div className="hp-proj-accent" />
                  <div className="hp-proj-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {project.category && <span className="hp-proj-cat">{project.category}</span>}
                      {project.client && <span className="hp-proj-client">{project.client}</span>}
                    </div>
                    {project.metric && (
                      <div>
                        <div className="hp-proj-metric">{project.metric}</div>
                        {project.metricLabel && <div className="hp-proj-metric-label">{project.metricLabel}</div>}
                      </div>
                    )}
                    <div className="hp-proj-title">{project.title}</div>
                    {project.duration && (
                      <div className="hp-proj-duration"><FiClock size={11} /> {project.duration}</div>
                    )}
                    <div className="hp-proj-desc" dangerouslySetInnerHTML={{ __html: project.description }} />
                    {(project.technologies || []).length > 0 && (
                      <div className="hp-proj-techs">
                        {project.technologies.slice(0, 4).map((t, idx) => <span key={idx} className="hp-proj-tech">{t}</span>)}
                      </div>
                    )}
                    <Link to={`/projects/${project.slug}`} className="hp-proj-link">
                      Xem chi tiết <FiArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ ACHIEVEMENTS ══ */}
      {achievements.length > 0 && (
        <div className="hp-achievements">
          <div className="hp-achievements-inner">
            <div className="hp-section-eyebrow reveal-section">
              <FiAward size={11} /> Highlights
            </div>
            <div className="hp-section-heading reveal-section">
              <span>Thành Tựu Nổi Bật</span>
            </div>
            <div className="hp-ach-grid">
              {achievements.map((ach, i) => {
                const bg = ach.color || '#eff6ff';
                const iconColor = ach.iconColor || '#2563eb';
                return (
                  <div className="hp-ach-card reveal-section" key={i}>
                    <div className="hp-ach-icon" style={{ background: bg, color: iconColor }}>
                      <DynIcon name={ach.icon || 'award'} size={18} color={iconColor} />
                    </div>
                    <div className="hp-ach-title">{ach.title}</div>
                    <div className="hp-ach-desc">{ach.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ BA TOOLKIT (from About skills with showOnHome=true) ══ */}
      {toolkitGroups.length > 0 ? (
        <div className="hp-toolkit">
          <div className="hp-toolkit-inner">
            <div className="hp-section-eyebrow reveal-section">
              <FiTool size={11} /> Expertise
            </div>
            <div className="hp-section-heading reveal-section">
              <span>The BA Toolkit</span>
              <Link to="/about">Full Profile <FiArrowRight size={13} /></Link>
            </div>
            <div className="hp-toolkit-groups reveal-section">
              {toolkitGroups.map((group, gi) => {
                const tagBg = group.badgeColor || '#6366f1';
                const items = Array.isArray(group.items) ? group.items : (group.items || '').split(',').map(s => s.trim()).filter(Boolean);
                return (
                  <div className="hp-toolkit-group" key={gi}>
                    <div className="hp-toolkit-group-label" style={{ background: tagBg }}>
                      <DynIcon name={group.icon || 'tool'} size={12} color="#fff" />
                      {group.title}
                    </div>
                    <div className="hp-toolkit-tags">
                      {items.map((item, ii) => (
                        <span key={ii} className="hp-toolkit-tag">{item}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Fallback: highlightedSkills nếu chưa có About skills */
        (content?.highlightedSkills || []).length > 0 && (
          <div className="hp-skills-strip reveal-section">
            <div className="hp-skills-inner">
              <div className="hp-skills-title">Chuyên Môn Nổi Bật</div>
              <div className="hp-skills-tags">
                {(content.highlightedSkills || []).map((s, i) => (
                  <span key={i} className="hp-skill-tag">{s}</span>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* ══ GALLERY ══ */}
      {gallery.length > 0 && (
        <div className="hp-gallery reveal-section">
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

      {/* ══ LIGHTBOX ══ */}
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