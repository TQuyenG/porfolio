import React from 'react';
import '../styles/pages.css';

function Home() {
  return (
    <section className="page home-page">
      <div className="hero">
        <h1>Xin Chào! Tôi là Quyen</h1>
        <p className="tagline">Web Developer | Designer | Thinker</p>
        <p className="intro">
          Chào mừng bạn đến với portfolio của tôi. Đây là nơi tôi chia sẻ các dự án,
          bài viết và những điều tôi yêu thích về lập trình.
        </p>
        <div className="cta-buttons">
          <a href="/projects" className="btn btn-primary">
            Xem Dự Án
          </a>
          <a href="/contact" className="btn btn-secondary">
            Liên Lạc
          </a>
        </div>
      </div>

      <section className="home-section">
        <h2>Gần Đây</h2>
        <div className="recent-grid">
          <div className="card">
            <h3>📁 Dự Án Mới</h3>
            <p>Khám phá các dự án mới nhất của tôi</p>
            <a href="/projects">Xem tất cả →</a>
          </div>
          <div className="card">
            <h3>📝 Bài Viết Mới</h3>
            <p>Đọc bài viết mới nhất trên blog</p>
            <a href="/blog">Xem blog →</a>
          </div>
          <div className="card">
            <h3>👤 Giới Thiệu</h3>
            <p>Tìm hiểu thêm về tôi</p>
            <a href="/about">Đọc thêm →</a>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Home;
