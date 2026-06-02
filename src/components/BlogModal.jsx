import React, { useState } from 'react';
import { FiX, FiCheck, FiUploadCloud, FiEdit3, FiEdit } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import { uploadFileToStorage } from '../utils/supabaseClient';

const BlogModal = ({ mode, initialData, categories, onClose, onSave, setNotification }) => {
  const [blog, setBlog] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!blog.title.trim()) {
      setNotification({ open: true, type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tiêu đề bài viết.' });
      return;
    }
    onSave(blog);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '92vh', overflowY: 'auto', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'add' ? <><FiEdit3 color="#2563eb" /> Viết Bài Mới</> : <><FiEdit color="#10b981" /> Chỉnh Sửa: {blog.title}</>}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}><FiX /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label style={{ fontWeight: 600 }}>Tiêu đề bài viết</label>
              <input type="text" value={blog.title || ''} onChange={(e) => setBlog({ ...blog, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#2563eb' }}>Danh mục phân loại</label>
              <select value={blog.category || ''} onChange={(e) => setBlog({ ...blog, category: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontWeight: 600 }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label style={{ fontWeight: 600 }}>Đoạn tóm tắt (Mô tả ngắn hiện ở lưới)</label>
            <RichTextEditor value={blog.excerpt || ''} onChange={(val) => setBlog({ ...blog, excerpt: val })} />
          </div>
          
          <div className="form-group">
            <label style={{ fontWeight: 600 }}>Nội dung chi tiết bài viết</label>
            <RichTextEditor value={blog.content || ''} onChange={(val) => setBlog({ ...blog, content: val })} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            {blog.coverImage && <img src={blog.coverImage} alt="cov" style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />}
            <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <FiUploadCloud /> Tải ảnh bìa bài viết {loading && '...'}
              <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; setLoading(true); const res = await uploadFileToStorage(file, 'assets'); setLoading(false); if (!res.error) { setBlog({ ...blog, coverImage: res.url }); }else{ setNotification({open:true, type:'error', title:'Lỗi', message:res.error.message}); } }} style={{ display: 'none' }} disabled={loading}/>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.8rem 2rem' }}>Hủy Bỏ</button>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '0.8rem 3rem' }}><FiCheck /> Lưu Bài Viết</button>
        </div>
      </div>
    </div>
  );
};

export default BlogModal;