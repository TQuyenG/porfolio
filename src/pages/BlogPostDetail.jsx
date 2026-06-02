import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import { FiArrowLeft, FiClock } from 'react-icons/fi';

function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPageContent('blog');
      if (data && data.posts) {
        const found = data.posts.find(p => p.slug === slug && !p.isHidden);
        setPost(found);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#6b7280' }}>Đang tải nội dung...</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '5rem' }}><h2>Bài viết không tồn tại.</h2><Link to="/blog" style={{ color: '#2563eb' }}>← Về trang Blog</Link></div>;

  return (
    <article style={{ padding: '3rem 1rem', maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff' }}>
      <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}><FiArrowLeft /> Về trang Blog</Link>

      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.4rem 1.2rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>{post.category || 'Chung'}</span>
        <h1 style={{ fontSize: '2.8rem', color: '#111827', margin: '1.5rem 0 1rem', lineHeight: '1.3', fontFamily: 'Georgia, serif', fontWeight: 800 }}>{post.title}</h1>
        <div style={{ color: '#6b7280', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}><FiClock /> Xuất bản: {post.date}</div>
      </div>

      {post.coverImage && <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'cover', borderRadius: '16px', marginBottom: '3rem', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }} />}

      {/* RICH TEXT CONTENT CHO BÀI ĐỌC */}
      <div className="blog-rich-content" style={{ color: '#374151', fontSize: '1.15rem', lineHeight: '1.9', fontFamily: 'sans-serif' }}>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>Q</div>
        <div>
          <h4 style={{ margin: 0, color: '#111827', fontSize: '1.1rem' }}>Quyên (Tác giả)</h4>
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>Business Analyst & Web Developer</p>
        </div>
      </div>
    </article>
  );
}

export default BlogPostDetail;