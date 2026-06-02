import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Home() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getPageContent('home');
      if (mounted) setContent(c);
    })();
    return () => { mounted = false; };
  }, []);

  const bannerStyle = content && content.bannerUrl ? { backgroundImage: `url(${content.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', padding: '4rem 1rem', color: '#fff' } : {};

  const title = (content && content.title) || 'Xin Chào! Tôi là Quyen';
  const tagline = (content && content.tagline) || 'Web Developer | Designer | Thinker';
  const intro = (content && content.intro) || 'Chào mừng bạn đến với portfolio của tôi. Đây là nơi tôi chia sẻ các dự án, bài viết và những điều tôi yêu thích về lập trình.';

  const ctas = (content && content.ctas) || [{ text: 'Xem Dự Án', href: '/projects', variant: 'primary' }, { text: 'Liên Lạc', href: '/contact', variant: 'secondary' }];
  const cards = (content && content.cards) || [
    { title: 'Dự Án Mới', text: 'Khám phá các dự án mới nhất của tôi', href: '/projects' },
    { title: 'Bài Viết Mới', text: 'Đọc bài viết mới nhất trên blog', href: '/blog' },
    { title: 'Giới Thiệu', text: 'Tìm hiểu thêm về tôi', href: '/about' }
  ];

  return (
    <section className="page home-page">
      <div className="hero" style={bannerStyle}>
        <h1>{title}</h1>
        <p className="tagline">{tagline}</p>
        <p className="intro">{intro}</p>
        <div className="cta-buttons">
          {ctas.map((c, i) => (
            <a key={i} href={c.href} className={c.variant === 'primary' ? 'btn btn-primary' : 'btn btn-secondary'}>{c.text}</a>
          ))}
        </div>
      </div>

      <section className="home-section">
        <h2>Gần Đây</h2>
        <div className="recent-grid">
          {cards.map((card, idx) => (
            <div className="card" key={idx}>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
              <a href={card.href}>Xem →</a>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Home;
