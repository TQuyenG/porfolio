import React from 'react';
import '../styles/pages.css';

function Resume() {
  return (
    <section className="page resume-page">
      <div className="page-header">
        <h1>CV / Resume</h1>
        <p className="subtitle">Thông tin chuyên môn của tôi</p>
      </div>

      <div className="resume-container">
        <div className="resume-header">
          <h2>QUYEN - Web Developer</h2>
          <p>Email: your.email@example.com | Phone: +84 xxx xxx xxx</p>
          <p>Location: Your City, Vietnam</p>
        </div>

        <section className="resume-section">
          <h3>TÓNG QUAN</h3>
          <p>
            Web developer có kinh nghiệm trong phát triển ứng dụng web hiện đại 
            với React, Node.js và các công nghệ backend khác.
          </p>
        </section>

        <section className="resume-section">
          <h3>KINH NGHIỆM LÀNG VIỆC</h3>
          <div className="resume-item">
            <div className="resume-header-item">
              <h4>Web Developer</h4>
              <span className="date">2022 - Hiện tại</span>
            </div>
            <p className="company">Công ty ABC</p>
            <ul>
              <li>Phát triển và bảo trì các ứng dụng web với React</li>
              <li>Tối ưu hóa performance và SEO</li>
              <li>Làm việc với API RESTful</li>
            </ul>
          </div>
        </section>

        <section className="resume-section">
          <h3>KỸ NĂNG</h3>
          <div className="skills-list">
            <div>
              <strong>Frontend:</strong> React, JavaScript, HTML, CSS, Responsive Design
            </div>
            <div>
              <strong>Backend:</strong> Node.js, Express, Python, SQL
            </div>
            <div>
              <strong>Tools:</strong> Git, Docker, AWS, VS Code
            </div>
          </div>
        </section>

        <section className="resume-section">
          <h3>HỌC VẤN</h3>
          <div className="resume-item">
            <div className="resume-header-item">
              <h4>Cử nhân Công nghệ Thông tin</h4>
              <span className="date">2018 - 2022</span>
            </div>
            <p className="company">Đại học XYZ</p>
          </div>
        </section>

        <section className="resume-section">
          <h3>CHỨNG CHỈ & GIẢI THƯỞNG</h3>
          <ul>
            <li>React Advanced - Certificate (2023)</li>
            <li>Full Stack Web Developer - Bootcamp (2022)</li>
          </ul>
        </section>

        <div className="resume-actions">
          <a href="/documents/CV-Quyen.pdf" download className="btn btn-primary">
            📥 Tải CV (PDF)
          </a>
          <p className="note">💡 Lưu ý: Đặt file CV của bạn vào <code>public/documents/</code></p>
        </div>
      </div>
    </section>
  );
}

export default Resume;
