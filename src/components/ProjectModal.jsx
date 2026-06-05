import React, { useState, useRef, useCallback } from 'react';
import {
  FiX, FiCheck, FiPlus, FiTrash2, FiUploadCloud, FiMove,
  FiChevronUp, FiChevronDown, FiEdit3, FiEdit, FiImage,
  FiVideo, FiType, FiGrid, FiPaperclip, FiBarChart2,
  FiChevronRight, FiChevronsRight, FiAlertTriangle,
  FiEye, FiEyeOff, FiLink, FiLayers
} from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import { uploadFileToStorage } from '../utils/supabaseClient';
import ConfirmModal from './ConfirmModal';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
const uid = () => `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const BLOCK_TYPES = [
  { type: 'text',  icon: FiType,      label: 'Văn bản'   },
  { type: 'image', icon: FiImage,     label: 'Hình ảnh'  },
  { type: 'table', icon: FiGrid,      label: 'Bảng dữ liệu' },
  { type: 'file',  icon: FiPaperclip, label: 'Tệp đính kèm' },
  { type: 'chart', icon: FiBarChart2, label: 'Biểu đồ'   },
];

const emptySection = (type = 'text', parentId = null) => ({
  id: uid(),
  title: '',
  type,
  parentId,
  textContent: '',
  images: [],
  files: [],
  tableData: { headers: ['Cột 1', 'Cột 2', 'Cột 3'], rows: [['', '', '']] },
  chartData: [{ label: 'Mục 1', value: 80 }],
  chartType: 'bar',
});

/* ─────────────────────────────────────────
   INLINE RICH TEXT với chèn ảnh / video
───────────────────────────────────────── */
function RichEditor({ value, onChange, onUploadImage }) {
  const ref = useRef(null);
  const fileRef = useRef(null);

  const exec = (cmd, val = null) => {
    document.execCommand(cmd, false, val);
    ref.current?.focus();
    onChange(ref.current?.innerHTML || '');
  };

  const insertHtml = (html) => {
    ref.current?.focus();
    document.execCommand('insertHTML', false, html);
    onChange(ref.current?.innerHTML || '');
  };

  const handleImageUpload = async (file) => {
    const res = await onUploadImage(file);
    if (res?.url) {
      insertHtml(`<img src="${res.url}" alt="" style="max-width:100%;border-radius:8px;margin:0.5rem 0;" />`);
    }
  };

  const handleVideoUrl = () => {
    const url = window.prompt('Nhập URL video (YouTube embed hoặc link trực tiếp):');
    if (!url) return;
    const isYT = url.includes('youtube.com') || url.includes('youtu.be');
    if (isYT) {
      const id = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
      if (id) {
        insertHtml(`<div style="position:relative;padding-top:56.25%;margin:0.75rem 0;"><iframe src="https://www.youtube.com/embed/${id}" style="position:absolute;inset:0;width:100%;height:100%;border-radius:8px;border:none;" allowfullscreen></iframe></div>`);
      }
    } else {
      insertHtml(`<video src="${url}" controls style="max-width:100%;border-radius:8px;margin:0.5rem 0;"></video>`);
    }
  };

  const BTN = ({ onClick, title, children }) => (
    <button type="button" title={title} onClick={onClick}
      style={{ padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center', fontSize: '0.85rem' }}>
      {children}
    </button>
  );

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#fff' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '3px', padding: '0.5rem 0.625rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', alignItems: 'center' }}>
        <BTN onClick={() => exec('bold')} title="Đậm"><b>B</b></BTN>
        <BTN onClick={() => exec('italic')} title="Nghiêng"><i>I</i></BTN>
        <BTN onClick={() => exec('underline')} title="Gạch chân"><u>U</u></BTN>
        <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 3px' }} />
        <BTN onClick={() => exec('formatBlock', 'H3')} title="Tiêu đề lớn">H1</BTN>
        <BTN onClick={() => exec('formatBlock', 'H4')} title="Tiêu đề nhỏ">H2</BTN>
        <BTN onClick={() => exec('formatBlock', 'P')} title="Đoạn văn">P</BTN>
        <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 3px' }} />
        <BTN onClick={() => exec('insertUnorderedList')} title="Danh sách •">• –</BTN>
        <BTN onClick={() => exec('insertOrderedList')} title="Danh sách số">1.</BTN>
        <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 3px' }} />
        {/* Chèn ảnh */}
        <label title="Chèn ảnh" style={{ padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
          <FiImage size={14} />
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleImageUpload(e.target.files[0]); e.target.value = ''; }} />
        </label>
        {/* Chèn video */}
        <BTN onClick={handleVideoUrl} title="Chèn video"><FiVideo size={14} /></BTN>
        {/* Chèn link */}
        <BTN onClick={() => { const url = window.prompt('URL:'); if (url) exec('createLink', url); }} title="Chèn link"><FiLink size={14} /></BTN>
      </div>

      {/* Content area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={e => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ padding: '0.875rem 1rem', minHeight: '130px', outline: 'none', lineHeight: '1.75', fontSize: '0.9rem', color: '#374151' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   EXCEL-LIKE TABLE EDITOR
───────────────────────────────────────── */
function TableEditor({ tableData, onChange }) {
  const { headers = [], rows = [] } = tableData;

  const update = (newHeaders, newRows) => onChange({ headers: newHeaders, rows: newRows });

  const addRow = () => update(headers, [...rows, headers.map(() => '')]);
  const removeRow = (ri) => update(headers, rows.filter((_, i) => i !== ri));
  const addCol = () => {
    update(
      [...headers, `Cột ${headers.length + 1}`],
      rows.map(r => [...r, ''])
    );
  };
  const removeCol = (ci) => {
    update(headers.filter((_, i) => i !== ci), rows.map(r => r.filter((_, i) => i !== ci)));
  };
  const moveCol = (ci, dir) => {
    const ni = ci + dir;
    if (ni < 0 || ni >= headers.length) return;
    const newH = [...headers];
    [newH[ci], newH[ni]] = [newH[ni], newH[ci]];
    const newR = rows.map(r => { const nr = [...r]; [nr[ci], nr[ni]] = [nr[ni], nr[ci]]; return nr; });
    update(newH, newR);
  };
  const moveRow = (ri, dir) => {
    const ni = ri + dir;
    if (ni < 0 || ni >= rows.length) return;
    const newR = [...rows];
    [newR[ri], newR[ni]] = [newR[ni], newR[ri]];
    update(headers, newR);
  };
  const updateHeader = (ci, val) => { const h = [...headers]; h[ci] = val; update(h, rows); };
  const updateCell = (ri, ci, val) => {
    const newR = rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    update(headers, newR);
  };

  const CELL_W = 140;

  return (
    <div>
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: `${(headers.length + 1) * (CELL_W + 2)}px`, width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9' }}>
              {/* Row control col */}
              <th style={{ width: '36px', padding: '0.5rem', borderBottom: '2px solid #e2e8f0' }} />
              {headers.map((h, ci) => (
                <th key={ci} style={{ padding: '0.4rem 0.3rem', borderBottom: '2px solid #e2e8f0', minWidth: `${CELL_W}px` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <input
                      value={h}
                      onChange={e => updateHeader(ci, e.target.value)}
                      style={{ width: '100%', padding: '0.3rem 0.5rem', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#fff', textAlign: 'center', boxSizing: 'border-box' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '2px' }}>
                      <button type="button" onClick={() => moveCol(ci, -1)} disabled={ci === 0} title="Dịch trái" style={{ padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.7rem', opacity: ci === 0 ? 0.3 : 1 }}>←</button>
                      <button type="button" onClick={() => moveCol(ci, 1)} disabled={ci === headers.length - 1} title="Dịch phải" style={{ padding: '2px 4px', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.7rem', opacity: ci === headers.length - 1 ? 0.3 : 1 }}>→</button>
                      <button type="button" onClick={() => removeCol(ci)} disabled={headers.length <= 1} title="Xóa cột" style={{ padding: '2px 4px', border: '1px solid #fecaca', borderRadius: '4px', background: '#fff', cursor: 'pointer', color: '#ef4444', fontSize: '0.7rem', opacity: headers.length <= 1 ? 0.3 : 1 }}>✕</button>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                {/* Row controls */}
                <td style={{ padding: '0.3rem', borderRight: '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    <button type="button" onClick={() => moveRow(ri, -1)} disabled={ri === 0} title="Lên" style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.65rem', opacity: ri === 0 ? 0.3 : 1 }}>↑</button>
                    <button type="button" onClick={() => moveRow(ri, 1)} disabled={ri === rows.length - 1} title="Xuống" style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.65rem', opacity: ri === rows.length - 1 ? 0.3 : 1 }}>↓</button>
                    <button type="button" onClick={() => removeRow(ri)} disabled={rows.length <= 1} title="Xóa hàng" style={{ padding: '1px 4px', border: '1px solid #fecaca', borderRadius: '3px', background: '#fff', cursor: 'pointer', color: '#ef4444', fontSize: '0.65rem', opacity: rows.length <= 1 ? 0.3 : 1 }}>✕</button>
                  </div>
                </td>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '0.3rem', verticalAlign: 'top' }}>
                    <textarea
                      value={cell}
                      onChange={e => updateCell(ri, ci, e.target.value)}
                      rows={2}
                      style={{ width: '100%', padding: '0.4rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.82rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit', lineHeight: '1.5', boxSizing: 'border-box', minHeight: '54px' }}
                      onFocus={e => e.target.style.borderColor = '#93c5fd'}
                      onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
        <button type="button" onClick={addRow}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.875rem', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          <FiPlus size={13} /> Thêm hàng
        </button>
        <button type="button" onClick={addCol}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.4rem 0.875rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
          <FiPlus size={13} /> Thêm cột
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SECTION EDITOR
───────────────────────────────────────── */
function SectionEditor({ sec, index, total, onUpdate, onRemove, onMove, onAddChild, setNotification }) {
  const [collapsed, setCollapsed] = useState(false);
  const isChild = !!sec.parentId;

  const upd = (patch) => onUpdate({ ...sec, ...patch });

  const handleImageUpload = async (file) => {
    const res = await uploadFileToStorage(file, 'assets');
    if (res.error) { setNotification({ open: true, type: 'error', title: 'Lỗi', message: res.error.message }); return null; }
    return res;
  };

  const addImage = async (file) => {
    const res = await handleImageUpload(file);
    if (res?.url) upd({ images: [...(sec.images || []), { url: res.url, caption: '' }] });
  };

  const addFile = async (file) => {
    const res = await handleImageUpload(file);
    if (res?.url) upd({ files: [...(sec.files || []), { url: res.url, name: file.name }] });
  };

  const TypeIcon = BLOCK_TYPES.find(b => b.type === sec.type)?.icon || FiType;

  return (
    <div style={{
      border: '1.5px solid',
      borderColor: isChild ? '#dbeafe' : '#e2e8f0',
      borderRadius: '12px',
      backgroundColor: isChild ? '#f8fbff' : '#fff',
      marginLeft: isChild ? '1.5rem' : '0',
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: isChild ? '#eff6ff' : '#f8fafc', borderBottom: collapsed ? 'none' : '1px solid #f1f5f9', cursor: 'pointer' }}
        onClick={() => setCollapsed(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: isChild ? '#dbeafe' : '#e2e8f0', borderRadius: '6px', flexShrink: 0, color: '#2563eb' }}>
          <TypeIcon size={14} />
        </div>

        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sec.title || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa đặt tiêu đề</span>}
        </span>

        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {!isChild && (
            <button type="button" onClick={() => onAddChild(sec.id)} title="Thêm mục con"
              style={{ padding: '4px 6px', border: '1px solid #bfdbfe', borderRadius: '5px', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <FiChevronsRight size={11} /> Con
            </button>
          )}
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0} title="Lên"
            style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', color: '#475569', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }}>
            <FiChevronUp size={13} />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index >= total - 1} title="Xuống"
            style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', color: '#475569', cursor: 'pointer', opacity: index >= total - 1 ? 0.3 : 1 }}>
            <FiChevronDown size={13} />
          </button>
          <button type="button" onClick={() => onRemove(sec.id)} title="Xóa"
            style={{ padding: '4px 6px', border: '1px solid #fecaca', borderRadius: '5px', background: '#fff', color: '#ef4444', cursor: 'pointer' }}>
            <FiTrash2 size={13} />
          </button>
          <div style={{ padding: '4px 5px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            {collapsed ? <FiChevronDown size={14} /> : <FiChevronUp size={14} />}
          </div>
        </div>
      </div>

      {/* Body */}
      {!collapsed && (
        <div style={{ padding: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', marginBottom: '0.875rem', alignItems: 'start' }}>
            {/* Tiêu đề */}
            <input
              type="text"
              placeholder="Tiêu đề mục..."
              value={sec.title}
              onChange={e => upd({ title: e.target.value })}
              style={{ padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, outline: 'none', width: '100%', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#93c5fd'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
            {/* Loại block */}
            <select
              value={sec.type}
              onChange={e => upd({ type: e.target.value })}
              style={{ padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', cursor: 'pointer' }}
            >
              {BLOCK_TYPES.map(b => <option key={b.type} value={b.type}>{b.label}</option>)}
            </select>
          </div>

          {/* ── TEXT ── */}
          {sec.type === 'text' && (
            <RichEditor
              value={sec.textContent || ''}
              onChange={val => upd({ textContent: val })}
              onUploadImage={handleImageUpload}
            />
          )}

          {/* ── IMAGE ── */}
          {sec.type === 'image' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {(sec.images || []).map((img, idx) => (
                <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={img.url} alt="" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain', display: 'block', backgroundColor: '#f0f4f8' }} />
                    <button type="button" onClick={() => upd({ images: sec.images.filter((_, i) => i !== idx) })}
                      style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FiX size={13} />
                    </button>
                  </div>
                  <div style={{ padding: '0.625rem' }}>
                    <input
                      type="text"
                      placeholder="Ghi chú / caption ảnh..."
                      value={img.caption || ''}
                      onChange={e => { const imgs = [...sec.images]; imgs[idx] = { ...img, caption: e.target.value }; upd({ images: imgs }); }}
                      style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', color: '#475569', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}>
                <FiUploadCloud size={16} color="#2563eb" /> Tải ảnh lên
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => { for (const f of Array.from(e.target.files)) await addImage(f); e.target.value = ''; }} />
              </label>
            </div>
          )}

          {/* ── TABLE ── */}
          {sec.type === 'table' && (
            <TableEditor tableData={sec.tableData || { headers: [], rows: [] }} onChange={tableData => upd({ tableData })} />
          )}

          {/* ── FILE ── */}
          {sec.type === 'file' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {(sec.files || []).map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPaperclip size={13} color="#2563eb" /> {file.name}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={file.name}
                      onChange={e => { const files = [...sec.files]; files[idx] = { ...file, name: e.target.value }; upd({ files }); }}
                      placeholder="Tên hiển thị"
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', width: '160px' }}
                    />
                    <button type="button" onClick={() => upd({ files: sec.files.filter((_, i) => i !== idx) })}
                      style={{ padding: '4px 8px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', color: '#475569', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}>
                <FiUploadCloud size={16} color="#2563eb" /> Tải tệp lên
                <input type="file" multiple style={{ display: 'none' }} onChange={async e => { for (const f of Array.from(e.target.files)) await addFile(f); e.target.value = ''; }} />
              </label>
            </div>
          )}

          {/* ── CHART ── */}
          {sec.type === 'chart' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Loại biểu đồ:</label>
                <select value={sec.chartType || 'bar'} onChange={e => upd({ chartType: e.target.value })}
                  style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 700, outline: 'none', backgroundColor: '#f8fafc' }}>
                  <option value="bar">Cột (Bar)</option>
                  <option value="line">Đường (Line)</option>
                </select>
              </div>
              {(sec.chartData || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Nhãn"
                    value={item.label}
                    onChange={e => { const d = [...sec.chartData]; d[idx] = { ...item, label: e.target.value }; upd({ chartData: d }); }}
                    style={{ flex: 1, padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }}
                  />
                  <input
                    type="number"
                    min="0" max="100"
                    placeholder="%"
                    value={item.value}
                    onChange={e => { const d = [...sec.chartData]; d[idx] = { ...item, value: Number(e.target.value) }; upd({ chartData: d }); }}
                    style={{ width: '80px', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', textAlign: 'center' }}
                  />
                  <button type="button" onClick={() => upd({ chartData: sec.chartData.filter((_, i) => i !== idx) })}
                    style={{ padding: '6px 8px', border: '1px solid #fecaca', borderRadius: '7px', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <FiTrash2 size={13} />
                  </button>
                </div>
              ))}
              <button type="button"
                onClick={() => upd({ chartData: [...(sec.chartData || []), { label: `Mục ${(sec.chartData || []).length + 1}`, value: 50 }] })}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}>
                <FiPlus size={13} /> Thêm mục
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN MODAL
───────────────────────────────────────── */
const ProjectModal = ({ mode, initialData, onClose, onSave, setNotification }) => {
  const [project, setProject] = useState(() => ({
    title: '', slug: '', category: '', client: '', duration: '',
    metric: '', demoUrl: '', coverImage: '', description: '',
    technologies: [], isPinned: false, isHidden: false,
    sections: [],
    ...initialData,
  }));
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'sections'
  const [techInput, setTechInput] = useState('');

  const upd = (patch) => { setProject(p => ({ ...p, ...patch })); setIsDirty(true); };

  /* Auto generate slug from title */
  const handleTitleChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    upd({ title: val, slug: project.slug || slug });
  };

  /* Technologies tags */
  const addTech = () => {
    const t = techInput.trim();
    if (t && !(project.technologies || []).includes(t)) {
      upd({ technologies: [...(project.technologies || []), t] });
    }
    setTechInput('');
  };
  const removeTech = (t) => upd({ technologies: project.technologies.filter(x => x !== t) });

  /* Section management */
  const flatSections = project.sections || [];

  const addSection = (type = 'text', parentId = null) => {
    const sec = emptySection(type, parentId);
    upd({ sections: [...flatSections, sec] });
  };

  const updateSection = (updated) => {
    upd({ sections: flatSections.map(s => s.id === updated.id ? updated : s) });
  };

  const removeSection = (id) => {
    upd({ sections: flatSections.filter(s => s.id !== id && s.parentId !== id) });
  };

  const moveSection = (index, dir) => {
    const roots = flatSections.filter(s => !s.parentId);
    const ni = index + dir;
    if (ni < 0 || ni >= roots.length) return;
    const newRoots = [...roots];
    [newRoots[index], newRoots[ni]] = [newRoots[ni], newRoots[index]];
    const children = flatSections.filter(s => s.parentId);
    upd({ sections: [...newRoots, ...children] });
  };

  const handleUploadCover = async (file) => {
    setUploading(true);
    const res = await uploadFileToStorage(file, 'assets');
    setUploading(false);
    if (res.error) { setNotification({ open: true, type: 'error', title: 'Lỗi', message: res.error.message }); return; }
    upd({ coverImage: res.url });
  };

  const handleSave = () => {
    if (!project.title.trim()) {
      setNotification({ open: true, type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên dự án.' });
      return;
    }
    if (!project.slug.trim()) {
      setNotification({ open: true, type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập slug dự án.' });
      return;
    }
    setIsDirty(false);
    onSave(project);
  };

  const handleClose = () => { if (isDirty) setShowConfirm(true); else onClose(); };

  /* Roots & children */
  const roots = flatSections.filter(s => !s.parentId);

  const TABS = [
    { id: 'basic', label: 'Thông tin chung' },
    { id: 'sections', label: `Nội dung (${flatSections.length})` },
  ];

  const INPUT_STYLE = {
    width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
      <style>{`
        .pm-wrap { background:#fff; border-radius:16px; width:100%; max-width:900px; max-height:95vh; display:flex; flex-direction:column; box-shadow:0 30px 60px rgba(0,0,0,0.25); }
        .pm-body { flex:1; overflow-y:auto; padding:1.5rem; }
        .pm-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; }
        .pm-grid-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.875rem; }
        .pm-label { display:block; font-size:0.78rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.35rem; }
        .pm-input:focus { border-color:#93c5fd !important; box-shadow:0 0 0 3px rgba(37,99,235,0.08); }
        @media (max-width:640px) {
          .pm-wrap { max-height:100vh; border-radius:12px; }
          .pm-grid-2, .pm-grid-3 { grid-template-columns:1fr; }
          .pm-body { padding:1rem; }
        }
      `}</style>

      <div className="pm-wrap">
        {/* ── HEADER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem 1.5rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'add' ? <><FiEdit3 size={18} color="#2563eb" /> Thêm dự án mới</> : <><FiEdit size={18} color="#10b981" /> Chỉnh sửa dự án</>}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiX size={22} />
          </button>
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 800 : 600,
                color: activeTab === tab.id ? '#2563eb' : '#64748b',
                borderBottom: activeTab === tab.id ? '2.5px solid #2563eb' : '2.5px solid transparent',
                transition: 'all 0.2s',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── BODY ── */}
        <div className="pm-body">

          {/* ════ TAB: THÔNG TIN CHUNG ════ */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Tên + Slug */}
              <div className="pm-grid-2">
                <div>
                  <label className="pm-label">Tên dự án *</label>
                  <input className="pm-input" style={INPUT_STYLE} type="text" placeholder="Tên dự án..." value={project.title} onChange={e => handleTitleChange(e.target.value)} />
                </div>
                <div>
                  <label className="pm-label">Slug (URL) *</label>
                  <input className="pm-input" style={INPUT_STYLE} type="text" placeholder="ten-du-an" value={project.slug} onChange={e => upd({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                </div>
              </div>

              {/* Category + Client */}
              <div className="pm-grid-2">
                <div>
                  <label className="pm-label">Ngành nghề (Category)</label>
                  <input className="pm-input" style={INPUT_STYLE} type="text" placeholder="FINTECH, HEALTHCARE..." value={project.category || ''} onChange={e => upd({ category: e.target.value })} />
                </div>
                <div>
                  <label className="pm-label">Khách hàng (Client)</label>
                  <input className="pm-input" style={INPUT_STYLE} type="text" placeholder="Tên khách hàng / công ty" value={project.client || ''} onChange={e => upd({ client: e.target.value })} />
                </div>
              </div>

              {/* Duration + Metric + Demo */}
              <div className="pm-grid-3">
                <div>
                  <label className="pm-label">Thời gian triển khai</label>
                  <input className="pm-input" style={INPUT_STYLE} type="text" placeholder="Q1/2024 – Q3/2024" value={project.duration || ''} onChange={e => upd({ duration: e.target.value })} />
                </div>
                <div>
                  <label className="pm-label">Chỉ số nổi bật (Metric)</label>
                  <input className="pm-input" style={INPUT_STYLE} type="text" placeholder="98.5% Uptime, -40% Bug..." value={project.metric || ''} onChange={e => upd({ metric: e.target.value })} />
                </div>
                <div>
                  <label className="pm-label">Link Demo</label>
                  <input className="pm-input" style={INPUT_STYLE} type="url" placeholder="https://..." value={project.demoUrl || ''} onChange={e => upd({ demoUrl: e.target.value })} />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="pm-label">Mô tả ngắn (hiển thị trên card)</label>
                <RichEditor
                  value={project.description || ''}
                  onChange={val => upd({ description: val })}
                  onUploadImage={async (file) => { const res = await uploadFileToStorage(file, 'assets'); return res; }}
                />
              </div>

              {/* Technologies */}
              <div>
                <label className="pm-label">Công nghệ & Công cụ</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <input
                    style={{ ...INPUT_STYLE, flex: 1 }}
                    type="text"
                    placeholder="Nhập công nghệ rồi Enter (VD: Figma, SQL...)"
                    value={techInput}
                    onChange={e => setTechInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
                  />
                  <button type="button" onClick={addTech}
                    style={{ padding: '0.65rem 1rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                    <FiPlus size={15} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(project.technologies || []).map(t => (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.25rem 0.625rem', fontSize: '0.78rem', fontWeight: 700 }}>
                      {t}
                      <button type="button" onClick={() => removeTech(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0, display: 'flex', alignItems: 'center' }}>
                        <FiX size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Ảnh bìa */}
              <div>
                <label className="pm-label">Ảnh bìa dự án</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1.5px dashed #cbd5e1', flexWrap: 'wrap' }}>
                  {project.coverImage && (
                    <div style={{ position: 'relative' }}>
                      <img src={project.coverImage} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <button type="button" onClick={() => upd({ coverImage: '' })}
                        style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX size={11} />
                      </button>
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.6rem 1.125rem', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                    <FiUploadCloud size={15} color="#2563eb" /> {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={e => { if (e.target.files[0]) handleUploadCover(e.target.files[0]); e.target.value = ''; }} />
                  </label>
                </div>
              </div>

              {/* Flags */}
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'isPinned', label: 'Ghim nổi bật', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
                  { key: 'isHidden', label: 'Ẩn dự án', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0' },
                ].map(({ key, label, color, bg, border }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <div
                      onClick={() => upd({ [key]: !project[key] })}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px', position: 'relative', transition: 'background 0.2s',
                        backgroundColor: project[key] ? color : '#cbd5e1', cursor: 'pointer',
                      }}
                    >
                      <div style={{ position: 'absolute', top: '3px', left: project[key] ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: project[key] ? color : '#94a3b8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ════ TAB: NỘI DUNG / MỤC LỤC ════ */}
          {activeTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Add buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#94a3b8', alignSelf: 'center', marginRight: '0.25rem' }}>Thêm mục:</span>
                {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                  <button key={type} type="button" onClick={() => addSection(type)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.75rem', backgroundColor: '#fff', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}>
                    <Icon size={12} /> {label}
                  </button>
                ))}
              </div>

              {/* Section list */}
              {roots.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #e2e8f0' }}>
                  <FiLayers size={28} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>Chưa có mục nào. Nhấn nút bên trên để thêm.</p>
                </div>
              )}

              {roots.map((sec, idx) => {
                const children = flatSections.filter(s => s.parentId === sec.id);
                return (
                  <div key={sec.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <SectionEditor
                      sec={sec}
                      index={idx}
                      total={roots.length}
                      onUpdate={updateSection}
                      onRemove={removeSection}
                      onMove={moveSection}
                      onAddChild={(parentId) => addSection('text', parentId)}
                      setNotification={setNotification}
                    />
                    {/* Children */}
                    {children.map((child, ci) => (
                      <SectionEditor
                        key={child.id}
                        sec={child}
                        index={ci}
                        total={children.length}
                        onUpdate={updateSection}
                        onRemove={removeSection}
                        onMove={(i, dir) => {
                          const ni = i + dir;
                          if (ni < 0 || ni >= children.length) return;
                          const newChildren = [...children];
                          [newChildren[i], newChildren[ni]] = [newChildren[ni], newChildren[i]];
                          const others = flatSections.filter(s => s.parentId !== sec.id && !s.parentId);
                          upd({ sections: [...others, ...newChildren].flat() });
                        }}
                        onAddChild={() => {}}
                        setNotification={setNotification}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', flexShrink: 0, gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {flatSections.length} mục nội dung • {isDirty && <span style={{ color: '#f59e0b', fontWeight: 700 }}>Chưa lưu</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={handleClose}
              style={{ padding: '0.65rem 1.5rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              Hủy
            </button>
            <button type="button" onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.65rem 2rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
              <FiCheck size={16} /> Lưu dự án
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirm}
        title="Dữ liệu chưa được lưu!"
        message="Bạn đang chỉnh sửa dự án. Nếu thoát ra bây giờ, tất cả thay đổi sẽ bị mất."
        onConfirm={onClose}
        onCancel={() => setShowConfirm(false)}
        confirmText="Vẫn thoát"
        cancelText="Ở lại"
      />
    </div>
  );
};

export default ProjectModal;