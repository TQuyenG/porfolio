import React from 'react';
import '../styles/pages.css';

function Projects() {
  const projects = [
    {
      id: 1,
      title: 'Project 1: E-commerce Website',
      description: 'Một trang web bán hàng đầy đủ với React, Node.js và MongoDB',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      link: '#',
      image: '/images/project1.png',
    },
    {
      id: 2,
      title: 'Project 2: Task Manager App',
      description: 'Ứng dụng quản lý công việc với Firebase realtime',
      technologies: ['React', 'Firebase', 'CSS'],
      link: '#',
      image: '/images/project2.png',
    },
    {
      id: 3,
      title: 'Project 3: Blog Platform',
      description: 'Nền tảng blog với tính năng comment, like, và search',
      technologies: ['Next.js', 'PostgreSQL', 'Tailwind CSS'],
      link: '#',
      image: '/images/project3.png',
    },
  ];

  return (
    <section className="page projects-page">
      <div className="page-header">
        <h1>Các Dự Án Của Tôi</h1>
        <p className="subtitle">Những dự án mà tôi đã xây dựng</p>
      </div>

      <div className="projects-grid">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            {project.image && (
              <div className="project-image">
                <img src={project.image} alt={project.title} />
              </div>
            )}
            <div className="project-content">
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-tech">
                {project.technologies.map((tech, idx) => (
                  <span key={idx} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>
              <a href={project.link} className="project-link">
                Xem chi tiết →
              </a>
            </div>
          </div>
        ))}
      </div>

      <section className="projects-section">
        <h2>Hướng Dẫn: Thêm Dự Án Mới</h2>
        <p>
          Bạn có thể dễ dàng thêm dự án mới bằng cách chỉnh sửa file <code>src/pages/Projects.jsx</code>
        </p>
        <ol>
          <li>Mở file Projects.jsx</li>
          <li>Thêm object mới vào mảng <code>projects</code></li>
          <li>Đặt ảnh dự án vào <code>public/images/</code></li>
          <li>Restart server: <code>npm start</code></li>
        </ol>
      </section>
    </section>
  );
}

export default Projects;
