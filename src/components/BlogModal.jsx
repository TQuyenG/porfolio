import React, { useState, useRef, useEffect } from 'react';
import {
  FiX, FiCheck, FiUploadCloud, FiEdit3, FiEdit,
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft,
  FiAlignCenter, FiAlignRight, FiImage, FiVideo,
  FiLink, FiCode, FiMinus, FiType,
} from 'react-icons/fi';
import { uploadFileToStorage } from '../utils/supabaseClient';
import ConfirmModal from './ConfirmModal';
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';

/* ─── Enhanced Rich Text Editor with image/video insert ─── */
const RichEditor = ({ value, onChange, placeholder = 'Nhập nội dung...', minHeight = 200 }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const savedRange = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) savedRange.current = sel.getRangeAt(0).cloneRange();
  };

  const restoreRange = () => {
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    } else {
      editorRef.current?.focus();
    }
  };

  const exec = (cmd, val = null) => {
    restoreRange();
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  };

  const insertHTML = (html) => {
    restoreRange();
    document.execCommand('insertHTML', false, html);
    editorRef.current?.focus();
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadFileToStorage(file, 'assets');
    setUploading(false);
    if (!res.error) {
      insertHTML(`<img src="${res.url}" alt="Ảnh minh họa" style="max-width:100%;border-radius:10px;margin:1rem 0;" /><br/>`);
    }
    e.target.value = '';
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadFileToStorage(file, 'assets');
    setUploading(false);
    if (!res.error) {
      insertHTML(`<video src="${res.url}" controls style="max-width:100%;border-radius:10px;margin:1rem 0;"></video><br/>`);
    }
    e.target.value = '';
  };

  const handleYouTube = () => {
    const url = prompt('Nhập URL YouTube hoặc URL video nhúng:');
    if (!url) return;
    let embedUrl = url;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
    if (ytMatch) embedUrl = `https://www.youtube.com/embed/${ytMatch[1]}`;
    insertHTML(`<div class="embed-wrap"><iframe src="${embedUrl}" allowfullscreen title="Video nhúng"></iframe></div><br/>`);
  };

  const handleLink = () => {
    const url = prompt('Nhập URL liên kết:');
    if (url) exec('createLink', url);
  };

  const toolGroups = [
    [
      { icon: <FiBold />, cmd: 'bold', title: 'In đậm (Ctrl+B)' },
      { icon: <FiItalic />, cmd: 'italic', title: 'In nghiêng (Ctrl+I)' },
      { icon: <FiUnderline />, cmd: 'underline', title: 'Gạch chân (Ctrl+U)' },
    ],
    [
      { icon: <span style={{ fontWeight:900, fontSize:'0.9rem' }}>H1</span>, cmd: () => exec('formatBlock', 'H2'), title: 'Tiêu đề lớn' },
      { icon: <span style={{ fontWeight:800, fontSize:'0.85rem' }}>H2</span>, cmd: () => exec('formatBlock', 'H3'), title: 'Tiêu đề vừa' },
      { icon: <span style={{ fontWeight:700, fontSize:'0.8rem' }}>H3</span>, cmd: () => exec('formatBlock', 'H4'), title: 'Tiêu đề nhỏ' },
      { icon: <FiType />, cmd: () => exec('formatBlock', 'P'), title: 'Đoạn văn thường' },
    ],
    [
      { icon: <FiList />, cmd: 'insertUnorderedList', title: 'Danh sách dấu chấm' },
      { icon: <span style={{ fontWeight:700, fontSize:'0.85rem' }}>1.</span>, cmd: 'insertOrderedList', title: 'Danh sách đánh số' },
    ],
    [
      { icon: <FiAlignLeft />, cmd: 'justifyLeft', title: 'Căn trái' },
      { icon: <FiAlignCenter />, cmd: 'justifyCenter', title: 'Căn giữa' },
      { icon: <FiAlignRight />, cmd: 'justifyRight', title: 'Căn phải' },
    ],
    [
      { icon: <FiLink />, cmd: null, onClick: handleLink, title: 'Chèn liên kết' },
      { icon: <FiCode />, cmd: 'formatBlock', val: 'PRE', title: 'Khối mã code' },
      { icon: <FiMinus />, cmd: 'insertHorizontalRule', title: 'Đường kẻ ngang' },
    ],
  ];

  /* word count */
  const wordCount = (editorRef.current?.innerText || '').trim().split(/\s+/).filter(Boolean).length;

  return (
    <div style={{ border:'1.5px solid #e2e8f0', borderRadius:12, overflow:'hidden', background:'#fff' }}>
      {/* Toolbar */}
      <div style={{ background:'#f8fafc', borderBottom:'1px solid #e2e8f0', padding:'0.5rem 0.75rem', display:'flex', flexWrap:'wrap', gap:'2px', alignItems:'center' }}>
        {toolGroups.map((group, gi) => (
          <React.Fragment key={gi}>
            {gi > 0 && <span style={{ width:1, height:22, background:'#e2e8f0', margin:'0 4px', flexShrink:0 }} />}
            {group.map((tool, ti) => (
              <button
                key={ti}
                type="button"
                title={tool.title}
                onMouseDown={e => { e.preventDefault(); saveRange(); }}
                onClick={() => {
                  if (tool.onClick) { saveRange(); tool.onClick(); return; }
                  if (typeof tool.cmd === 'function') { tool.cmd(); return; }
                  exec(tool.cmd, tool.val);
                }}
                style={{
                  width:30, height:30, border:'none', borderRadius:6, background:'transparent',
                  cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                  color:'#475569', fontSize:'0.9rem', transition:'all 0.15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background='#e2e8f0'; e.currentTarget.style.color='#0f172a'; }}
                onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#475569'; }}
              >
                {tool.icon}
              </button>
            ))}
          </React.Fragment>
        ))}

        {/* Divider */}
        <span style={{ width:1, height:22, background:'#e2e8f0', margin:'0 4px', flexShrink:0 }} />

        {/* Image upload */}
        <button
          type="button" title="Chèn ảnh từ máy"
          onMouseDown={e => { e.preventDefault(); saveRange(); }}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{ width:30, height:30, border:'none', borderRadius:6, background:uploading ? '#e2e8f0' : 'transparent', cursor:uploading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', transition:'all 0.15s' }}
          onMouseOver={e => { if (!uploading) e.currentTarget.style.background='#d1fae5'; }}
          onMouseOut={e => { if (!uploading) e.currentTarget.style.background='transparent'; }}
        >
          {uploading ? <span style={{ fontSize:'0.6rem', fontWeight:800 }}>...</span> : <FiImage size={15} />}
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleImageUpload} />

        {/* Video upload */}
        <button
          type="button" title="Chèn video từ máy"
          onMouseDown={e => { e.preventDefault(); saveRange(); }}
          onClick={() => videoInputRef.current?.click()}
          disabled={uploading}
          style={{ width:30, height:30, border:'none', borderRadius:6, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#6366f1', transition:'all 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background='#eef2ff'}
          onMouseOut={e => e.currentTarget.style.background='transparent'}
        >
          <FiVideo size={15} />
        </button>
        <input ref={videoInputRef} type="file" accept="video/*" style={{ display:'none' }} onChange={handleVideoUpload} />

        {/* YouTube embed */}
        <button
          type="button" title="Nhúng video YouTube"
          onMouseDown={e => { e.preventDefault(); saveRange(); }}
          onClick={handleYouTube}
          style={{ padding:'0 8px', height:28, border:'none', borderRadius:6, background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:4, color:'#ef4444', fontSize:'0.72rem', fontWeight:800, transition:'all 0.15s' }}
          onMouseOver={e => e.currentTarget.style.background='#fee2e2'}
          onMouseOut={e => e.currentTarget.style.background='transparent'}
        >
          <FiVideo size={13} /> YT
        </button>

        {/* Word count */}
        <span style={{ marginLeft:'auto', fontSize:'0.72rem', color:'#94a3b8', fontWeight:600, whiteSpace:'nowrap', paddingRight:'0.25rem' }}>
          {wordCount} từ
        </span>
      </div>

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        onBlur={e => { saveRange(); onChange(e.currentTarget.innerHTML); }}
        style={{
          padding:'1rem 1.2rem',
          minHeight,
          outline:'none',
          lineHeight:1.8,
          fontSize:'0.95rem',
          color:'#374151',
          fontFamily:"'Plus Jakarta Sans', sans-serif",
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
        }
        [contenteditable] img { max-width:100%; }
        [contenteditable] blockquote {
          border-left:4px solid #6366f1; margin:1rem 0;
          padding:0.75rem 1rem; background:#f5f3ff; border-radius:0 8px 8px 0;
          font-style:italic; color:#4338ca;
        }
      `}</style>
    </div>
  );
};

/* ═══ BLOG MODAL ═══ */
const BlogModal = ({ mode, initialData, categories, onClose, onSave, setNotification }) => {
  const [blog, setBlog]     = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [tab, setTab]       = useState('info'); /* 'info' | 'content' | 'cover' */

  const [isDirty, setIsDirty] = useUnsavedChangesWarning();
  const [showConfirm, setShowConfirm] = useState(false);

  const update = (field, value) => {
    setBlog(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const handleSubmit = () => {
    if (!(blog.title || '').trim()) {
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

  /* word/read estimate */
  const wordCount = (blog.content || '').replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length;
  const readMins  = Math.max(1, Math.ceil(wordCount / 200));

  const tabStyle = (t) => ({
    padding: '0.55rem 1.2rem',
    border: 'none', borderRadius: '8px',
    fontWeight: tab === t ? 800 : 600,
    fontSize: '0.88rem',
    background: tab === t ? '#6366f1' : 'transparent',
    color: tab === t ? '#fff' : '#64748b',
    cursor: 'pointer',
    transition: 'all 0.18s',
  });

  const inputStyle = {
    width: '100%', padding: '0.8rem 1rem',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '0.9rem', outline: 'none', background: '#fff',
    transition: 'border-color 0.18s',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.82)', backdropFilter:'blur(5px)', zIndex:99999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <style>{`
        .bm2-wrap {
          background:#fff; border-radius:20px; width:100%;
          max-width:920px; max-height:94svh; overflow:hidden;
          display:flex; flex-direction:column;
          box-shadow:0 32px 64px rgba(0,0,0,0.22);
        }
        .bm2-header {
          display:flex; justify-content:space-between; align-items:center;
          padding:1.2rem 1.8rem; border-bottom:1px solid #f1f5f9;
          flex-shrink:0; background:#fff; position:sticky; top:0; z-index:10;
        }
        .bm2-tabs {
          display:flex; gap:4px; background:#f1f5f9;
          padding:4px; border-radius:12px;
        }
        .bm2-body { flex:1; overflow-y:auto; padding:1.6rem 1.8rem; }
        .bm2-footer {
          display:flex; justify-content:space-between; align-items:center;
          padding:1.2rem 1.8rem; border-top:1px solid #f1f5f9; flex-shrink:0;
          flex-wrap:wrap; gap:0.75rem;
        }
        @media(max-width:640px){
          .bm2-wrap { border-radius:16px 16px 0 0; max-height:98svh; align-self:flex-end; }
          .bm2-header { padding:1rem 1.2rem; }
          .bm2-body { padding:1.2rem; }
          .bm2-footer { padding:1rem 1.2rem; }
          .bm2-tabs { width:100%; }
          .bm2-tabs button { flex:1; }
        }
      `}</style>

      <div className="bm2-wrap">
        {/* Header */}
        <div className="bm2-header">
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <div style={{ width:38, height:38, borderRadius:10, background: mode === 'add' ? '#eef2ff' : '#d1fae5', display:'flex', alignItems:'center', justifyContent:'center', color: mode === 'add' ? '#6366f1' : '#10b981', flexShrink:0 }}>
              {mode === 'add' ? <FiEdit3 size={18} /> : <FiEdit size={18} />}
            </div>
            <div>
              <div style={{ fontWeight:800, fontSize:'clamp(1rem,2.5vw,1.15rem)', color:'#0f172a', lineHeight:1.2 }}>
                {mode === 'add' ? 'Viết Bài Viết Mới' : `Chỉnh Sửa: ${blog.title}`}
              </div>
              {wordCount > 0 && (
                <div style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600 }}>
                  {wordCount} từ · ~{readMins} phút đọc
                </div>
              )}
            </div>
          </div>
          <button onClick={handleCancelClick} style={{ background:'#f1f5f9', border:'none', width:36, height:36, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#475569', flexShrink:0 }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding:'0.75rem 1.8rem 0', borderBottom:'1px solid #f1f5f9', background:'#fff' }}>
          <div className="bm2-tabs">
            {[
              { key:'info', label:'Thông tin' },
              { key:'content', label:'Nội dung chi tiết' },
              { key:'cover', label:'Ảnh & Cài đặt' },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={tabStyle(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="bm2-body">

          {/* ── TAB: INFO ── */}
          {tab === 'info' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.2rem' }}>
              <div>
                <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151', display:'block', marginBottom:'0.5rem' }}>Tiêu đề bài viết *</label>
                <input
                  type="text"
                  value={blog.title || ''}
                  onChange={e => update('title', e.target.value)}
                  placeholder="Nhập tiêu đề hấp dẫn..."
                  style={{ ...inputStyle, fontSize:'1rem', fontWeight:700 }}
                  onFocus={e => e.target.style.borderColor='#6366f1'}
                  onBlur={e => e.target.style.borderColor='#e2e8f0'}
                />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
                <div>
                  <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151', display:'block', marginBottom:'0.5rem' }}>Danh mục</label>
                  <select
                    value={blog.category || ''}
                    onChange={e => update('category', e.target.value)}
                    style={{ ...inputStyle, cursor:'pointer' }}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151', display:'block', marginBottom:'0.5rem' }}>Ngày đăng</label>
                  <input
                    type="text"
                    value={blog.date || ''}
                    onChange={e => update('date', e.target.value)}
                    placeholder="VD: 05/06/2026"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor='#6366f1'}
                    onBlur={e => e.target.style.borderColor='#e2e8f0'}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151', display:'block', marginBottom:'0.5rem' }}>
                  Đoạn tóm tắt <span style={{ fontWeight:500, color:'#94a3b8' }}>(hiển thị ở lưới bài viết)</span>
                </label>
                <RichEditor
                  value={blog.excerpt || ''}
                  onChange={val => update('excerpt', val)}
                  placeholder="Tóm tắt ngắn gọn nội dung bài viết..."
                  minHeight={120}
                />
              </div>
            </div>
          )}

          {/* ── TAB: CONTENT ── */}
          {tab === 'content' && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
                <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151' }}>Nội dung bài viết đầy đủ</label>
                <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                  <span style={{ fontSize:'0.75rem', color:'#94a3b8', fontWeight:600 }}>{wordCount} từ · ~{readMins} phút đọc</span>
                </div>
              </div>
              <RichEditor
                value={blog.content || ''}
                onChange={val => update('content', val)}
                placeholder="Bắt đầu viết nội dung... Dùng toolbar để định dạng, chèn ảnh hoặc video."
                minHeight={460}
              />
              <p style={{ fontSize:'0.78rem', color:'#94a3b8', marginTop:'0.5rem' }}>
                Hỗ trợ: In đậm, in nghiêng, tiêu đề, danh sách, bảng, liên kết, ảnh tải lên, video tải lên và nhúng YouTube.
              </p>
            </div>
          )}

          {/* ── TAB: COVER & SETTINGS ── */}
          {tab === 'cover' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'1.4rem' }}>
              {/* Cover image */}
              <div>
                <label style={{ fontWeight:700, fontSize:'0.85rem', color:'#374151', display:'block', marginBottom:'0.75rem' }}>Ảnh bìa bài viết</label>
                <div style={{ border:'2px dashed #e2e8f0', borderRadius:14, padding:'1.5rem', background:'#f8fafc', display:'flex', flexDirection:'column', alignItems:'center', gap:'1rem' }}>
                  {blog.coverImage && (
                    <div style={{ position:'relative', width:'100%', maxWidth:420 }}>
                      <img src={blog.coverImage} alt="cover" style={{ width:'100%', height:180, objectFit:'cover', borderRadius:10, border:'1px solid #e2e8f0', display:'block' }} />
                      <button onClick={() => update('coverImage', '')} style={{ position:'absolute', top:8, right:8, background:'rgba(239,68,68,0.9)', border:'none', color:'#fff', width:28, height:28, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <FiX size={14} />
                      </button>
                    </div>
                  )}
                  <label style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', background:'#6366f1', color:'#fff', padding:'0.7rem 1.5rem', borderRadius:'10px', fontWeight:700, fontSize:'0.88rem' }}>
                    <FiUploadCloud size={16} />
                    {loading ? 'Đang tải...' : (blog.coverImage ? 'Đổi ảnh bìa' : 'Tải ảnh bìa lên')}
                    <input
                      type="file" accept="image/*" style={{ display:'none' }} disabled={loading}
                      onChange={async e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setLoading(true);
                        const res = await uploadFileToStorage(file, 'assets');
                        setLoading(false);
                        if (!res.error) update('coverImage', res.url);
                        else setNotification({ open:true, type:'error', title:'Lỗi', message:res.error.message });
                      }}
                    />
                  </label>
                  <p style={{ fontSize:'0.78rem', color:'#94a3b8', margin:0, textAlign:'center' }}>Khuyến nghị: ảnh ngang 1200×630px, dưới 2MB</p>
                </div>
              </div>

              {/* Settings */}
              <div style={{ background:'#f8fafc', borderRadius:14, padding:'1.2rem', border:'1px solid #f1f5f9' }}>
                <p style={{ fontSize:'0.82rem', fontWeight:800, color:'#374151', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'1rem' }}>Cài đặt xuất bản</p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
                  {[
                    { field:'isPinned', label:'Ghim bài viết (hiện đầu tiên)', color:'#d97706' },
                    { field:'isDraft', label:'Lưu nháp (không hiển thị công khai)', color:'#64748b' },
                    { field:'isHidden', label:'Ẩn bài viết khỏi trang Blog', color:'#ef4444' },
                  ].map(opt => (
                    <label key={opt.field} style={{ display:'flex', alignItems:'center', gap:'1rem', cursor:'pointer', padding:'0.65rem 0.9rem', background:'#fff', borderRadius:10, border:'1.5px solid', borderColor: blog[opt.field] ? opt.color : '#f1f5f9', transition:'all 0.18s' }}>
                      <button
                        type="button"
                        onClick={() => update(opt.field, !blog[opt.field])}
                        style={{ width:42, height:24, borderRadius:12, border:'none', cursor:'pointer', background: blog[opt.field] ? opt.color : '#cbd5e1', position:'relative', transition:'background 0.2s', padding:0, flexShrink:0 }}
                      >
                        <span style={{ position:'absolute', top:3, left: blog[opt.field] ? 21 : 3, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.2)', display:'block' }} />
                      </button>
                      <span style={{ fontWeight: blog[opt.field] ? 700 : 500, color: blog[opt.field] ? opt.color : '#64748b', fontSize:'0.88rem' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bm2-footer">
          <div style={{ display:'flex', gap:'0.5rem', alignItems:'center', flexWrap:'wrap' }}>
            {blog.isDraft && <span style={{ fontSize:'0.75rem', background:'#f1f5f9', color:'#64748b', padding:'0.25rem 0.75rem', borderRadius:99, fontWeight:700 }}>Bản nháp</span>}
            {blog.isPinned && <span style={{ fontSize:'0.75rem', background:'#fef3c7', color:'#d97706', padding:'0.25rem 0.75rem', borderRadius:99, fontWeight:700 }}>Đã ghim</span>}
            {blog.isHidden && <span style={{ fontSize:'0.75rem', background:'#fee2e2', color:'#ef4444', padding:'0.25rem 0.75rem', borderRadius:99, fontWeight:700 }}>Đang ẩn</span>}
          </div>
          <div style={{ display:'flex', gap:'0.75rem', marginLeft:'auto' }}>
            <button type="button" onClick={handleCancelClick} style={{ padding:'0.75rem 1.6rem', background:'#f1f5f9', color:'#475569', border:'1.5px solid #e2e8f0', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>
              Hủy bỏ
            </button>
            <button type="button" onClick={handleSubmit} style={{ padding:'0.75rem 2rem', background:'linear-gradient(135deg,#10b981,#059669)', color:'#fff', border:'none', borderRadius:10, fontWeight:800, cursor:'pointer', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:7, boxShadow:'0 4px 14px rgba(16,185,129,0.3)' }}>
              <FiCheck size={17} /> Lưu Bài Viết
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Dữ liệu chưa được lưu!"
        message="Bài viết đang soạn dở sẽ bị hủy nếu bạn thoát ngay bây giờ. Bạn có chắc chắn muốn thoát không?"
        onConfirm={onClose}
        onCancel={() => setShowConfirm(false)}
        confirmText="Vẫn thoát"
        cancelText="Ở lại"
      />
    </div>
  );
};

export default BlogModal;