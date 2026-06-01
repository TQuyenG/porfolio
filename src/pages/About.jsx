import React from 'react';
import '../styles/pages.css';

function About() {
  return (
    <section className="page about-page">
      <div className="page-header">
        <h1>Về Tôi</h1>
        <p className="subtitle">Tìm hiểu thêm về hành trình của tôi</p>
      </div>

      <div className="about-content">
        <div className="about-intro">
          <h2>Xin Chào! 👋</h2>
          <p>
            Tôi là Quyen, một web developer passionate với 
            <strong> X năm kinh nghiệm</strong> trong lĩnh vực lập trình web. 
            Tôi yêu thích việc giải quyết vấn đề phức tạp thông qua code sáng tạo.
          </p>
        </div>

        <section className="about-section">
          <h3>Kỹ Năng Chính</h3>
          <div className="skills-grid">
            <div className="skill-card">
              <h4>Frontend</h4>
              <ul>
                <li>React.js</li>
                <li>JavaScript / TypeScript</li>
                <li>HTML / CSS</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            <div className="skill-card">
              <h4>Backend</h4>
              <ul>
                <li>Node.js</li>
                <li>Python</li>
                <li>SQL / NoSQL</li>
                <li>REST API</li>
              </ul>
            </div>
            <div className="skill-card">
              <h4>Tools & Others</h4>
              <ul>
                <li>Git / GitHub</li>
                <li>VS Code</li>
                <li>Docker</li>
                <li>AWS</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h3>Kinh Nghiệm</h3>
          <div className="experience-list">
            <div className="experience-item">
              <h4>Web Developer tại [Công ty]</h4>
              <p className="date">2022 - Hiện tại</p>
              <p>Phát triển ứng dụng web responsive với React</p>
            </div>
            <div className="experience-item">
              <h4>Junior Developer tại [Công ty]</h4>
              <p className="date">2021 - 2022</p>
              <p>Hỗ trợ development và debugging</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h3>Sở Thích & Đam Mê</h3>
          <p>
            Khi không code, tôi thích đọc sách, khám phá công nghệ mới, 
            và tham gia các cộng đồng lập trình. Tôi luôn tìm cách để cải thiện 
            bản thân và chia sẻ kiến thức với những người khác.
          </p>
        </section>
      </div>
    </section>
  );
}

export default About;
