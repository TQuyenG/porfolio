import React, { useState } from 'react';
import '../styles/pages.css';

function Library() {
  const [documents] = useState([
    {
      id: 1,
      title: 'Web Development Cheat Sheet',
      category: 'Reference',
      type: 'PDF',
      size: '2.5 MB',
    },
    {
      id: 2,
      title: 'JavaScript ES6+ Guide',
      category: 'Tutorial',
      type: 'PDF',
      size: '1.8 MB',
    },
    {
      id: 3,
      title: 'React Patterns Collection',
      category: 'Code',
      type: 'ZIP',
      size: '5.2 MB',
    },
  ]);

  return (
    <section className="page library-page">
      <div className="page-header">
        <h1>Thư Viện Tài Liệu</h1>
        <p className="subtitle">Bộ sưu tập tài liệu, code và resources</p>
      </div>

      <div className="library-intro">
        <p>
          Nơi lưu trữ các tài liệu, template code, guides và resources hữu ích 
          mà tôi đã thu thập. Bạn có thể tự do sử dụng chúng cho các dự án của mình.
        </p>
      </div>

      <div className="documents-grid">
        {documents.map((doc) => (
          <div key={doc.id} className="document-card">
            <div className="doc-icon">
              {doc.type === 'PDF' && '📄'}
              {doc.type === 'ZIP' && '📦'}
              {doc.type === 'MD' && '📝'}
            </div>
            <h3>{doc.title}</h3>
            <div className="doc-meta">
              <span className="doc-category">{doc.category}</span>
              <span className="doc-size">{doc.size}</span>
            </div>
            <a href="#" className="doc-download">
              Tải xuống →
            </a>
          </div>
        ))}
      </div>

      <section className="library-section">
        <h2>📚 Hướng Dẫn Quản Lý Thư Viện</h2>
        <div className="guide-box">
          <h3>Thêm Tài Liệu Mới:</h3>
          <ol>
            <li>Đặt file vào <code>public/documents/</code></li>
            <li>Cập nhật mảng <code>documents</code> trong <code>src/pages/Library.jsx</code></li>
            <li>Thêm link download vào mục <code>href</code></li>
            <li>Restart server</li>
          </ol>
        </div>

        <div className="file-structure">
          <h3>Cấu Trúc Folder Khuyến Nghị:</h3>
          <pre>
{`public/documents/
├── pdf/
│   ├── CV-Quyen.pdf
│   └── cheat-sheet.pdf
├── code/
│   ├── templates.zip
│   └── snippets/
└── resources/
    └── ...`}
          </pre>
        </div>
      </section>
    </section>
  );
}

export default Library;
