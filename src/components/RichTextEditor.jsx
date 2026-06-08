import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter,
  FiAlignRight, FiList, FiLink, FiImage, FiTable, FiTrash2, FiX,
  FiChevronDown, FiType, FiDroplet, FiCode, FiMinus,
} from 'react-icons/fi';
import { uploadFileToStorage } from '../utils/supabaseClient';

/* ─────────── helpers ─────────── */
const uid = () => Math.random().toString(36).slice(2, 8);

function Dropdown({ label, children, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', cursor: 'pointer', fontSize: '0.78rem', color: '#374151', whiteSpace: 'nowrap' }}
      >
        {Icon && <Icon size={13} />} {label} <FiChevronDown size={10} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 9999, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '160px', padding: '0.25rem 0' }}
          onClick={() => setOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
}

function DropItem({ onClick, children, style = {} }) {
  return (
    <button type="button" onClick={onClick}
      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '0.45rem 0.875rem', cursor: 'pointer', fontSize: '0.82rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.1s', ...style }}
      onMouseOver={e => e.currentTarget.style.backgroundColor = '#f1f5f9'}
      onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
      {children}
    </button>
  );
}

function Divider() {
  return <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 2px', alignSelf: 'center' }} />;
}

/* ─────────── Image Insert Dialog ─────────── */
function ImageDialog({ onConfirm, onClose }) {
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState('center');
  const [width, setWidth] = useState('100%');
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>Chèn ảnh từ URL</h4>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><FiX size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>URL ảnh *</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Caption (tuỳ chọn)</label>
            <input type="text" value={caption} onChange={e => setCaption(e.target.value)} placeholder="Chú thích ảnh..." style={{ width: '100%', padding: '0.55rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Canh lề</label>
              <select value={align} onChange={e => setAlign(e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }}>
                <option value="left">Trái</option>
                <option value="center">Giữa</option>
                <option value="right">Phải</option>
                <option value="full">Full width</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Độ rộng</label>
              <input type="text" value={width} onChange={e => setWidth(e.target.value)} placeholder="100%, 300px..." style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.55rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '7px', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>Hủy</button>
            <button type="button" disabled={!url} onClick={() => onConfirm({ url, caption, align, width })}
              style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '7px', background: url ? '#2563eb' : '#cbd5e1', cursor: url ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Chèn ảnh</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Table Draw Dialog ─────────── */
function TableDrawDialog({ onConfirm, onClose }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [hasHeader, setHasHeader] = useState(true);
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', width: '340px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>Vẽ bảng</h4>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><FiX size={18} /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Số hàng</label>
              <input type="number" min={1} max={20} value={rows} onChange={e => setRows(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.9rem', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Số cột</label>
              <input type="number" min={1} max={10} value={cols} onChange={e => setCols(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.9rem', outline: 'none', textAlign: 'center', boxSizing: 'border-box' }} />
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#374151' }}>
            <input type="checkbox" checked={hasHeader} onChange={e => setHasHeader(e.target.checked)} style={{ width: '16px', height: '16px' }} />
            Có hàng tiêu đề (header)
          </label>
          {/* Preview grid */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
              {hasHeader && (
                <thead>
                  <tr>
                    {Array.from({ length: Math.min(cols, 6) }).map((_, ci) => (
                      <th key={ci} style={{ border: '1px solid #cbd5e1', padding: '4px 8px', backgroundColor: '#f1f5f9', fontSize: '0.7rem', fontWeight: 700 }}>H{ci + 1}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {Array.from({ length: Math.min(rows, 4) }).map((_, ri) => (
                  <tr key={ri}>
                    {Array.from({ length: Math.min(cols, 6) }).map((_, ci) => (
                      <td key={ci} style={{ border: '1px solid #e2e8f0', padding: '4px 8px', fontSize: '0.7rem', backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>&nbsp;</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{ padding: '0.55rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '7px', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#475569' }}>Hủy</button>
            <button type="button" onClick={() => onConfirm({ rows, cols, hasHeader })}
              style={{ padding: '0.55rem 1.25rem', border: 'none', borderRadius: '7px', background: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Tạo bảng</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────── Color Picker ─────────── */
const COLORS = [
  '#000000','#374151','#6b7280','#9ca3af','#d1d5db','#ffffff',
  '#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e',
  '#10b981','#14b8a6','#06b6d4','#3b82f6','#6366f1','#8b5cf6',
  '#a855f7','#ec4899','#f43f5e','#0ea5e9','#1d4ed8','#7c3aed',
];

function ColorPicker({ onSelect, label, icon: Icon }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('#000000');
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button type="button" onClick={() => setOpen(v => !v)} title={label}
        style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', cursor: 'pointer' }}>
        <Icon size={13} />
        <FiChevronDown size={9} />
      </button>
      {open && (
        <div ref={null} style={{ position: 'absolute', top: '110%', left: 0, zIndex: 9999, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '0.75rem', width: '200px' }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '4px', marginBottom: '0.5rem' }}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => { onSelect(c); setOpen(false); }}
                style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: c, border: c === '#ffffff' ? '1px solid #e2e8f0' : 'none', cursor: 'pointer', transition: 'transform 0.1s' }}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
            <input type="color" value={custom} onChange={e => setCustom(e.target.value)} style={{ width: '28px', height: '28px', border: 'none', cursor: 'pointer', padding: 0, borderRadius: '4px' }} />
            <input type="text" value={custom} onChange={e => setCustom(e.target.value)} style={{ flex: 1, padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.78rem', outline: 'none' }} />
            <button type="button" onClick={() => { onSelect(custom); setOpen(false); }}
              style={{ padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#eff6ff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────── Numbering / TOC Style ─────────── */
const NUMBER_STYLES = [
  { label: '1. 2. 3.', value: 'decimal' },
  { label: 'A. B. C.', value: 'upper-alpha' },
  { label: 'a. b. c.', value: 'lower-alpha' },
  { label: 'I. II. III.', value: 'upper-roman' },
  { label: 'i. ii. iii.', value: 'lower-roman' },
  { label: '• –', value: 'disc' },
  { label: '◦ –', value: 'circle' },
  { label: '▪ –', value: 'square' },
];

/* ═══════════════════════════════════════════
   MAIN RICH TEXT EDITOR
═══════════════════════════════════════════ */
const RichTextEditor = ({ value, onChange, onUploadImage, compact = false }) => {
  const editorRef = useRef(null);
  const [showImgDialog, setShowImgDialog] = useState(false);
  const [showTableDialog, setShowTableDialog] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const emit = () => onChange(editorRef.current?.innerHTML || '');

  const exec = useCallback((cmd, val = null) => {
    document.execCommand(cmd, false, val);
    editorRef.current?.focus();
    emit();
  }, []);

  const insertHtml = useCallback((html) => {
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, html);
    emit();
  }, []);

  /* ── Xử lý ảnh upload ── */
  const handleFileUpload = async (file) => {
    if (onUploadImage) {
      const res = await onUploadImage(file);
      if (res?.url) return res.url;
    }
    // fallback: base64 preview
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const insertImageFromUpload = async (file) => {
    const url = await handleFileUpload(file);
    if (url) {
      insertHtml(`<figure style="margin:1rem 0;text-align:center;"><img src="${url}" alt="" style="max-width:100%;border-radius:8px;" /><figcaption style="font-size:0.82rem;color:#6b7280;margin-top:0.375rem;"></figcaption></figure>`);
    }
  };

  const insertImageFromDialog = ({ url, caption, align, width }) => {
    const textAlign = align === 'full' ? 'center' : align;
    const imgWidth = align === 'full' ? '100%' : width;
    const fig = `<figure style="margin:1rem 0;text-align:${textAlign};"><img src="${url}" alt="" style="max-width:100%;width:${imgWidth};border-radius:8px;" />${caption ? `<figcaption style="font-size:0.82rem;color:#6b7280;margin-top:0.375rem;">${caption}</figcaption>` : ''}</figure>`;
    insertHtml(fig);
    setShowImgDialog(false);
  };

  /* ── Vẽ bảng ── */
  const insertTable = ({ rows, cols, hasHeader }) => {
    let html = `<table style="width:100%;border-collapse:collapse;margin:1rem 0;">`;
    if (hasHeader) {
      html += `<thead><tr>`;
      for (let c = 0; c < cols; c++) html += `<th style="border:1px solid #cbd5e1;padding:0.5rem 0.75rem;background:#f1f5f9;font-weight:700;text-align:left;">Tiêu đề ${c + 1}</th>`;
      html += `</tr></thead>`;
    }
    html += `<tbody>`;
    for (let r = 0; r < rows; r++) {
      html += `<tr>`;
      for (let c = 0; c < cols; c++) html += `<td style="border:1px solid #e2e8f0;padding:0.5rem 0.75rem;"> </td>`;
      html += `</tr>`;
    }
    html += `</tbody></table>`;
    insertHtml(html);
    setShowTableDialog(false);
  };

  /* ── Import Word ── */
  const handleWordImport = async (file) => {
    try {
      const mammoth = await import('https://cdn.jsdelivr.net/npm/mammoth@1.7.2/mammoth.browser.min.js').catch(() => null);
      if (!mammoth) {
        // fallback: thông báo
        alert('Tính năng import Word cần cài thêm thư viện mammoth. Đang thử phương pháp khác...');
        return;
      }
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      insertHtml(result.value);
    } catch {
      alert('Không thể import file Word. Vui lòng thử lại hoặc copy nội dung thủ công.');
    }
  };

  /* ── Chèn link ── */
  const insertLink = () => {
    const url = window.prompt('Nhập URL liên kết:', 'https://');
    if (!url) return;
    const text = window.getSelection()?.toString() || url;
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && !sel.isCollapsed) {
      exec('createLink', url);
    } else {
      insertHtml(`<a href="${url}" target="_blank" rel="noreferrer">${text}</a>`);
    }
  };

  const BTN = ({ onClick, title, active, children }) => (
    <button type="button" title={title} onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.3rem 0.45rem', border: `1px solid ${active ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '5px', background: active ? '#eff6ff' : '#fff', cursor: 'pointer', color: active ? '#2563eb' : '#374151', fontSize: '0.83rem', minWidth: '28px' }}>
      {children}
    </button>
  );

  return (
    <>
      <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', backgroundColor: '#fff', overflow: 'hidden' }}>
        {/* ── Toolbar ── */}
        <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.4rem 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '2px', alignItems: 'center' }}>

          {/* Font */}
          <Dropdown label="Font" icon={FiType}>
            {['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Trebuchet MS', 'Verdana', 'Tahoma', 'Impact'].map(f => (
              <DropItem key={f} onClick={() => exec('fontName', f)} style={{ fontFamily: f }}>{f}</DropItem>
            ))}
          </Dropdown>

          {/* Size */}
          <Dropdown label="Cỡ">
            {[1, 2, 3, 4, 5, 6, 7].map((s, i) => {
              const labels = ['8px', '10px', '12px', '14px', '18px', '24px', '36px'];
              return <DropItem key={s} onClick={() => exec('fontSize', s)}><span style={{ fontSize: labels[i] }}>{labels[i]}</span></DropItem>;
            })}
          </Dropdown>

          <Divider />

          {/* Heading */}
          <Dropdown label="Kiểu">
            <DropItem onClick={() => exec('formatBlock', 'P')}>Đoạn văn (P)</DropItem>
            <DropItem onClick={() => exec('formatBlock', 'H1')} style={{ fontSize: '1.1rem', fontWeight: 800 }}>Tiêu đề 1</DropItem>
            <DropItem onClick={() => exec('formatBlock', 'H2')} style={{ fontSize: '1rem', fontWeight: 700 }}>Tiêu đề 2</DropItem>
            <DropItem onClick={() => exec('formatBlock', 'H3')} style={{ fontSize: '0.95rem', fontWeight: 700 }}>Tiêu đề 3</DropItem>
            <DropItem onClick={() => exec('formatBlock', 'H4')} style={{ fontWeight: 600 }}>Tiêu đề 4</DropItem>
            <DropItem onClick={() => exec('formatBlock', 'BLOCKQUOTE')} style={{ borderLeft: '3px solid #2563eb', paddingLeft: '6px', color: '#475569' }}>Trích dẫn</DropItem>
            <DropItem onClick={() => exec('formatBlock', 'PRE')} style={{ fontFamily: 'monospace', background: '#f1f5f9' }}>Code block</DropItem>
          </Dropdown>

          <Divider />

          {/* B I U S */}
          <BTN onClick={() => exec('bold')} title="Đậm (Ctrl+B)"><b>B</b></BTN>
          <BTN onClick={() => exec('italic')} title="Nghiêng (Ctrl+I)"><i>I</i></BTN>
          <BTN onClick={() => exec('underline')} title="Gạch chân (Ctrl+U)"><u>U</u></BTN>
          <BTN onClick={() => exec('strikeThrough')} title="Gạch ngang"><s>S</s></BTN>
          <BTN onClick={() => exec('superscript')} title="Mũ / Lũy thừa (x²)">x²</BTN>
          <BTN onClick={() => exec('subscript')} title="Chỉ số dưới (H₂O)">x₂</BTN>
          <BTN onClick={() => exec('removeFormat')} title="Xóa định dạng"><FiX size={12} /></BTN>

          <Divider />

          {/* Màu chữ */}
          <ColorPicker label="Màu chữ" icon={FiType} onSelect={c => exec('foreColor', c)} />
          {/* Màu nền chữ */}
          <ColorPicker label="Màu nền chữ" icon={FiDroplet} onSelect={c => exec('hiliteColor', c)} />

          <Divider />

          {/* Căn lề */}
          <BTN onClick={() => exec('justifyLeft')} title="Căn trái"><FiAlignLeft size={13} /></BTN>
          <BTN onClick={() => exec('justifyCenter')} title="Căn giữa"><FiAlignCenter size={13} /></BTN>
          <BTN onClick={() => exec('justifyRight')} title="Căn phải"><FiAlignRight size={13} /></BTN>
          <BTN onClick={() => exec('justifyFull')} title="Căn đều">≡</BTN>

          <Divider />

          {/* Danh sách */}
          <Dropdown label="Danh sách" icon={FiList}>
            {NUMBER_STYLES.map(ns => (
              <DropItem key={ns.value} onClick={() => {
                if (['disc', 'circle', 'square'].includes(ns.value)) {
                  exec('insertUnorderedList');
                } else {
                  exec('insertOrderedList');
                }
              }}>{ns.label}</DropItem>
            ))}
          </Dropdown>

          {/* Indent */}
          <BTN onClick={() => exec('indent')} title="Thụt lề">→</BTN>
          <BTN onClick={() => exec('outdent')} title="Giảm thụt lề">←</BTN>

          <Divider />

          {/* Link */}
          <BTN onClick={insertLink} title="Chèn liên kết"><FiLink size={13} /></BTN>

          {/* Ảnh upload */}
          <label title="Tải ảnh lên" style={{ display: 'flex', alignItems: 'center', padding: '0.3rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#374151' }}>
            <FiImage size={13} />
            <input type="file" accept="image/*" style={{ display: 'none' }} multiple onChange={async e => {
              for (const f of Array.from(e.target.files)) await insertImageFromUpload(f);
              e.target.value = '';
            }} />
          </label>

          {/* Ảnh từ URL với dialog canh lề + caption */}
          <BTN onClick={() => setShowImgDialog(true)} title="Chèn ảnh từ URL (có caption + canh lề)">
            <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>IMG+</span>
          </BTN>

          {/* Vẽ bảng */}
          <BTN onClick={() => setShowTableDialog(true)} title="Vẽ bảng"><FiTable size={13} /></BTN>

          {/* HR */}
          <BTN onClick={() => insertHtml('<hr style="border:none;border-top:2px solid #e2e8f0;margin:1.25rem 0;" />')} title="Đường kẻ ngang"><FiMinus size={13} /></BTN>

          <Divider />

          {/* Import Word */}
          <label title="Import file Word (.docx)" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', cursor: 'pointer', color: '#374151', fontSize: '0.75rem', fontWeight: 700 }}>
            .docx
            <input type="file" accept=".docx,.doc" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleWordImport(e.target.files[0]); e.target.value = ''; }} />
          </label>

          {/* Code inline */}
          <BTN onClick={() => insertHtml('<code style="background:#f1f5f9;padding:0.1rem 0.4rem;border-radius:4px;font-family:monospace;font-size:0.9em;">code</code>')} title="Code inline">
            <FiCode size={13} />
          </BTN>
        </div>

        {/* ── Editor area ── */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={emit}
          onBlur={emit}
          style={{
            padding: '1rem 1.125rem',
            minHeight: compact ? '100px' : '200px',
            outline: 'none',
            lineHeight: '1.75',
            fontSize: '0.95rem',
            color: '#374151',
            overflowY: 'auto',
          }}
        />

        {/* ── Styles applied inside editor ── */}
        <style>{`
          [contenteditable] table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
          [contenteditable] table td, [contenteditable] table th { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; }
          [contenteditable] table th { background: #f1f5f9; font-weight: 700; }
          [contenteditable] figure { margin: 1rem 0; }
          [contenteditable] figcaption { font-size: 0.82rem; color: #6b7280; text-align: center; margin-top: 0.375rem; }
          [contenteditable] blockquote { border-left: 4px solid #2563eb; margin: 1rem 0; padding: 0.75rem 1rem; background: #f0f6ff; border-radius: 0 8px 8px 0; color: #1e3a5f; }
          [contenteditable] pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; font-family: 'Courier New', monospace; overflow-x: auto; font-size: 0.88rem; }
          [contenteditable] code { background: #f1f5f9; padding: 0.1rem 0.4rem; border-radius: 4px; font-family: monospace; }
          [contenteditable] a { color: #2563eb; text-decoration: underline; }
          [contenteditable] hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.25rem 0; }
          [contenteditable] img { max-width: 100%; border-radius: 8px; }
          [contenteditable]:empty:before { content: attr(data-placeholder); color: #94a3b8; pointer-events: none; }
        `}</style>
      </div>

      {showImgDialog && <ImageDialog onConfirm={insertImageFromDialog} onClose={() => setShowImgDialog(false)} />}
      {showTableDialog && <TableDrawDialog onConfirm={insertTable} onClose={() => setShowTableDialog(false)} />}
    </>
  );
};

export default RichTextEditor;