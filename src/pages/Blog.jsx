import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';
import { FiClock, FiBookOpen } from 'react-icons/fi';
import PageHero from '../components/PageHero';

function Blog() {
  const [content, setContent] = useState(null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  useEffect(() => {
    (async () => {
      const c = await getPageContent('blog');
      if (c) setContent(c);
    })();
  }, []);

  // HOOK HIỆU ỨNG CUỘN
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal-section').forEach(sec => observer.observe(sec));
    return () => observer.disconnect();
  }, [content, activeCategory]);

  const rawPosts = (content?.posts || []).filter(p => !p.isHidden && !p.isDraft);
  const categories = ['Tất cả', ...new Set(rawPosts.map(p => p.category).filter(Boolean))];
  
  const filteredPosts = activeCategory === 'Tất cả' ? rawPosts : rawPosts.filter(p => p.category === activeCategory);
  const sortedPosts = [...filteredPosts].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  
  const featuredPost = sortedPosts.length > 0 ? sortedPosts[0] : null;
  const standardPosts = sortedPosts.length > 1 ? sortedPosts.slice(1) : [];

  return (
    <section className="page blog-page">
      
      <PageHero 
        title={content?.pageTitle || 'Góc Chia Sẻ Kiến Thức'} 
        subtitle={content?.subtitle || ''} 
        bgImage={content?.coverUrl || ''} 
      />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        
        {/* FILTER CATEGORY CÓ HIỆU ỨNG */}
        <div className="reveal-section" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '3rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)} 
              style={{ 
                background: 'none', border: 'none', padding: '0.5rem 1.2rem', fontSize: 'var(--font-body)', cursor: 'pointer', transition: 'all 0.2s',
                fontWeight: activeCategory === cat ? 700 : 500,
                color: activeCategory === cat ? 'var(--primary-color)' : 'var(--text-sub)',
                borderBottom: activeCategory === cat ? '2px solid var(--primary-color)' : '2px solid transparent'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FEATURED POST TỰ CO DÃN 1 CỘT TRÊN MOBILE */}
        {featuredPost && (
          <div className="reveal-section mobile-grid-1" style={{ marginBottom: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 360px), 1fr))', gap: '2.5rem', alignItems: 'center', backgroundColor: 'var(--bg-white)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            {featuredPost.coverImage && (
              <img src={featuredPost.coverImage} alt={featuredPost.title} style={{ width: '100%', height: '100%', minHeight: '250px', maxHeight: '400px', objectFit: 'cover' }} />
            )}
            <div className="blog-card-content" style={{ padding: '2.5rem' }}>
              <span style={{ backgroundColor: 'var(--highlight-color)', color: 'var(--primary-color)', padding: '0.3rem 0.8rem', borderRadius: '4px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>{featuredPost.category}</span>
              <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 800, margin: '1rem 0 1.2rem 0', color: 'var(--text-main)', lineHeight: '1.3' }}>
                <Link to={`/blog/${featuredPost.slug}`} style={{ color: 'inherit', textDecoration: 'none' }}>{featuredPost.title}</Link>
              </h2>
              <div style={{ color: 'var(--text-sub)', fontSize: 'var(--font-body)', marginBottom: '2rem', lineHeight: '1.7' }} dangerouslySetInnerHTML={{ __html: featuredPost.excerpt }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-small)', color: 'var(--text-sub)' }}><FiClock /> {featuredPost.date}</span>
                <Link to={`/blog/${featuredPost.slug}`} style={{ color: 'var(--primary-color)', fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>Đọc bài viết <FiBookOpen /></Link>
              </div>
            </div>
          </div>
        )}

        {/* BÀI VIẾT THƯỜNG */}
        <div className="mobile-grid-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: '2.5rem' }}>
          {standardPosts.map(post => (
            <div key={post.id} className="reveal-section" style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-white)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
              {post.coverImage && (
                <Link to={`/blog/${post.slug}`} style={{ display: 'block', height: '200px', overflow: 'hidden' }}>
                  <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.04)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                </Link>
              )}
              <div className="blog-card-content" style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '0.6rem', fontSize: '12px' }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase' }}>{post.category}</span>
                  <span style={{ color: 'var(--text-sub)' }}>• {post.date}</span>
                </div>
                <h3 style={{ fontSize: 'var(--font-h4)', fontWeight: 800, lineHeight: '1.4', marginBottom: '1rem' }}>
                  <Link to={`/blog/${post.slug}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>{post.title}</Link>
                </h3>
                <div style={{ color: 'var(--text-sub)', fontSize: 'var(--font-small)', lineHeight: '1.6', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: post.excerpt }} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Blog;