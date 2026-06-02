import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiArrowRight, FiCalendar, FiMapPin, FiExternalLink } from 'react-icons/fi';

function About() {
  const [content, setContent] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);

  useEffect(() => {
    (async () => {
      const c = await getPageContent('about');
      if (c) setContent(c);
      const blogData = await getPageContent('blog');
      if (blogData?.posts) {
        setLatestBlogs(blogData.posts.filter(p => !p.isHidden && !p.isDraft).slice(0, 3));
      }
    })();
  }, []);

  const pageTitle  = content?.pageTitle  || 'Câu Chuyện Hành Trình';
  const subtitle   = content?.subtitle   || 'Góc nhìn, định hướng và nền tảng chuyên môn';
  const intro      = content?.intro      || { title: 'Xin chào', body: '<p>Tôi là Business Analyst...</p>' };
  const gallery    = content?.gallery    || [];

  /* Mới: timeline milestones */
  const timeline   = content?.timeline   || [
    { year: '2022', title: 'Bắt đầu hành trình', desc: 'Khám phá Business Analysis tại trường đại học.', location: 'TP. HCM' },
    { year: '2023', title: 'Thực tập BA', desc: 'Tham gia phân tích yêu cầu cho dự án phần mềm nội bộ.', location: 'TP. HCM' },
    { year: '2024', title: 'Xây dựng Portfolio', desc: 'Hoàn thiện các kỹ năng BA, tham gia dự án thực tế.', location: 'TP. HCM' },
  ];

  /* Mới: values/principles */
  const values = content?.values || [
    { emoji: '🔍', title: 'Tư duy phân tích', desc: 'Luôn đặt câu hỏi "Tại sao?" trước khi tìm giải pháp.' },
    { emoji: '🤝', title: 'Giao tiếp hiệu quả', desc: 'Cầu nối giữa stakeholder và đội ngũ kỹ thuật.' },
    { emoji: '📈', title: 'Hướng đến kết quả', desc: 'Đo lường mọi thứ bằng giá trị mang lại cho người dùng.' },
    { emoji: '🌏', title: 'Tầm nhìn quốc tế', desc: 'Sẵn sàng hợp tác với đội ngũ đa quốc gia, đa văn hóa.' },
  ];

  /* Mới: CTA cuối trang */
  const ctaSection = content?.ctaSection || {
    heading: 'Sẵn sàng kết nối?',
    body: 'Tôi luôn mở cửa với các cơ hội mới, dự án thú vị, hoặc chỉ đơn giản là một cuộc trò chuyện về BA.',
    primaryText: 'Liên Hệ Ngay',
    primaryHref: '/contact',
    secondaryText: 'Xem CV',
    secondaryHref: '/resume',
  };

  return (
    <section className="page about-page abp2-root" style={{ paddingBottom: '5rem' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .abp2-root { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── PAGE HEADER ── */
        .abp2-header {
          background: linear-gradient(135deg, #0a0f1e 0%, #1e3a5f 100%);
          color: #fff;
          padding: clamp(3rem,7vw,5rem) clamp(1rem,5vw,4rem) clamp(2rem,5vw,4rem);
          margin: -2rem -1rem 0;
          text-align: center;
        }
        .abp2-header-label {
          display: inline-block;
          background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3);
          color: #7dd3fc; padding: 0.35rem 1rem; border-radius: 99px;
          font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; margin-bottom: 1.2rem;
        }
        .abp2-header h1 {
          font-family: 'Fraunces', serif;
          font-size: clamp(2rem,6vw,3.8rem); font-weight: 900;
          margin-bottom: 0.8rem; line-height: 1.1;
        }
        .abp2-header h1 em { font-style: italic; color: #38bdf8; }
        .abp2-header p { color: #94a3b8; font-size: clamp(0.9rem,2vw,1.05rem); max-width: 500px; margin: 0 auto; }

        /* ── MAIN LAYOUT ── */
        .abp2-body { max-width: 1000px; margin: 0 auto; padding: 0 clamp(0.5rem,3vw,1rem); }

        /* ── INTRO BLOCK ── */
        .abp2-intro {
          margin: clamp(2.5rem,5vw,4rem) auto 0;
          background: #fff;
          border-radius: 20px;
          border: 1.5px solid #f1f5f9;
          padding: clamp(1.5rem,4vw,2.8rem);
          box-shadow: 0 4px 24px rgba(15,23,42,0.04);
        }
        .abp2-intro-label {
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #6366f1; margin-bottom: 0.8rem;
        }
        .abp2-intro h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.4rem,4vw,2.2rem); font-weight: 900; color: #0f172a;
          margin-bottom: 1.2rem; line-height: 1.2;
        }
        .abp2-intro-body { color: #475569; font-size: clamp(0.9rem,2vw,1rem); line-height: 1.85; }
        .abp2-intro-body p { margin: 0 0 1em; }

        /* ── VALUES GRID ── */
        .abp2-values { margin-top: clamp(2.5rem,5vw,4rem); }
        .abp2-section-label {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: #6366f1; margin-bottom: 0.8rem;
        }
        .abp2-section-title {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.3rem,3.5vw,2rem); font-weight: 900; color: #0f172a;
          margin-bottom: clamp(1.2rem,3vw,2rem);
        }
        .abp2-values-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width:500px) { .abp2-values-grid { grid-template-columns: repeat(2,1fr); } }
        .abp2-value-card {
          background: #fff; border: 1.5px solid #f1f5f9; border-radius: 16px;
          padding: clamp(1.2rem,3vw,1.6rem);
          transition: all 0.25s;
        }
        .abp2-value-card:hover { border-color: #e0e7ff; box-shadow: 0 8px 24px rgba(99,102,241,0.08); transform: translateY(-3px); }
        .abp2-value-emoji { font-size: 2rem; margin-bottom: 0.7rem; line-height: 1; }
        .abp2-value-title { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 0.4rem; }
        .abp2-value-desc { font-size: 0.85rem; color: #64748b; line-height: 1.6; }

        /* ── TIMELINE ── */
        .abp2-timeline { margin-top: clamp(2.5rem,5vw,4rem); }
        .abp2-tl-list { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 1.5rem; }
        .abp2-tl-list::before {
          content: ''; position: absolute; left: 0; top: 8px; bottom: 8px;
          width: 2px; background: linear-gradient(180deg, #6366f1, #38bdf8);
          border-radius: 2px;
        }
        .abp2-tl-item { position: relative; padding: 0 0 2rem 1.8rem; }
        .abp2-tl-item:last-child { padding-bottom: 0; }
        .abp2-tl-dot {
          position: absolute; left: -1.5rem; top: 4px;
          width: 14px; height: 14px; border-radius: 50%;
          background: #6366f1; border: 2px solid #fff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2);
          transform: translateX(-6px);
        }
        .abp2-tl-year {
          font-size: 0.75rem; font-weight: 700; color: #6366f1;
          text-transform: uppercase; letter-spacing: 0.06em;
          display: flex; align-items: center; gap: 5px; margin-bottom: 0.3rem;
        }
        .abp2-tl-title { font-size: clamp(0.95rem,2vw,1.05rem); font-weight: 800; color: #0f172a; margin-bottom: 0.3rem; }
        .abp2-tl-desc { font-size: 0.87rem; color: #64748b; line-height: 1.6; margin-bottom: 0.3rem; }
        .abp2-tl-loc { font-size: 0.78rem; color: #94a3b8; display: flex; align-items: center; gap: 4px; }

        /* ── GALLERY ── */
        .abp2-gallery {
          margin-top: clamp(2.5rem,5vw,4rem);
          background: #f8fafc; border-radius: 20px;
          padding: clamp(1.5rem,4vw,2.5rem);
          border: 1.5px solid #f1f5f9;
        }
        .abp2-gallery-scroll { display: flex; overflow-x: auto; gap: 1rem; padding-bottom: 0.5rem; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
        .abp2-gallery-scroll::-webkit-scrollbar { height: 4px; }
        .abp2-gallery-scroll::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 4px; }
        .abp2-gallery-scroll::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .abp2-gallery-img {
          scroll-snap-align: start; flex: 0 0 auto;
          width: clamp(180px,55vw,260px); height: clamp(120px,35vw,175px);
          object-fit: cover; border-radius: 12px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        }

        /* ── BLOG PREVIEW ── */
        .abp2-blog { margin-top: clamp(2.5rem,5vw,4rem); }
        .abp2-blog-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: clamp(1.2rem,3vw,2rem); }
        .abp2-blog-link { font-size: 0.88rem; font-weight: 700; color: #6366f1; text-decoration: none; display: flex; align-items: center; gap: 4px; }
        .abp2-blog-link:hover { text-decoration: underline; }
        .abp2-blog-grid {
          display: grid; grid-template-columns: 1fr; gap: 1rem;
        }
        @media (min-width:560px) { .abp2-blog-grid { grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); } }
        .abp2-blog-card {
          text-decoration: none; color: inherit;
          background: #fff; border-radius: 16px;
          overflow: hidden; border: 1.5px solid #f1f5f9;
          display: flex; flex-direction: column;
          transition: all 0.25s;
        }
        .abp2-blog-card:hover { box-shadow: 0 12px 32px rgba(15,23,42,0.08); transform: translateY(-4px); border-color: #e0e7ff; }
        .abp2-blog-img { width: 100%; height: clamp(130px,30vw,165px); object-fit: cover; display: block; }
        .abp2-blog-body { padding: clamp(1rem,2.5vw,1.3rem); flex: 1; }
        .abp2-blog-cat { font-size: 0.72rem; font-weight: 800; color: #6366f1; text-transform: uppercase; letter-spacing: 0.06em; }
        .abp2-blog-title { font-size: clamp(0.88rem,2vw,1rem); font-weight: 700; color: #0f172a; margin: 0.4rem 0 0.6rem; line-height: 1.4; }
        .abp2-blog-excerpt { color: #64748b; font-size: 0.82rem; line-height: 1.55; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

        /* ── CTA SECTION ── */
        .abp2-cta {
          margin-top: clamp(3rem,6vw,5rem);
          background: linear-gradient(135deg,#0a0f1e,#1e3a5f);
          border-radius: 24px; padding: clamp(2rem,5vw,3.5rem) clamp(1.5rem,4vw,3rem);
          text-align: center; color: #fff;
        }
        .abp2-cta h2 {
          font-family: 'Fraunces', serif;
          font-size: clamp(1.5rem,4vw,2.5rem); font-weight: 900;
          margin-bottom: 0.8rem;
        }
        .abp2-cta p { color: #94a3b8; font-size: clamp(0.88rem,2vw,1rem); max-width: 500px; margin: 0 auto 2rem; line-height: 1.7; }
        .abp2-cta-btns { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
        .abp2-cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg,#6366f1,#38bdf8);
          color: #fff; padding: 0.85rem 2rem; border-radius: 12px;
          font-weight: 700; font-size: clamp(0.88rem,2vw,1rem);
          text-decoration: none; transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.4);
        }
        .abp2-cta-primary:hover { transform: translateY(-2px); color:#fff; box-shadow: 0 8px 28px rgba(99,102,241,0.5); }
        .abp2-cta-secondary {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent; color: #e2e8f0;
          border: 1.5px solid rgba(255,255,255,0.2);
          padding: 0.85rem 2rem; border-radius: 12px;
          font-weight: 600; font-size: clamp(0.88rem,2vw,1rem);
          text-decoration: none; transition: all 0.2s;
        }
        .abp2-cta-secondary:hover { border-color: #38bdf8; color: #38bdf8; }
      `}</style>

      {/* ── HEADER ── */}
      <div className="abp2-header">
        <div className="abp2-header-label">Portfolio · BA</div>
        <h1>{pageTitle.includes('Hành Trình') ? <>Câu Chuyện <em>Hành Trình</em></> : pageTitle}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="abp2-body">

        {/* ── INTRO ── */}
        <div className="abp2-intro">
          <div className="abp2-intro-label">✦ Về Tôi</div>
          <h2>{intro.title || 'Xin chào'}</h2>
          <div className="abp2-intro-body" dangerouslySetInnerHTML={{ __html: intro.body }} />
        </div>

        {/* ── VALUES ── */}
        {values.length > 0 && (
          <div className="abp2-values">
            <div className="abp2-section-label">✦ Nguyên Tắc Làm Việc</div>
            <div className="abp2-section-title">Điều Tôi Tin Tưởng</div>
            <div className="abp2-values-grid">
              {values.map((v, i) => (
                <div className="abp2-value-card" key={i}>
                  <div className="abp2-value-emoji">{v.emoji}</div>
                  <div className="abp2-value-title">{v.title}</div>
                  <div className="abp2-value-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TIMELINE ── */}
        {timeline.length > 0 && (
          <div className="abp2-timeline">
            <div className="abp2-section-label">✦ Cột Mốc</div>
            <div className="abp2-section-title">Hành Trình Chuyên Môn</div>
            <div className="abp2-tl-list">
              {timeline.map((item, i) => (
                <div className="abp2-tl-item" key={i}>
                  <div className="abp2-tl-dot" />
                  <div className="abp2-tl-year"><FiCalendar size={11} /> {item.year}</div>
                  <div className="abp2-tl-title">{item.title}</div>
                  <div className="abp2-tl-desc">{item.desc}</div>
                  {item.location && <div className="abp2-tl-loc"><FiMapPin size={11} /> {item.location}</div>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GALLERY ── */}
        {gallery.length > 0 && (
          <div className="abp2-gallery">
            <div className="abp2-section-label">✦ Hình Ảnh</div>
            <div className="abp2-section-title" style={{ fontSize: 'clamp(1.1rem,2.5vw,1.4rem)', marginBottom: '1.2rem' }}>Khoảnh Khắc Đáng Nhớ</div>
            <div className="abp2-gallery-scroll">
              {gallery.map((imgUrl, idx) => (
                <img key={idx} src={imgUrl} alt={`about-${idx}`} className="abp2-gallery-img" loading="lazy" />
              ))}
            </div>
          </div>
        )}

        {/* ── BLOG PREVIEW ── */}
        {latestBlogs.length > 0 && (
          <div className="abp2-blog">
            <div className="abp2-blog-header">
              <div>
                <div className="abp2-section-label">✦ Góc Chia Sẻ</div>
                <div className="abp2-section-title" style={{ margin: 0 }}>Bài Học & Kinh Nghiệm</div>
              </div>
              <Link to="/blog" className="abp2-blog-link">Tất cả bài viết <FiArrowRight size={13} /></Link>
            </div>
            <div className="abp2-blog-grid">
              {latestBlogs.map(post => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="abp2-blog-card">
                  <img
                    src={post.coverImage || 'https://placehold.co/400x200/e0e7ff/6366f1?text=Blog'}
                    alt={post.title}
                    className="abp2-blog-img"
                  />
                  <div className="abp2-blog-body">
                    <div className="abp2-blog-cat">{post.category}</div>
                    <div className="abp2-blog-title">{post.title}</div>
                    <div className="abp2-blog-excerpt" dangerouslySetInnerHTML={{ __html: post.excerpt }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="abp2-cta">
          <h2>{ctaSection.heading}</h2>
          <p>{ctaSection.body}</p>
          <div className="abp2-cta-btns">
            <Link to={ctaSection.primaryHref || '/contact'} className="abp2-cta-primary">
              {ctaSection.primaryText || 'Liên Hệ Ngay'} <FiArrowRight size={14} />
            </Link>
            <Link to={ctaSection.secondaryHref || '/resume'} className="abp2-cta-secondary">
              {ctaSection.secondaryText || 'Xem CV'} <FiExternalLink size={14} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export default About;