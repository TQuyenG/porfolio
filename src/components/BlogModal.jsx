import React, { useState } from 'react';
import { FiX, FiCheck, FiUploadCloud, FiEdit3, FiEdit } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import { uploadFileToStorage } from '../utils/supabaseClient';
import ConfirmModal from './ConfirmModal'; 
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';

const BlogModal = ({ mode, initialData, categories, onClose, onSave, setNotification }) => {
  const [blog, setBlog] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  const [isDirty, setIsDirty, checkUnsavedChanges] = useUnsavedChangesWarning();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = () => {
    if (!blog.title.trim()) {
      setNotification({ open: true, type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tiêu đề bài viết.' });
      return;
    }
    setIsDirty(false); 
    onSave(blog);
  };

  const handleCancelClick = () => {
    if (isDirty) setShowConfirm(true);
    else onClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(4px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      
      {/* 🚀 CSS RESPONSIVE CHO MODAL BLOG */}
      <style>{`
        .bm-container { background-color: #ffffff; border-radius: 16px; width: 100%; max-width: 850px; max-height: 92vh; overflow-y: auto; padding: 2.5rem; box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
        .bm-grid-2 { display: grid; grid-template-columns: 1.8fr 1fr; gap: 1rem; }
        @media (max-width: 768px) {
          .bm-container { padding: 1.25rem; max-height: 98vh; }
          .bm-grid-2 { grid-template-columns: 1fr; }
          .bm-btn-group { flex-direction: column; gap: 0.5rem; }
          .bm-btn-group button { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="bm-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'add' ? <><FiEdit3 color="#2563eb" /> Viết Bài Mới</> : <><FiEdit color="#10b981" /> Chỉnh Sửa: {blog.title}</>}
          </h3>
          <button onClick={handleCancelClick} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}><FiX /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div className="bm-grid-2">
            <div className="form-group">
              <label style={{ fontWeight: 600 }}>Tiêu đề bài viết</label>
              <input type="text" value={blog.title || ''} onChange={(e) => { setBlog({ ...blog, title: e.target.value }); setIsDirty(true); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#2563eb' }}>Danh mục phân loại</label>
              <select value={blog.category || ''} onChange={(e) => { setBlog({ ...blog, category: e.target.value }); setIsDirty(true); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontWeight: 600 }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label style={{ fontWeight: 600 }}>Đoạn tóm tắt (Mô tả ngắn hiện ở lưới)</label>
            <RichTextEditor value={blog.excerpt || ''} onChange={(val) => { setBlog({ ...blog, excerpt: val }); setIsDirty(true); }} />
          </div>
          
          <div className="form-group">
            <label style={{ fontWeight: 600 }}>Nội dung chi tiết bài viết</label>
            <RichTextEditor value={blog.content || ''} onChange={(val) => { setBlog({ ...blog, content: val }); setIsDirty(true); }} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #cbd5e1', flexWrap: 'wrap' }}>
            {blog.coverImage && <img src={blog.coverImage} alt="cov" style={{ width: '160px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />}
            <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600 }}>
              <FiUploadCloud /> Tải ảnh bìa bài viết {loading && '...'}
              <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if (!file) return; setLoading(true); const res = await uploadFileToStorage(file, 'assets'); setLoading(false); if (!res.error) { setBlog({ ...blog, coverImage: res.url }); setIsDirty(true); }else{ setNotification({open:true, type:'error', title:'Lỗi', message:res.error.message}); } }} style={{ display: 'none' }} disabled={loading}/>
            </label>
          </div>
        </div>

        <div className="bm-btn-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          <button 
            type="button"
            onClick={handleCancelClick} 
            style={{ padding: '0.8rem 2rem', backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            Hủy Bỏ
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            style={{ padding: '0.8rem 3rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem' }}
          >
            <FiCheck /> Lưu Bài Viết
          </button>
        </div>
      </div>

      <ConfirmModal 
        open={showConfirm}
        title="Dữ liệu chưa được lưu!"
        message="Bạn đang soạn thảo nội dung dở dang. Nếu thoát ra, bài viết sẽ bị xóa bỏ hoàn toàn. Bạn có chắc chắn muốn thoát?"
        onConfirm={onClose}
        onCancel={() => setShowConfirm(false)}
        confirmText="Vẫn thoát"
        cancelText="Ở lại"
      />
    </div>
  );
};

export default BlogModal;