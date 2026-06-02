import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { getPageContent } from '../utils/supabaseClient';

function Library() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const c = await getPageContent('library');
      if (mounted) setContent(c);
    })();
    return () => { mounted = false; };
  }, []);

  const docs = content?.documents || [
    { id:1, title: 'Web Development Cheat Sheet', category: 'Reference', type: 'PDF', size: '2.5 MB', url: '#' }
  ];

  return (
    <section className="page library-page">
      <div className="page-header">
        <h1>{content?.pageTitle || 'Thư Viện Tài Liệu'}</h1>
        <p className="subtitle">{content?.subtitle || 'Bộ sưu tập tài liệu, code và resources'}</p>
      </div>

      <div className="library-intro">
        <p>{content?.intro || 'Nơi lưu trữ các tài liệu, template code, guides và resources hữu ích.'}</p>
      </div>

      <div className="documents-grid">
        {docs.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="doc-icon">{doc.type === 'PDF' ? '📄' : '📦'}</div>
            <h3>{doc.title}</h3>
            <div className="doc-meta">
              <span className="doc-category">{doc.category}</span>
              <span className="doc-size">{doc.size || ''}</span>
            </div>
            <a href={doc.url || '#'} className="doc-download">Tải xuống →</a>
          </div>
        ))}
      </div>

      <section className="library-section">
        <h2>📚 Thư Viện</h2>
        <div className="guide-box">
          <p>Danh sách tài liệu hỗ trợ và tham khảo — tải xuống để xem chi tiết.</p>
        </div>
      </section>
    </section>
  );
}

export default Library;
