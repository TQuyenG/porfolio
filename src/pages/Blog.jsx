import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiClock, FiBookOpen } from 'react-icons/fi';

function Blog() {
  const [content, setContent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  useEffect(() => {
    (async () => {
      const c = await getPageContent('blog');
      if (c) setContent(c);
    })();
  }, []);

  // Chỉ lấy bài viết KHÔNG BỊ ẨN VÀ KHÔNG PHẢI LÀ BẢN NHÁP
  const rawPosts = (content?.posts || []).filter(p => !p.isHidden && !p.isDraft);
  const categories = ['Tất cả', ...new Set(rawPosts.map(p => p.category).filter(Boolean))];
  const filteredPosts = activeCategory === 'Tất cả' ? rawPosts : rawPosts.filter(p => p.category === activeCategory);
  const sortedPosts = [...filteredPosts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  
  const featuredPost = sortedPosts.length > 0 ? sortedPosts[0] : null;
  const standardPosts = sortedPosts.length > 1 ? sortedPosts.slice(1) : [];

  return (
    <section className="page blog-page" style={{ padding: '3rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.8rem', fontWeight: 800, color: '#111827', fontFamily: 'Georgia, serif' }}>{content?.pageTitle || 'Góc Chia Sẻ & Phân Tích'}</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '3rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '1.5rem' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', fontSize: '1.05rem', fontWeight: activeCategory === cat ? 700 : 500, color: activeCategory === cat ? '#2563eb' : '#4b5563', borderBottom: activeCategory === cat ? '2px solid #2563eb' : '2px solid transparent', cursor: 'pointer', transition: 'all 0.2s', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cat}</button>
        ))}
      </div>

      {featuredPost && (
        <div style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          {featuredPost.coverImage && <img src={featuredPost.coverImage} alt={featuredPost.title} style={{ width: '100%', height: '100%', minHeight: '350px', objectFit: 'cover' }} />}
          <div style={{ padding: '2.5rem' }}>
            <span style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{featuredPost.category || 'Nổi bật'}</span>
            <h2 style={{ fontSize: '2.2rem', margin: '1rem 0', lineHeight: '1.3', color: '#111827', fontFamily: 'Georgia, serif' }}><Link to={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{featuredPost.title}</Link></h2>
            
            {/* RICH TEXT CHO BÀI FEATURED */}
            <div style={{ color: '#4b5563', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '1.5rem' }} dangerouslySetInnerHTML={{ __html: featuredPost.excerpt }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#6b7280', fontSize: '0.9rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiClock /> {featuredPost.date}</span>
              <Link to={`/blog/${featuredPost.slug}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Đọc tiếp <FiBookOpen /></Link>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
        {standardPosts.map(post => (
          <div key={post.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <Link to={`/blog/${post.slug}`} style={{ display: 'block', overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem', height: '220px' }}>
              <img src={post.coverImage || 'https://via.placeholder.com/600x400?text=Blog+Cover'} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
              <span style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}>{post.category}</span>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>• {post.date}</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', lineHeight: '1.4', marginBottom: '0.8rem', fontFamily: 'Georgia, serif' }}><Link to={`/blog/${post.slug}`} style={{ color: '#111827', textDecoration: 'none' }}>{post.title}</Link></h3>
            
            {/* RICH TEXT CHO BÀI CHUẨN MỰC BÌNH THƯỜNG */}
            <div style={{ color: '#6b7280', lineHeight: '1.6', fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: post.excerpt }} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Blog;