import React, { useState, useEffect } from 'react';
import { getBlogPosts } from '../utils/supabaseClient';
import { blogPostsData } from '../data/blog-posts';
import '../styles/pages.css';

function Blog() {
  const [posts, setPosts] = useState(blogPostsData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const supabasePosts = await getBlogPosts();
        if (supabasePosts && supabasePosts.length > 0) {
          setPosts(supabasePosts);
        } else {
          // Nếu database trống, dùng mock data
          setPosts(blogPostsData);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        // Fallback to mock data
        setPosts(blogPostsData);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="page blog-page">
        <div className="page-header">
          <h1>Blog</h1>
          <p className="subtitle">Đang tải bài viết...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="page blog-page">
        <div className="page-header">
          <h1>Blog</h1>
          <p className="subtitle" style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      </section>
    );
  }

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
        <h2>📝 Cách Thêm Bài Blog</h2>
        <p>
          Bạn có 2 cách thêm bài viết:
        </p>
        <ol>
          <li><strong>Cách 1 (Nhanh):</strong> Chỉnh sửa <code>src/data/blog-posts.js</code></li>
          <li><strong>Cách 2 (Database):</strong> Thêm trực tiếp vào Supabase Dashboard:
            <ul>
              <li>Vào <strong>Table Editor</strong> → <strong>blog_posts</strong></li>
              <li>Click <strong>Insert row</strong></li>
              <li>Điền: title, slug, excerpt, content, category</li>
              <li>Bài viết sẽ hiển thị tự động!</li>
            </ul>
          </li>
        </ol>
      </section>
    </section>
  );
}

export default Blog;
