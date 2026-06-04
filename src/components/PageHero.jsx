import React from 'react';

export default function PageHero({ title, subtitle, bgImage }) {
  return (
    <div className="ds-page-hero" style={{ backgroundImage: bgImage ? `url(${bgImage})` : 'none' }}>
      <style>{`
        /* Phá lồng container để bung tràn viền ngang */
        .ds-page-hero {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
          min-height: 70vh; /* Kích thước chiều cao chung cho mọi trang con */
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 1.5rem;
          background-size: cover;
          background-position: center;
          background-color: #0f172a; /* Màu nền dự phòng Slate 900 */
          margin-top: -80px; /* Bù trừ chiều cao thanh Navbar để ảnh chui xuống dưới */
          padding-top: 80px;
          margin-bottom: 3rem; 
        }
        .ds-page-hero-overlay {
          position: absolute; inset: 0; 
          background-color: rgba(15, 23, 42, 0.75); /* Lớp mờ đen sang trọng */
          z-index: 1;
        }
        .ds-page-hero-content {
          position: relative; z-index: 2; 
          max-width: 1000px; width: 100%; margin: 0 auto; 
          text-align: center;
          animation: fadeUpHero 0.8s ease forwards;
        }
        @keyframes fadeUpHero {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      
      <div className="ds-page-hero-overlay" />
      <div className="ds-page-hero-content">
        <h1 style={{ color: '#ffffff', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: '#a5b4fc', fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 500, maxWidth: '800px', margin: '0 auto', lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}