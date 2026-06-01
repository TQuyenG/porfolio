import React, { useState } from 'react';
import '../styles/pages.css';

function Blog() {
  const [posts] = useState([
    {
      id: 1,
      title: 'Bài viết 1: Làm quen với React Hooks',
      date: '2024-01-15',
      excerpt: 'Tìm hiểu về useState, useEffect và những hooks hữu ích khác...',
      content: 'Nội dung bài viết đầy đủ ở đây...',
      category: 'React',
    },
    {
      id: 2,
      title: 'Bài viết 2: Best Practices cho Node.js',
      date: '2024-01-10',
      excerpt: 'Những thực hành tốt nhất khi phát triển server Node.js...',
      content: 'Nội dung bài viết đầy đủ ở đây...',
      category: 'Backend',
    },
    {
      id: 3,
      title: 'Bài viết 3: CSS Grid vs Flexbox',
      date: '2024-01-05',
      excerpt: 'So sánh hai phương pháp layout phổ biến nhất...',
      content: 'Nội dung bài viết đầy đủ ở đây...',
      category: 'CSS',
    },
  ]);

  return (
    <section className="page blog-page">
      <div className="page-header">
        <h1>Blog</h1>
        <p className="subtitle">Các bài viết và chia sẻ của tôi</p>
      </div>

      <div className="blog-posts">
        {posts.map((post) => (
          <article key={post.id} className="blog-post">
            <div className="post-header">
              <h2>{post.title}</h2>
              <div className="post-meta">
                <span className="post-date">📅 {new Date(post.date).toLocaleDateString('vi-VN')}</span>
                <span className="post-category">{post.category}</span>
              </div>
            </div>
            <p className="post-excerpt">{post.excerpt}</p>
            <a href="#" className="read-more">
              Đọc tiếp →
            </a>
          </article>
        ))}
      </div>

      <section className="blog-guide">
        <h2>Cách Viết Bài Blog</h2>
        <p>
          Bạn có thể thêm bài viết mới bằng cách:
        </p>
        <ol>
          <li>Tạo file markdown trong <code>public/blog/</code></li>
          <li>Hoặc chỉnh sửa mảng <code>posts</code> trong <code>src/pages/Blog.jsx</code></li>
          <li>Thêm ảnh/thumbnail vào <code>public/images/blog/</code></li>
          <li>Restart server</li>
        </ol>
      </section>
    </section>
  );
}

export default Blog;
