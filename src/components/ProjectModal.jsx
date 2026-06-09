import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiX, FiCheck, FiPlus, FiTrash2, FiUploadCloud,
  FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight,
  FiEdit3, FiEdit, FiImage, FiType, FiGrid, FiPaperclip, FiBarChart2,
  FiChevronsRight, FiEye, FiEyeOff, FiLink, FiLayers, FiCopy, FiList,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiDroplet,
  FiRefreshCw, FiBold, FiItalic, FiUnderline, FiHash,
  FiRotateCcw, FiRotateCw, FiSquare, FiColumns, FiMinus,
  FiPlusSquare, FiMinusSquare, FiDownload, FiClipboard,
  FiAlertTriangle, FiFileText, FiLayout, FiGrid as FiGridIcon,
} from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import { uploadFileToStorage } from '../utils/supabaseClient';
import ConfirmModal from './ConfirmModal';

/* ═══════════ HELPERS ═══════════ */
const uid = () => `sec_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

const BLOCK_TYPES = [
  { type: 'text',  icon: FiType,      label: 'Văn bản'      },
  { type: 'image', icon: FiImage,     label: 'Hình ảnh'     },
  { type: 'table', icon: FiGrid,      label: 'Bảng dữ liệu' },
  { type: 'file',  icon: FiPaperclip, label: 'Tệp đính kèm' },
  { type: 'chart', icon: FiBarChart2, label: 'Biểu đồ'      },
];

const CHART_TYPES = [
  { value: 'bar',       label: 'Cột (Bar)'                    },
  { value: 'bar_h',     label: 'Cột ngang (Horizontal Bar)'   },
  { value: 'line',      label: 'Đường (Line)'                 },
  { value: 'pie',       label: 'Tròn (Pie)'                   },
  { value: 'doughnut',  label: 'Vòng (Doughnut)'              },
  { value: 'radar',     label: 'Mạng nhện (Radar)'            },
  { value: 'area',      label: 'Vùng (Area)'                  },
  { value: 'scatter',   label: 'Phân tán (Scatter)'           },
  { value: 'bubble',    label: 'Bong bóng (Bubble)'           },
  { value: 'waterfall', label: 'Thác nước (Waterfall)'        },
  { value: 'gauge',     label: 'Đồng hồ (Gauge)'              },
  { value: 'progress',  label: 'Thanh tiến độ (Progress)'     },
];

const NUMBER_STYLES = [
  { value: 'none',   label: 'Không đánh số' },
  { value: '1',      label: '1. 2. 3.'       },
  { value: 'A',      label: 'A. B. C.'       },
  { value: 'a',      label: 'a. b. c.'       },
  { value: 'I',      label: 'I. II. III.'    },
  { value: 'i',      label: 'i. ii. iii.'    },
  { value: 'custom', label: 'Tuỳ chỉnh...'  },
];

const ROMAN = { upper: ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV'], lower: ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii','xiii','xiv','xv'] };

const calcLabel = (style, idx, prefix = '') => {
  const n = idx + 1;
  if (!style || style === 'none') return '';
  if (style === '1') return `${n}.`;
  if (style === 'A') return `${String.fromCharCode(64 + n)}.`;
  if (style === 'a') return `${String.fromCharCode(96 + n)}.`;
  if (style === 'I') return `${ROMAN.upper[idx] || n}.`;
  if (style === 'i') return `${ROMAN.lower[idx] || n}.`;
  if (style === 'custom') return `${prefix}${n}`;
  return '';
};

const emptySection = (type = 'text', parentId = null) => ({
  id: uid(),
  title: '',
  type,
  parentId,
  textContent: '',
  images: [],
  files: [],
  tableData: {
    headers: ['Cột A', 'Cột B', 'Cột C'],
    rows: [['', '', '']],
    showHeader: true,
    autoNumber: false,
    cellStyles: {},
  },
  chartData: [
    { label: 'Mục 1', value: 80, color: '#2563eb' },
    { label: 'Mục 2', value: 65, color: '#10b981' },
    { label: 'Mục 3', value: 45, color: '#f59e0b' },
  ],
  chartType: 'bar',
  chartTitle: '',
  chartShowValues: true,
  chartShowLegend: true,
  showInToc: true,
  analysisText: '',   // phân tích / ghi chú cho image, chart, table
});

/* ═══════════ TABLE EDITOR — nâng cấp toàn diện ═══════════ */
let _tableCopied = null;

/* ── Phân tích / Ghi chú dùng chung cho image/chart/table ── */
function AnalysisEditor({ value, onChange, onUploadImage }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: '0.875rem' }}>
      <button type="button" onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.4rem 0.875rem', backgroundColor: open ? '#eff6ff' : '#f8fafc', color: open ? '#2563eb' : '#475569', border: `1.5px solid ${open ? '#bfdbfe' : '#e2e8f0'}`, borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
        <FiFileText size={13} /> {open ? 'Ẩn phân tích / ghi chú' : (value ? '✏ Chỉnh sửa phân tích / ghi chú' : '+ Thêm phân tích / ghi chú')}
        {value && !open && <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#2563eb', flexShrink: 0 }} />}
      </button>
      {open && (
        <div style={{ marginTop: '0.625rem', border: '1.5px solid #bfdbfe', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{ padding: '0.5rem 0.875rem', backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: '0.75rem', fontWeight: 700, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FiFileText size={12} /> Phân tích / Ghi chú — hỗ trợ văn bản đầy đủ, xuống dòng, định dạng
          </div>
          <RichTextEditor value={value || ''} onChange={onChange} onUploadImage={onUploadImage} compact={true} />
        </div>
      )}
    </div>
  );
}

function TableEditor({ tableData, onChange, onDuplicateSection, onUploadImage, analysisText, onAnalysisChange }) {
  const {
    headers = [],
    rows = [],
    showHeader = true,
    autoNumber = false,
    cellStyles = {},
    merges = {},        // { "ri_ci": { rowspan, colspan } }
    borderStyle = {},   // { color, width, style } — global
  } = tableData;

  /* ── Undo / Redo stack ── */
  const [history, setHistory]   = useState([deepClone(tableData)]);
  const [histIdx, setHistIdx]   = useState(0);
  const isUndoing = useRef(false);

  /* ── Multi-select ── */
  const [selStart, setSelStart] = useState(null); // { ri, ci }
  const [selEnd,   setSelEnd]   = useState(null); // { ri, ci }
  const [isSelecting, setIsSelecting] = useState(false);

  /* ── UI state ── */
  const [copyPopup,    setCopyPopup]    = useState(false);
  const [hasCopy,      setHasCopy]      = useState(!!_tableCopied);
  const [importPopup,  setImportPopup]  = useState(null); // null | 'confirm' | File
  const [pendingFile,  setPendingFile]  = useState(null);
  const [borderPopup,  setBorderPopup]  = useState(false);
  const [borderColor,  setBorderColor]  = useState(borderStyle.color  || '#e2e8f0');
  const [borderWidth,  setBorderWidth]  = useState(borderStyle.width  || '1px');
  const [borderStroke, setBorderStroke] = useState(borderStyle.style  || 'solid');

  /* Push snapshot vào history */
  const push = useCallback((newData) => {
    if (isUndoing.current) return;
    setHistory(h => {
      const trimmed = h.slice(0, histIdx + 1);
      const next = [...trimmed, deepClone(newData)].slice(-30); // giữ 30 bước
      return next;
    });
    setHistIdx(i => Math.min(i + 1, 29));
    onChange(newData);
  }, [histIdx, onChange]);

  /* update = push snapshot + notify parent */
  const update = useCallback((patch) => {
    const newData = { ...tableData, ...patch };
    push(newData);
  }, [tableData, push]);

  const undo = () => {
    if (histIdx <= 0) return;
    isUndoing.current = true;
    const ni = histIdx - 1;
    setHistIdx(ni);
    onChange(history[ni]);
    setTimeout(() => { isUndoing.current = false; }, 50);
  };
  const redo = () => {
    if (histIdx >= history.length - 1) return;
    isUndoing.current = true;
    const ni = histIdx + 1;
    setHistIdx(ni);
    onChange(history[ni]);
    setTimeout(() => { isUndoing.current = false; }, 50);
  };

  /* Keyboard shortcut Ctrl+Z / Ctrl+Y */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  /* Clipboard broadcast */
  useEffect(() => {
    const h = () => setHasCopy(!!_tableCopied);
    window.addEventListener('tableClipboardUpdate', h);
    return () => window.removeEventListener('tableClipboardUpdate', h);
  }, []);

  /* ── Multi-select helpers ── */
  const getSelRange = () => {
    if (!selStart || !selEnd) return null;
    return {
      r0: Math.min(selStart.ri, selEnd.ri), r1: Math.max(selStart.ri, selEnd.ri),
      c0: Math.min(selStart.ci, selEnd.ci), c1: Math.max(selStart.ci, selEnd.ci),
    };
  };
  const inRange = (ri, ci) => {
    const r = getSelRange(); if (!r) return selStart?.ri === ri && selStart?.ci === ci;
    return ri >= r.r0 && ri <= r.r1 && ci >= r.c0 && ci <= r.c1;
  };
  const selectRow = (ri) => { setSelStart({ ri, ci: 0 }); setSelEnd({ ri, ci: headers.length - 1 }); };
  const selectCol = (ci) => { setSelStart({ ri: 0, ci }); setSelEnd({ ri: rows.length - 1, ci }); };

  /* Apply style to all selected cells */
  const applyStyleToSelection = (patch) => {
    const r = getSelRange();
    if (!r) {
      if (selStart) setCStyleDirect(selStart.ri, selStart.ci, patch);
      return;
    }
    const newStyles = { ...cellStyles };
    for (let ri = r.r0; ri <= r.r1; ri++)
      for (let ci = r.c0; ci <= r.c1; ci++) {
        const k = `${ri}_${ci}`;
        newStyles[k] = { ...(newStyles[k] || {}), ...patch };
      }
    update({ cellStyles: newStyles });
  };

  const getCStyle = (ri, ci) => cellStyles[`${ri}_${ci}`] || {};
  const setCStyleDirect = (ri, ci, patch) => {
    const k = `${ri}_${ci}`;
    update({ cellStyles: { ...cellStyles, [k]: { ...getCStyle(ri, ci), ...patch } } });
  };

  /* ── Cell ops ── */
  const updateCell = (ri, ci, val) => {
    const newR = rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    update({ rows: newR });
  };
  const updateHeader = (ci, val) => { const h = [...headers]; h[ci] = val; update({ headers: h }); };

  /* ── Row ops ── */
  const addRow    = (atIdx = rows.length)  => { const nr = [...rows]; nr.splice(atIdx, 0, headers.map(() => '')); update({ rows: nr }); };
  const removeRow = (ri)  => { if (rows.length <= 1) return; update({ rows: rows.filter((_, i) => i !== ri) }); };
  const duplicateRow = (ri) => { const nr = [...rows]; nr.splice(ri + 1, 0, deepClone(rows[ri])); update({ rows: nr }); };
  const moveRow   = (ri, dir) => { const ni = ri + dir; if (ni < 0 || ni >= rows.length) return; const nr = [...rows]; [nr[ri], nr[ni]] = [nr[ni], nr[ri]]; update({ rows: nr }); };

  /* ── Col ops ── */
  const addCol    = (atIdx = headers.length) => {
    const nh = [...headers]; nh.splice(atIdx, 0, `Cột ${String.fromCharCode(65 + atIdx)}`);
    const nr = rows.map(r => { const rc = [...r]; rc.splice(atIdx, 0, ''); return rc; });
    update({ headers: nh, rows: nr });
  };
  const removeCol = (ci) => { if (headers.length <= 1) return; update({ headers: headers.filter((_, i) => i !== ci), rows: rows.map(r => r.filter((_, i) => i !== ci)) }); };
  const moveCol   = (ci, dir) => { const ni = ci + dir; if (ni < 0 || ni >= headers.length) return; const nh = [...headers]; [nh[ci], nh[ni]] = [nh[ni], nh[ci]]; const nr = rows.map(r => { const rc = [...r]; [rc[ci], rc[ni]] = [rc[ni], rc[ci]]; return rc; }); update({ headers: nh, rows: nr }); };

  /* ── Merge / Unmerge ── */
  const mergeSelection = () => {
    const r = getSelRange(); if (!r) return;
    const newMerges = { ...merges };
    // Đặt merge cho ô đầu, ẩn các ô còn lại
    newMerges[`${r.r0}_${r.c0}`] = { rowspan: r.r1 - r.r0 + 1, colspan: r.c1 - r.c0 + 1 };
    for (let ri = r.r0; ri <= r.r1; ri++)
      for (let ci = r.c0; ci <= r.c1; ci++)
        if (ri !== r.r0 || ci !== r.c0) newMerges[`${ri}_${ci}`] = { hidden: true };
    update({ merges: newMerges });
  };
  const unmergeSelection = () => {
    const r = getSelRange(); if (!r) return;
    const newMerges = { ...merges };
    for (let ri = r.r0; ri <= r.r1; ri++)
      for (let ci = r.c0; ci <= r.c1; ci++)
        delete newMerges[`${ri}_${ci}`];
    update({ merges: newMerges });
  };

  /* ── Import Excel / CSV ── */
  const doImport = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      try {
        const XLSX = await import('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js').catch(() => null);
        if (!XLSX) { alert('Không tải được thư viện xlsx. Hãy dùng CSV.'); return; }
        const buf = await file.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array' });
        const ws  = wb.Sheets[wb.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
        if (raw.length === 0) return;
        const newHeaders = (raw[0] || []).map(String);
        const newRows    = raw.slice(1).map(r => newHeaders.map((_, ci) => String(r[ci] ?? '')));
        update({ headers: newHeaders, rows: newRows });
      } catch (err) { alert('Lỗi khi đọc file Excel: ' + err.message); }
    } else {
      // CSV — đọc UTF-8 đúng tiếng Việt
      const text = await file.text();
      const lines = text.trim().split('\n');
      const parse = (line) => {
        const result = []; let cur = ''; let inQ = false;
        for (const ch of line) {
          if (ch === '"') { inQ = !inQ; }
          else if (ch === ',' && !inQ) { result.push(cur.trim()); cur = ''; }
          else cur += ch;
        }
        result.push(cur.trim());
        return result;
      };
      const parsed = lines.map(parse);
      update({ headers: parsed[0] || [], rows: parsed.slice(1) });
    }
    setImportPopup(null); setPendingFile(null);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0]; if (!file) return;
    e.target.value = '';
    const hasData = rows.some(r => r.some(c => c !== ''));
    if (hasData) { setPendingFile(file); setImportPopup('confirm'); }
    else doImport(file);
  };

  /* ── Clipboard ── */
  const handleCopyTable = () => { _tableCopied = deepClone(tableData); setHasCopy(true); window.dispatchEvent(new Event('tableClipboardUpdate')); };
  const handlePasteAction = (mode) => {
    if (!_tableCopied) return;
    if (mode === 'replace') push(deepClone(_tableCopied));
    else if (mode === 'append') update({ rows: [...rows, ...deepClone(_tableCopied.rows || [])] });
    else if (mode === 'from_cell' && selStart) {
      const { ri: sRi, ci: sCi } = selStart;
      const nr = deepClone(rows);
      (_tableCopied.rows || []).forEach((sr, dri) => sr.forEach((cell, dci) => {
        const tRi = sRi + dri, tCi = sCi + dci;
        if (tRi < nr.length && tCi < (nr[tRi]?.length || 0)) nr[tRi][tCi] = cell;
      }));
      update({ rows: nr });
    }
    setCopyPopup(false);
  };

  /* ── Apply border to selection ── */
  const applyBorder = () => {
    update({ borderStyle: { color: borderColor, width: borderWidth, style: borderStroke } });
    setBorderPopup(false);
  };

  const range    = getSelRange();
  const selStyle = selStart ? getCStyle(selStart.ri, selStart.ci) : {};
  const hasMulti = range && (range.r1 > range.r0 || range.c1 > range.c0);

  const TB = ({ onClick, title, active, children, danger, disabled }) => (
    <button type="button" title={title} onClick={onClick} disabled={disabled}
      style={{ padding: '0.28rem 0.5rem', border: `1px solid ${danger ? '#fecaca' : active ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '4px', background: danger ? '#fff' : active ? '#eff6ff' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', color: danger ? '#ef4444' : active ? '#2563eb' : '#374151', fontSize: '0.77rem', display: 'flex', alignItems: 'center', gap: '2px', whiteSpace: 'nowrap', flexShrink: 0, opacity: disabled ? 0.4 : 1 }}>
      {children}
    </button>
  );
  const Div = () => <div style={{ width: '1px', height: '18px', background: '#e2e8f0', margin: '0 1px', flexShrink: 0 }} />;

  const bStyle = { color: borderColor, width: borderWidth, style: borderStroke };
  const cellBorder = `${bStyle.width} ${bStyle.style} ${bStyle.color}`;

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'flex', gap: '3px', padding: '0.45rem 0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #e2e8f0' }}>

        {/* Undo / Redo */}
        <TB onClick={undo} disabled={histIdx <= 0} title="Hoàn tác (Ctrl+Z)"><FiRotateCcw size={11} /></TB>
        <TB onClick={redo} disabled={histIdx >= history.length - 1} title="Làm lại (Ctrl+Y)"><FiRotateCw size={11} /></TB>

        <Div />

        {/* Header / STT */}
        <TB onClick={() => update({ showHeader: !showHeader })} active={showHeader} title="Hiện/ẩn hàng tiêu đề"><FiEye size={11} /> Header</TB>
        <TB onClick={() => update({ autoNumber: !autoNumber })} active={autoNumber} title="Tự đánh số thứ tự hàng"><FiHash size={11} /> STT</TB>

        <Div />

        {/* Cell style — áp dụng cho selection */}
        {selStart && (
          <>
            <TB onClick={() => applyStyleToSelection({ bold: !selStyle.bold })} active={selStyle.bold} title="In đậm"><FiBold size={11} /></TB>
            <TB onClick={() => applyStyleToSelection({ italic: !selStyle.italic })} active={selStyle.italic} title="In nghiêng"><FiItalic size={11} /></TB>
            <TB onClick={() => applyStyleToSelection({ underline: !selStyle.underline })} active={selStyle.underline} title="Gạch chân"><FiUnderline size={11} /></TB>
            <Div />
            <TB onClick={() => applyStyleToSelection({ align: 'left'   })} active={selStyle.align === 'left'  } title="Căn trái"><FiAlignLeft   size={11} /></TB>
            <TB onClick={() => applyStyleToSelection({ align: 'center' })} active={selStyle.align === 'center'} title="Căn giữa"><FiAlignCenter  size={11} /></TB>
            <TB onClick={() => applyStyleToSelection({ align: 'right'  })} active={selStyle.align === 'right' } title="Căn phải"><FiAlignRight   size={11} /></TB>
            <Div />
            <label title="Màu chữ" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.28rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.77rem', flexShrink: 0 }}>
              <FiType size={11} style={{ color: selStyle.color || '#374151' }} />
              <input type="color" value={selStyle.color || '#374151'} onChange={e => applyStyleToSelection({ color: e.target.value })} style={{ width: '16px', height: '16px', border: 'none', padding: 0, cursor: 'pointer' }} />
            </label>
            <label title="Màu nền ô" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.28rem 0.45rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: selStyle.bg || '#fff', cursor: 'pointer', fontSize: '0.77rem', flexShrink: 0 }}>
              <FiDroplet size={11} />
              <input type="color" value={selStyle.bg || '#ffffff'} onChange={e => applyStyleToSelection({ bg: e.target.value })} style={{ width: '16px', height: '16px', border: 'none', padding: 0, cursor: 'pointer' }} />
            </label>
            <Div />
          </>
        )}

        {/* Hàng / cột */}
        <TB onClick={() => addRow(selStart ? selStart.ri + 1 : rows.length)} title="Chèn hàng (sau hàng đang chọn)"><FiPlusSquare size={11} /> Hàng</TB>
        <TB onClick={() => addCol(selStart ? selStart.ci + 1 : headers.length)} title="Chèn cột (sau cột đang chọn)"><FiPlusSquare size={11} /> Cột</TB>
        {selStart && <TB onClick={() => duplicateRow(selStart.ri)} title="Nhân bản hàng"><FiCopy size={11} /> Nhân hàng</TB>}
        {selStart && <TB onClick={() => removeRow(selStart.ri)} danger title="Xóa hàng đang chọn"><FiMinusSquare size={11} /> Xóa hàng</TB>}
        {selStart && <TB onClick={() => removeCol(selStart.ci)} danger title="Xóa cột đang chọn"><FiMinusSquare size={11} /> Xóa cột</TB>}

        <Div />

        {/* Gộp / Tách */}
        <TB onClick={mergeSelection} disabled={!hasMulti} title="Gộp các ô đã chọn"><FiSquare size={11} /> Gộp ô</TB>
        <TB onClick={unmergeSelection} disabled={!selStart} title="Tách ô đã gộp"><FiColumns size={11} /> Tách ô</TB>

        <Div />

        {/* Viền */}
        <div style={{ position: 'relative' }}>
          <TB onClick={() => setBorderPopup(v => !v)} active={borderPopup} title="Chỉnh viền bảng"><FiLayout size={11} /> Viền</TB>
          {borderPopup && (
            <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 999, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '0.75rem', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <p style={{ margin: 0, fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Viền bảng</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.78rem', color: '#374151', width: '50px' }}>Màu</label>
                <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} style={{ width: '32px', height: '26px', border: 'none', cursor: 'pointer' }} />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{borderColor}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.78rem', color: '#374151', width: '50px' }}>Độ dày</label>
                <select value={borderWidth} onChange={e => setBorderWidth(e.target.value)} style={{ flex: 1, padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.78rem' }}>
                  <option value="0px">Không viền</option>
                  <option value="1px">1px — Mỏng</option>
                  <option value="2px">2px — Vừa</option>
                  <option value="3px">3px — Đậm</option>
                  <option value="4px">4px — Rất đậm</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.78rem', color: '#374151', width: '50px' }}>Kiểu</label>
                <select value={borderStroke} onChange={e => setBorderStroke(e.target.value)} style={{ flex: 1, padding: '0.3rem', border: '1px solid #e2e8f0', borderRadius: '5px', fontSize: '0.78rem' }}>
                  <option value="solid">Liền (solid)</option>
                  <option value="dashed">Nét đứt (dashed)</option>
                  <option value="dotted">Chấm (dotted)</option>
                  <option value="double">Đôi (double)</option>
                  <option value="none">Ẩn viền</option>
                </select>
              </div>
              {/* Preview */}
              <div style={{ border: cellBorder, borderRadius: '4px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: '#374151', textAlign: 'center', marginTop: '2px' }}>Xem trước viền</div>
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '2px' }}>
                <button type="button" onClick={applyBorder} style={{ flex: 1, padding: '0.4rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>Áp dụng</button>
                <button type="button" onClick={() => setBorderPopup(false)} style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer' }}>Đóng</button>
              </div>
            </div>
          )}
        </div>

        <Div />

        {/* Import Excel / CSV */}
        <label title="Import từ Excel (.xlsx) hoặc CSV (.csv)" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.28rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#374151', flexShrink: 0 }}>
          <FiDownload size={11} /> Excel/CSV
          <input type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={handleFileInput} />
        </label>

        <Div />

        {/* Sao chép / Dán bảng */}
        <TB onClick={handleCopyTable} title="Sao chép bảng này"><FiCopy size={11} /> Sao chép</TB>
        {hasCopy && (
          <div style={{ position: 'relative' }}>
            <TB onClick={() => setCopyPopup(v => !v)} active={copyPopup} title="Dán bảng đã sao chép"><FiClipboard size={11} /> Dán</TB>
            {copyPopup && (
              <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 999, background: '#fff', border: '1.5px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '0.625rem', minWidth: '210px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Chọn cách dán:</p>
                <button type="button" onClick={() => handlePasteAction('replace')} style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>🔁 Đè toàn bộ bảng</button>
                <button type="button" onClick={() => handlePasteAction('append')} style={{ padding: '0.4rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', background: '#fff', cursor: 'pointer', textAlign: 'left', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>⬇ Thêm hàng vào cuối</button>
                {selStart && (
                  <button type="button" onClick={() => handlePasteAction('from_cell')} style={{ padding: '0.4rem 0.75rem', border: '1px solid #bfdbfe', borderRadius: '7px', background: '#eff6ff', cursor: 'pointer', textAlign: 'left', fontSize: '0.82rem', fontWeight: 700, color: '#2563eb' }}>
                    📌 Dán từ ô [{selStart.ri+1},{selStart.ci+1}]
                  </button>
                )}
                <button type="button" onClick={() => setCopyPopup(false)} style={{ padding: '0.3rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#94a3b8' }}>Đóng</button>
              </div>
            )}
          </div>
        )}

        {onDuplicateSection && <TB onClick={onDuplicateSection} title="Nhân bản mục bảng này"><FiLayers size={11} /> Nhân mục</TB>}
      </div>

      {/* Hint chọn nhiều ô */}
      {hasMulti && (
        <div style={{ fontSize: '0.72rem', color: '#6366f1', backgroundColor: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: '6px', padding: '0.3rem 0.75rem', marginBottom: '0.375rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiGrid size={11} /> Đang chọn {(range.r1-range.r0+1)} hàng × {(range.c1-range.c0+1)} cột — toolbar áp định dạng cho tất cả ô
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: cellBorder || '1.5px solid #e2e8f0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'auto', userSelect: 'none' }}>
          {showHeader && (
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ width: '28px', padding: '0.25rem', borderRight: cellBorder, borderBottom: cellBorder }} />
                {autoNumber && <th style={{ width: '32px', padding: '0.3rem', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', borderRight: cellBorder, borderBottom: cellBorder }}>#</th>}
                {headers.map((h, ci) => (
                  <th key={ci} style={{ padding: '0.3rem 0.4rem', borderBottom: cellBorder, borderRight: cellBorder, minWidth: '120px', cursor: 'pointer' }}
                    onClick={() => selectCol(ci)}>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '3px', justifyContent: 'center' }}>
                      <button type="button" onClick={e => { e.stopPropagation(); moveCol(ci, -1); }} disabled={ci === 0} style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.58rem', opacity: ci === 0 ? 0.3 : 1 }}><FiChevronLeft size={9} /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); moveCol(ci,  1); }} disabled={ci === headers.length-1} style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.58rem', opacity: ci === headers.length-1 ? 0.3 : 1 }}><FiChevronRight size={9} /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); addCol(ci + 1); }} title="Chèn cột bên phải" style={{ padding: '1px 4px', border: '1px solid #bfdbfe', borderRadius: '3px', background: '#eff6ff', cursor: 'pointer', color: '#2563eb', fontSize: '0.58rem' }}><FiPlus size={8} /></button>
                      <button type="button" onClick={e => { e.stopPropagation(); removeCol(ci); }} disabled={headers.length <= 1} style={{ padding: '1px 4px', border: '1px solid #fecaca', borderRadius: '3px', background: '#fff', cursor: 'pointer', color: '#ef4444', fontSize: '0.58rem', opacity: headers.length <= 1 ? 0.3 : 1 }}><FiMinus size={8} /></button>
                    </div>
                    <input value={h} onChange={e => updateHeader(ci, e.target.value)} onClick={e => e.stopPropagation()}
                      style={{ width: '100%', padding: '0.25rem 0.35rem', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box', outline: 'none', background: '#fff' }} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                {/* Row control */}
                <td style={{ padding: '0.15rem', borderRight: cellBorder, borderBottom: cellBorder, verticalAlign: 'middle', width: '28px', cursor: 'pointer', backgroundColor: '#f8fafc' }}
                  onClick={() => selectRow(ri)}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center' }}>
                    <button type="button" onClick={e => { e.stopPropagation(); moveRow(ri, -1); }} disabled={ri === 0} style={{ padding: '1px 3px', border: 'none', background: 'none', cursor: 'pointer', opacity: ri === 0 ? 0.3 : 0.6, color: '#64748b' }}><FiChevronUp size={9} /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); addRow(ri + 1); }} title="Chèn hàng bên dưới" style={{ padding: '1px 3px', border: 'none', background: 'none', cursor: 'pointer', opacity: 0.7, color: '#2563eb' }}><FiPlus size={9} /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); moveRow(ri,  1); }} disabled={ri === rows.length-1} style={{ padding: '1px 3px', border: 'none', background: 'none', cursor: 'pointer', opacity: ri === rows.length-1 ? 0.3 : 0.6, color: '#64748b' }}><FiChevronDown size={9} /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); duplicateRow(ri); }} title="Nhân bản hàng" style={{ padding: '1px 3px', border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, color: '#6366f1' }}><FiCopy size={8} /></button>
                    <button type="button" onClick={e => { e.stopPropagation(); removeRow(ri); }} disabled={rows.length <= 1} style={{ padding: '1px 3px', border: 'none', background: 'none', cursor: 'pointer', opacity: rows.length <= 1 ? 0.2 : 0.6, color: '#ef4444' }}><FiMinus size={8} /></button>
                  </div>
                </td>
                {/* STT */}
                {autoNumber && <td style={{ padding: '0.3rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', borderRight: cellBorder, borderBottom: cellBorder, verticalAlign: 'middle', backgroundColor: '#f8fafc' }}>{ri + 1}</td>}
                {row.map((cell, ci) => {
                  const cs = getCStyle(ri, ci);
                  const mg = merges[`${ri}_${ci}`];
                  if (mg?.hidden) return null; // gộp ô — ẩn
                  const isInSel = inRange(ri, ci);
                  return (
                    <td key={ci}
                      rowSpan={mg?.rowspan || 1} colSpan={mg?.colspan || 1}
                      style={{ padding: '0.15rem', verticalAlign: 'top', borderRight: cellBorder, borderBottom: cellBorder, backgroundColor: isInSel ? 'rgba(147,197,253,0.18)' : (cs.bg || 'transparent'), outline: isInSel ? '2px solid #2563eb' : 'none', outlineOffset: '-2px', boxSizing: 'border-box' }}
                      onMouseDown={() => { setSelStart({ ri, ci }); setSelEnd({ ri, ci }); setIsSelecting(true); }}
                      onMouseEnter={() => { if (isSelecting) setSelEnd({ ri, ci }); }}
                      onMouseUp={() => setIsSelecting(false)}
                    >
                      <textarea value={cell} onChange={e => updateCell(ri, ci, e.target.value)}
                        onFocus={() => { if (!isSelecting) { setSelStart({ ri, ci }); setSelEnd({ ri, ci }); } }}
                        rows={2}
                        style={{ width: '100%', padding: '0.35rem 0.5rem', border: 'none', outline: 'none', fontSize: '0.82rem', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.55', boxSizing: 'border-box', minHeight: '44px', background: 'transparent', color: cs.color || '#374151', fontWeight: cs.bold ? 700 : 400, fontStyle: cs.italic ? 'italic' : 'normal', textDecoration: cs.underline ? 'underline' : 'none', textAlign: cs.align || 'left' }} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selStart && !hasMulti && <p style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0.25rem 0 0', fontStyle: 'italic' }}>Ô [{selStart.ri+1},{selStart.ci+1}] — kéo chuột hoặc Shift+click để chọn nhiều</p>}

      {/* Phân tích / ghi chú */}
      <AnalysisEditor value={analysisText} onChange={onAnalysisChange} onUploadImage={onUploadImage} />

      {/* Popup xác nhận import */}
      {importPopup === 'confirm' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '1.5rem', width: '360px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <FiAlertTriangle size={18} color="#f59e0b" /> Bảng đã có dữ liệu
            </h4>
            <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#475569', lineHeight: '1.6' }}>
              Bảng hiện tại đang có dữ liệu. Import sẽ thay thế toàn bộ nội dung. Bạn vẫn có thể <strong>Ctrl+Z</strong> để hoàn tác sau khi import.
            </p>
            <div style={{ display: 'flex', gap: '0.625rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => { setImportPopup(null); setPendingFile(null); }} style={{ padding: '0.6rem 1.25rem', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', color: '#475569' }}>Hủy</button>
              <button type="button" onClick={() => doImport(pendingFile)} style={{ padding: '0.6rem 1.25rem', border: 'none', borderRadius: '8px', background: '#2563eb', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>Import & Ghi đè</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════ CHART EDITOR ═══════════ */
function ChartEditor({ sec, upd, onDuplicateSection, handleUpload }) {
  const [showCsvInput, setShowCsvInput] = useState(false);
  const [csvText, setCsvText] = useState('');
  const COLORS_PRESET = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

  const updateItem = (idx, patch) => {
    const d = [...sec.chartData]; d[idx] = { ...d[idx], ...patch }; upd({ chartData: d });
  };
  const removeItem = (idx) => upd({ chartData: sec.chartData.filter((_, i) => i !== idx) });
  const addItem = () => {
    const i = sec.chartData.length;
    upd({ chartData: [...sec.chartData, { label: `Mục ${i + 1}`, value: 50, color: COLORS_PRESET[i % COLORS_PRESET.length] }] });
  };
  const moveItem = (idx, dir) => {
    const ni = idx + dir; if (ni < 0 || ni >= sec.chartData.length) return;
    const d = [...sec.chartData]; [d[idx], d[ni]] = [d[ni], d[idx]]; upd({ chartData: d });
  };

  const importCsv = () => {
    const lines = csvText.trim().split('\n').filter(Boolean);
    const data = lines.map((l, i) => {
      const parts = l.split(',').map(s => s.trim());
      return { label: parts[0] || `Mục ${i+1}`, value: parseFloat(parts[1]) || 0, color: parts[2] || COLORS_PRESET[i % COLORS_PRESET.length] };
    });
    if (data.length > 0) { upd({ chartData: data }); setShowCsvInput(false); setCsvText(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px,1fr))', gap: '0.75rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Loại biểu đồ</label>
          <select value={sec.chartType || 'bar'} onChange={e => upd({ chartType: e.target.value })}
            style={{ width: '100%', padding: '0.5rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 700, outline: 'none', backgroundColor: '#fff' }}>
            {CHART_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Tiêu đề biểu đồ</label>
          <input type="text" placeholder="Tên biểu đồ" value={sec.chartTitle || ''} onChange={e => upd({ chartTitle: e.target.value })}
            style={{ width: '100%', padding: '0.5rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151', alignSelf: 'end', paddingBottom: '4px' }}>
          <input type="checkbox" checked={sec.chartShowValues !== false} onChange={e => upd({ chartShowValues: e.target.checked })} />
          Hiện giá trị
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151', alignSelf: 'end', paddingBottom: '4px' }}>
          <input type="checkbox" checked={sec.chartShowLegend !== false} onChange={e => upd({ chartShowLegend: e.target.checked })} />
          Hiện chú thích
        </label>
      </div>

      {/* Import CSV */}
      <div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setShowCsvInput(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.875rem', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            📊 Import từ CSV
          </button>
          {onDuplicateSection && (
            <button type="button" onClick={onDuplicateSection}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.875rem', backgroundColor: '#faf5ff', color: '#7c3aed', border: '1px solid #ddd6fe', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
              <FiCopy size={12} /> Nhân bản mục này
            </button>
          )}
        </div>
        {showCsvInput && (
          <div style={{ marginTop: '0.5rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.5rem', fontStyle: 'italic' }}>Định dạng: Nhãn, Giá trị, Màu — mỗi dòng 1 mục</p>
            <textarea rows={4} value={csvText} onChange={e => setCsvText(e.target.value)}
              placeholder={"Doanh thu Q1, 1250000, #2563eb\nDoanh thu Q2, 1800000, #10b981"}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={importCsv} style={{ padding: '0.4rem 1rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Import</button>
              <button type="button" onClick={() => setShowCsvInput(false)} style={{ padding: '0.4rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        )}
      </div>

      {/* Data rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {(sec.chartData || []).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.45rem 0.625rem', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
            {/* Thứ tự */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flexShrink: 0 }}>
              <button type="button" onClick={() => moveItem(idx, -1)} disabled={idx === 0} style={{ padding: '1px 5px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.6rem', opacity: idx === 0 ? 0.3 : 1 }}>↑</button>
              <button type="button" onClick={() => moveItem(idx,  1)} disabled={idx === sec.chartData.length - 1} style={{ padding: '1px 5px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.6rem', opacity: idx === sec.chartData.length - 1 ? 0.3 : 1 }}>↓</button>
            </div>
            <input type="color" value={item.color || '#2563eb'} onChange={e => updateItem(idx, { color: e.target.value })}
              style={{ width: '30px', height: '30px', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: 0, flexShrink: 0 }} />
            <input type="text" placeholder="Nhãn" value={item.label} onChange={e => updateItem(idx, { label: e.target.value })}
              style={{ flex: 2, minWidth: '80px', padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
            <input type="number" placeholder="Giá trị" value={item.value} onChange={e => updateItem(idx, { value: Number(e.target.value) })}
              style={{ flex: 1, minWidth: '70px', padding: '0.4rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', textAlign: 'center' }} />
            <button type="button" onClick={() => removeItem(idx)}
              style={{ padding: '5px 7px', border: '1px solid #fecaca', borderRadius: '7px', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <FiTrash2 size={12} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.45rem 0.875rem', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}>
        <FiPlus size={12} /> Thêm mục dữ liệu
      </button>

      {/* Phân tích / Ghi chú biểu đồ */}
      <AnalysisEditor value={sec.analysisText || ''} onChange={val => upd({ analysisText: val })} onUploadImage={handleUpload} />
    </div>
  );
}

/* ═══════════ IMAGE BLOCK ═══════════ */
function ImageBlock({ images = [], onChange, handleUpload, analysisText, onAnalysisChange }) {
  const moveImg = (idx, dir) => {
    const ni = idx + dir; if (ni < 0 || ni >= images.length) return;
    const arr = [...images]; [arr[idx], arr[ni]] = [arr[ni], arr[idx]]; onChange(arr);
  };
  const removeImg = (idx) => onChange(images.filter((_, i) => i !== idx));
  const updateImg = (idx, patch) => {
    const arr = [...images]; arr[idx] = { ...arr[idx], ...patch }; onChange(arr);
  };
  const replaceImg = async (idx, file) => {
    const res = await handleUpload(file);
    if (res?.url) updateImg(idx, { url: res.url });
  };
  const addImgs = async (files) => {
    const newImgs = [...images];
    for (const f of Array.from(files)) {
      const res = await handleUpload(f);
      if (res?.url) newImgs.push({ url: res.url, caption: '', align: 'center', width: '100%' });
    }
    onChange(newImgs);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {images.map((img, idx) => (
        <div key={idx} style={{ border: '1.5px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          <div style={{ position: 'relative' }}>
            <img src={img.url} alt="" style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', display: 'block', backgroundColor: '#f0f4f8' }} />
            <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
              <button type="button" onClick={() => moveImg(idx, -1)} disabled={idx === 0} title="Lên" style={{ padding: '4px 7px', background: 'rgba(30,41,59,0.7)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', opacity: idx === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><FiChevronUp size={13} /></button>
              <button type="button" onClick={() => moveImg(idx,  1)} disabled={idx === images.length - 1} title="Xuống" style={{ padding: '4px 7px', background: 'rgba(30,41,59,0.7)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', opacity: idx === images.length - 1 ? 0.4 : 1, display: 'flex', alignItems: 'center' }}><FiChevronDown size={13} /></button>
            </div>
            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
              <label title="Thay ảnh này" style={{ padding: '4px 7px', background: 'rgba(37,99,235,0.85)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FiRefreshCw size={13} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) replaceImg(idx, e.target.files[0]); e.target.value = ''; }} />
              </label>
              <button type="button" onClick={() => removeImg(idx)} title="Xóa ảnh" style={{ padding: '4px 7px', background: 'rgba(239,68,68,0.9)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <FiX size={13} />
              </button>
            </div>
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(30,41,59,0.65)', color: '#fff', fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>
              {idx + 1}/{images.length}
            </div>
          </div>
          <div style={{ padding: '0.625rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Caption ảnh..." value={img.caption || ''} onChange={e => updateImg(idx, { caption: e.target.value })}
              style={{ flex: 2, minWidth: '120px', padding: '0.45rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
            <select value={img.align || 'center'} onChange={e => updateImg(idx, { align: e.target.value })}
              style={{ flex: 1, minWidth: '90px', padding: '0.45rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', outline: 'none' }}>
              <option value="left">Căn trái</option>
              <option value="center">Căn giữa</option>
              <option value="right">Căn phải</option>
              <option value="full">Full width</option>
            </select>
            <input type="text" placeholder="Độ rộng" value={img.width || '100%'} onChange={e => updateImg(idx, { width: e.target.value })}
              style={{ flex: 1, minWidth: '80px', padding: '0.45rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', outline: 'none' }} />
          </div>
        </div>
      ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', color: '#475569', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}>
        <FiUploadCloud size={16} color="#2563eb" /> Tải thêm ảnh
        <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files.length) addImgs(e.target.files); e.target.value = ''; }} />
      </label>
      {/* Phân tích / Ghi chú */}
      <AnalysisEditor value={analysisText} onChange={onAnalysisChange} onUploadImage={handleUpload} />
    </div>
  );
}

/* ═══════════ SECTION EDITOR ═══════════
   - collapsed: lưu theo id vào collapsedMap ở parent
   - mục con không giới hạn (đệ quy không giới hạn depth)
   - nút nhân bản mục (onDuplicate)
═══════════ */
function SectionEditor({
  sec, index, total, depth,
  numberingStyle, customPrefix,
  onUpdate, onRemove, onMove,
  onAddChild, onDuplicate,
  setNotification,
  collapsed, onToggleCollapse,
}) {
  const upd = (patch) => onUpdate({ ...sec, ...patch });

  const handleUpload = async (file) => {
    const res = await uploadFileToStorage(file, 'assets');
    if (res.error) { setNotification({ open: true, type: 'error', title: 'Lỗi', message: res.error.message }); return null; }
    return res;
  };

  const addFile = async (file) => {
    const res = await handleUpload(file);
    if (res?.url) upd({ files: [...(sec.files || []), { url: res.url, name: file.name }] });
  };

  const label = depth === 0 ? calcLabel(numberingStyle, index, customPrefix) : '';
  const TypeIcon = BLOCK_TYPES.find(b => b.type === sec.type)?.icon || FiType;

  // Màu theo depth
  const DEPTH_COLORS = ['#e2e8f0','#dbeafe','#dcfce7','#fef9c3','#fce7f3'];
  const DEPTH_BG     = ['#f8fafc','#f0f6ff','#f0fdf4','#fefce8','#fdf2f8'];
  const DEPTH_ACCENT = ['#64748b','#2563eb','#16a34a','#ca8a04','#db2777'];
  const borderColor  = DEPTH_COLORS[depth] || DEPTH_COLORS[DEPTH_COLORS.length - 1];
  const bgColor      = DEPTH_BG[depth]     || DEPTH_BG[DEPTH_BG.length - 1];
  const accentColor  = DEPTH_ACCENT[depth] || DEPTH_ACCENT[DEPTH_ACCENT.length - 1];

  return (
    <div style={{ border: `1.5px solid ${borderColor}`, borderRadius: '12px', backgroundColor: bgColor, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginLeft: depth > 0 ? '1.25rem' : 0 }}>
      {/* ── HEADER ── */}
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 0.875rem', backgroundColor: depth === 0 ? '#f8fafc' : bgColor, borderBottom: collapsed ? 'none' : `1px solid ${borderColor}`, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => onToggleCollapse(sec.id)}
      >
        <div style={{ width: '26px', height: '26px', backgroundColor: borderColor, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: accentColor }}>
          <TypeIcon size={13} />
        </div>
        {label && <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6366f1', flexShrink: 0 }}>{label}</span>}
        {depth > 0 && <span style={{ fontSize: '0.65rem', fontWeight: 700, color: accentColor, backgroundColor: borderColor, borderRadius: '4px', padding: '1px 5px', flexShrink: 0 }}>Cấp {depth + 1}</span>}
        <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sec.title || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: 400 }}>Chưa đặt tiêu đề</span>}
        </span>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {/* TOC toggle */}
          <button type="button" onClick={() => upd({ showInToc: sec.showInToc === false })}
            title={sec.showInToc !== false ? 'Đang hiện trong mục lục (nhấn để ẩn)' : 'Đang ẩn khỏi mục lục (nhấn để hiện)'}
            style={{ padding: '3px 5px', border: `1px solid ${sec.showInToc !== false ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: '5px', background: sec.showInToc !== false ? '#f0fdf4' : '#f1f5f9', color: sec.showInToc !== false ? '#16a34a' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {sec.showInToc !== false ? <FiEye size={11} /> : <FiEyeOff size={11} />}
          </button>
          {/* Thêm mục con */}
          <button type="button" onClick={() => onAddChild(sec.id, sec.depth ?? depth)} title="Thêm mục con bên trong"
            style={{ padding: '3px 5px', border: '1px solid #bfdbfe', borderRadius: '5px', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontSize: '0.68rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
            <FiChevronsRight size={11} /> Con
          </button>
          {/* Nhân bản */}
          <button type="button" onClick={() => onDuplicate(sec)} title="Nhân bản mục này (kèm toàn bộ nội dung)"
            style={{ padding: '3px 5px', border: '1px solid #ddd6fe', borderRadius: '5px', background: '#faf5ff', color: '#7c3aed', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiCopy size={11} />
          </button>
          {/* Di chuyển */}
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
            style={{ padding: '3px 5px', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', color: '#475569', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }}>
            <FiChevronUp size={12} />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index >= total - 1}
            style={{ padding: '3px 5px', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', color: '#475569', cursor: 'pointer', opacity: index >= total - 1 ? 0.3 : 1 }}>
            <FiChevronDown size={12} />
          </button>
          {/* Xóa */}
          <button type="button" onClick={() => onRemove(sec.id)}
            style={{ padding: '3px 5px', border: '1px solid #fecaca', borderRadius: '5px', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiTrash2 size={12} />
          </button>
          <div style={{ padding: '3px 4px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            {collapsed ? <FiChevronDown size={13} /> : <FiChevronUp size={13} />}
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      {!collapsed && (
        <div style={{ padding: '0.875rem 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.625rem', marginBottom: '0.875rem', alignItems: 'start' }}>
            <input type="text" placeholder="Tiêu đề mục..." value={sec.title}
              onChange={e => upd({ title: e.target.value })}
              style={{ padding: '0.55rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, outline: 'none', width: '100%', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#93c5fd'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <select value={sec.type} onChange={e => upd({ type: e.target.value })}
              style={{ padding: '0.55rem 0.625rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
              {BLOCK_TYPES.map(b => <option key={b.type} value={b.type}>{b.label}</option>)}
            </select>
          </div>

          {/* TEXT — dùng RichTextEditor đầy đủ */}
          {sec.type === 'text' && (
            <RichTextEditor
              value={sec.textContent || ''}
              onChange={val => upd({ textContent: val })}
              onUploadImage={handleUpload}
              compact={false}
            />
          )}

          {/* IMAGE */}
          {sec.type === 'image' && (
            <ImageBlock
              images={sec.images || []}
              onChange={imgs => upd({ images: imgs })}
              handleUpload={handleUpload}
              analysisText={sec.analysisText || ''}
              onAnalysisChange={val => upd({ analysisText: val })}
            />
          )}

          {/* TABLE */}
          {sec.type === 'table' && (
            <TableEditor
              tableData={sec.tableData || { headers: [], rows: [['']], showHeader: true, autoNumber: false, cellStyles: {}, merges: {}, borderStyle: {} }}
              onChange={tableData => upd({ tableData })}
              onDuplicateSection={() => onDuplicate(sec)}
              onUploadImage={handleUpload}
              analysisText={sec.analysisText || ''}
              onAnalysisChange={val => upd({ analysisText: val })}
            />
          )}

          {/* FILE */}
          {sec.type === 'file' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {(sec.files || []).map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.875rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPaperclip size={13} color="#2563eb" /> {file.name}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="text" value={file.name} onChange={e => { const files = [...sec.files]; files[idx] = { ...file, name: e.target.value }; upd({ files }); }}
                      placeholder="Tên hiển thị" style={{ padding: '0.3rem 0.55rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', width: '150px' }} />
                    <button type="button" onClick={() => upd({ files: sec.files.filter((_, i) => i !== idx) })}
                      style={{ padding: '4px 7px', border: '1px solid #fecaca', borderRadius: '6px', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', color: '#475569', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}>
                <FiUploadCloud size={15} color="#2563eb" /> Tải tệp lên
                <input type="file" multiple style={{ display: 'none' }} onChange={async e => { for (const f of Array.from(e.target.files)) await addFile(f); e.target.value = ''; }} />
              </label>
            </div>
          )}

          {/* CHART */}
          {sec.type === 'chart' && (
            <ChartEditor sec={sec} upd={upd} onDuplicateSection={() => onDuplicate(sec)} handleUpload={handleUpload} />
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════ SECTION TREE RENDERER (đệ quy không giới hạn) ═══════════ */
function SectionTree({
  parentId, flatSections, depth,
  numberingStyle, customPrefix,
  updateSection, removeSection,
  addChildSection, duplicateSection,
  moveSectionAmongSiblings,
  setNotification,
  collapsedMap, toggleCollapse,
}) {
  const siblings = flatSections.filter(s => (s.parentId || null) === (parentId || null));

  if (siblings.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: depth === 0 ? '0.875rem' : '0.5rem' }}>
      {siblings.map((sec, idx) => (
        <div key={sec.id}>
          <SectionEditor
            sec={sec}
            index={idx}
            total={siblings.length}
            depth={depth}
            numberingStyle={depth === 0 ? numberingStyle : 'none'}
            customPrefix={customPrefix}
            onUpdate={updateSection}
            onRemove={removeSection}
            onMove={(i, dir) => moveSectionAmongSiblings(i, dir, parentId)}
            onAddChild={addChildSection}
            onDuplicate={duplicateSection}
            setNotification={setNotification}
            collapsed={!!collapsedMap[sec.id]}
            onToggleCollapse={toggleCollapse}
          />
          {/* Đệ quy render children — chỉ khi mục cha đang mở */}
          {!collapsedMap[sec.id] && (
            <div style={{ marginTop: '0.5rem' }}>
              <SectionTree
                parentId={sec.id}
                flatSections={flatSections}
                depth={depth + 1}
                numberingStyle={numberingStyle}
                customPrefix={customPrefix}
                updateSection={updateSection}
                removeSection={removeSection}
                addChildSection={addChildSection}
                duplicateSection={duplicateSection}
                moveSectionAmongSiblings={moveSectionAmongSiblings}
                setNotification={setNotification}
                collapsedMap={collapsedMap}
                toggleCollapse={toggleCollapse}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════ MAIN MODAL ═══════════ */
const ProjectModal = ({ mode, initialData, onClose, onSave, setNotification }) => {
  const [project, setProject] = useState(() => ({
    title: '', slug: '', category: '', client: '', duration: '',
    metric: '', demoUrl: '', coverImage: '', description: '',
    technologies: [], isPinned: false, isHidden: false,
    sections: [],
    numberingStyle: 'none',
    customNumberPrefix: '',
    showToc: true,
    ...initialData,
  }));
  const [isDirty, setIsDirty] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [techInput, setTechInput] = useState('');
  /* Map id → collapsed — persist trong suốt vòng đời modal */
  const [collapsedMap, setCollapsedMap] = useState({});

  const upd = (patch) => { setProject(p => ({ ...p, ...patch })); setIsDirty(true); };

  const toggleCollapse = (id) => setCollapsedMap(m => ({ ...m, [id]: !m[id] }));

  /* ── Section helpers ── */
  const flatSections = project.sections || [];

  const addSection = (type = 'text', parentId = null) => {
    const sec = emptySection(type, parentId || null);
    upd({ sections: [...flatSections, sec] });
  };

  const addChildSection = (parentId) => {
    const sec = emptySection('text', parentId);
    upd({ sections: [...flatSections, sec] });
  };

  const updateSection = (updated) => {
    upd({ sections: flatSections.map(s => s.id === updated.id ? updated : s) });
  };

  /* Xóa mục và tất cả hậu duệ (đệ quy) */
  const removeSection = (id) => {
    const getAllDescendants = (pid) => {
      const children = flatSections.filter(s => s.parentId === pid);
      return children.flatMap(c => [c.id, ...getAllDescendants(c.id)]);
    };
    const toRemove = new Set([id, ...getAllDescendants(id)]);
    upd({ sections: flatSections.filter(s => !toRemove.has(s.id)) });
  };

  /* Nhân bản mục và tất cả hậu duệ */
  const duplicateSection = (sec) => {
    const idMap = {};
    const cloneWithNewId = (s, newParentId) => {
      const newId = uid();
      idMap[s.id] = newId;
      return { ...deepClone(s), id: newId, parentId: newParentId };
    };
    const getAllDescendantsOf = (pid) => flatSections.filter(s => s.parentId === pid);
    const buildClones = (original, newParentId) => {
      const cloned = cloneWithNewId(original, newParentId);
      const childClones = getAllDescendantsOf(original.id).flatMap(c => buildClones(c, cloned.id));
      return [cloned, ...childClones];
    };
    const clones = buildClones(sec, sec.parentId);
    // Chèn sau sec trong mảng
    const idx = flatSections.findIndex(s => s.id === sec.id);
    const newSections = [...flatSections];
    newSections.splice(idx + 1, 0, ...clones);
    upd({ sections: newSections });
  };

  /* Di chuyển trong siblings cùng parentId */
  const moveSectionAmongSiblings = (index, dir, parentId) => {
    const siblings = flatSections.filter(s => (s.parentId || null) === (parentId || null));
    const ni = index + dir;
    if (ni < 0 || ni >= siblings.length) return;
    const newSibs = [...siblings]; [newSibs[index], newSibs[ni]] = [newSibs[ni], newSibs[index]];
    const others = flatSections.filter(s => (s.parentId || null) !== (parentId || null));
    // Rebuild preserving tree order: interleave others in original positions is complex,
    // simple approach: replace siblings in place
    const newAll = flatSections.map(s => {
      if ((s.parentId || null) !== (parentId || null)) return s;
      const sibIdx = siblings.findIndex(sib => sib.id === s.id);
      return newSibs[sibIdx] || s;
    });
    upd({ sections: newAll });
  };

  /* Title → slug */
  const handleTitleChange = (val) => {
    const slug = val.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
    upd({ title: val, slug: project.slug || slug });
  };

  const addTech = () => {
    const t = techInput.trim();
    if (t && !(project.technologies || []).includes(t)) upd({ technologies: [...(project.technologies || []), t] });
    setTechInput('');
  };
  const removeTech = (t) => upd({ technologies: project.technologies.filter(x => x !== t) });

  const handleUploadCover = async (file) => {
    setUploading(true);
    const res = await uploadFileToStorage(file, 'assets');
    setUploading(false);
    if (res.error) { setNotification({ open: true, type: 'error', title: 'Lỗi', message: res.error.message }); return; }
    upd({ coverImage: res.url });
  };

  const handleSave = () => {
    if (!project.title.trim()) { setNotification({ open: true, type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên dự án.' }); return; }
    if (!project.slug.trim())  { setNotification({ open: true, type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập slug dự án.'  }); return; }
    setIsDirty(false);
    onSave(project);
  };

  const handleClose = () => { if (isDirty) setShowConfirm(true); else onClose(); };

  const rootSections = flatSections.filter(s => !s.parentId);

  const TABS = [
    { id: 'basic',    label: 'Thông tin chung' },
    { id: 'sections', label: `Nội dung (${flatSections.length})` },
    { id: 'toc',      label: 'Mục lục & Số thứ tự' },
  ];

  const INPUT_STYLE = { width: '100%', padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

  /* ── TOC preview helper ── */
  const renderTocPreview = (parentId, depth) => {
    const items = flatSections.filter(s => (s.parentId || null) === (parentId || null) && s.showInToc !== false);
    if (items.length === 0) return null;
    return items.map((sec, idx) => (
      <div key={sec.id}>
        <div style={{ padding: `0.35rem 0.75rem 0.35rem ${0.75 + depth * 1.25}rem`, fontSize: `${0.85 - depth * 0.04}rem`, fontWeight: depth === 0 ? 600 : 500, color: depth === 0 ? '#1e293b' : '#4b5563', borderLeft: `${3 - depth}px solid ${depth === 0 ? '#2563eb' : '#93c5fd'}`, marginBottom: '1px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {depth === 0 && calcLabel(project.numberingStyle, idx, project.customNumberPrefix) && (
            <span style={{ color: '#6366f1', fontWeight: 800 }}>{calcLabel(project.numberingStyle, idx, project.customNumberPrefix)}</span>
          )}
          {sec.title || <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>(Chưa đặt tiêu đề)</span>}
        </div>
        {renderTocPreview(sec.id, depth + 1)}
      </div>
    ));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
      <style>{`
        .pm-wrap { background:#fff; border-radius:16px; width:100%; max-width:980px; max-height:96vh; display:flex; flex-direction:column; box-shadow:0 30px 60px rgba(0,0,0,0.25); }
        .pm-body { flex:1; overflow-y:auto; padding:1.5rem; }
        .pm-g2 { display:grid; grid-template-columns:1fr 1fr; gap:0.875rem; }
        .pm-g3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.875rem; }
        .pm-lbl { display:block; font-size:0.75rem; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:0.3rem; }
        .pm-inp:focus { border-color:#93c5fd !important; box-shadow:0 0 0 3px rgba(37,99,235,0.08); }
        @media(max-width:700px){ .pm-wrap{max-height:100vh;border-radius:10px;} .pm-g2,.pm-g3{grid-template-columns:1fr;} .pm-body{padding:0.875rem;} }
        @media(max-width:480px){ .pm-body{padding:0.625rem;} }
      `}</style>

      <div className="pm-wrap">
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '0.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'add' ? <><FiEdit3 size={17} color="#2563eb" /> Thêm dự án mới</> : <><FiEdit size={17} color="#10b981" /> Chỉnh sửa dự án</>}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <FiX size={22} />
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', flexShrink: 0, overflowX: 'auto' }}>
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{ padding: '0.75rem 1.125rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: activeTab === tab.id ? 800 : 600, color: activeTab === tab.id ? '#2563eb' : '#64748b', borderBottom: `2.5px solid ${activeTab === tab.id ? '#2563eb' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="pm-body">

          {/* ══ TAB BASIC ══ */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              <div className="pm-g2">
                <div><label className="pm-lbl">Tên dự án *</label><input className="pm-inp" style={INPUT_STYLE} type="text" placeholder="Tên dự án..." value={project.title} onChange={e => handleTitleChange(e.target.value)} /></div>
                <div><label className="pm-lbl">Slug (URL) *</label><input className="pm-inp" style={INPUT_STYLE} type="text" placeholder="ten-du-an" value={project.slug} onChange={e => upd({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'') })} /></div>
              </div>
              <div className="pm-g2">
                <div><label className="pm-lbl">Ngành nghề</label><input className="pm-inp" style={INPUT_STYLE} type="text" placeholder="FINTECH, HEALTHCARE..." value={project.category || ''} onChange={e => upd({ category: e.target.value })} /></div>
                <div><label className="pm-lbl">Khách hàng</label><input className="pm-inp" style={INPUT_STYLE} type="text" placeholder="Tên khách hàng / công ty" value={project.client || ''} onChange={e => upd({ client: e.target.value })} /></div>
              </div>
              <div className="pm-g3">
                <div><label className="pm-lbl">Thời gian</label><input className="pm-inp" style={INPUT_STYLE} type="text" placeholder="Q1/2024 – Q3/2024" value={project.duration || ''} onChange={e => upd({ duration: e.target.value })} /></div>
                <div><label className="pm-lbl">Chỉ số nổi bật</label><input className="pm-inp" style={INPUT_STYLE} type="text" placeholder="98.5% Uptime..." value={project.metric || ''} onChange={e => upd({ metric: e.target.value })} /></div>
                <div><label className="pm-lbl">Link Demo</label><input className="pm-inp" style={INPUT_STYLE} type="url" placeholder="https://..." value={project.demoUrl || ''} onChange={e => upd({ demoUrl: e.target.value })} /></div>
              </div>
              <div>
                <label className="pm-lbl">Mô tả ngắn</label>
                <RichTextEditor value={project.description || ''} onChange={val => upd({ description: val })} onUploadImage={async f => { const r = await uploadFileToStorage(f, 'assets'); return r; }} compact={false} />
              </div>
              <div>
                <label className="pm-lbl">Công nghệ & Công cụ</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input style={{ ...INPUT_STYLE, flex: 1 }} type="text" placeholder="Nhập rồi Enter (VD: Figma, SQL...)" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} />
                  <button type="button" onClick={addTech} style={{ padding: '0.6rem 0.875rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}><FiPlus size={14} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {(project.technologies || []).map(t => (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.78rem', fontWeight: 700 }}>
                      {t}<button type="button" onClick={() => removeTech(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0, display: 'flex', alignItems: 'center' }}><FiX size={10} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="pm-lbl">Ảnh bìa dự án</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1.5px dashed #cbd5e1', flexWrap: 'wrap' }}>
                  {project.coverImage && (
                    <div style={{ position: 'relative' }}>
                      <img src={project.coverImage} alt="" style={{ width: '110px', height: '75px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <button type="button" onClick={() => upd({ coverImage: '' })} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={10} /></button>
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.55rem 1rem', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                    <FiUploadCloud size={14} color="#2563eb" /> {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={e => { if (e.target.files[0]) handleUploadCover(e.target.files[0]); e.target.value = ''; }} />
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'isPinned', label: 'Ghim nổi bật', color: '#d97706' },
                  { key: 'isHidden', label: 'Ẩn dự án',    color: '#64748b' },
                ].map(({ key, label, color }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <div onClick={() => upd({ [key]: !project[key] })} style={{ width: '40px', height: '22px', borderRadius: '11px', position: 'relative', backgroundColor: project[key] ? color : '#cbd5e1', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ position: 'absolute', top: '3px', left: project[key] ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: project[key] ? color : '#94a3b8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ══ TAB SECTIONS ══ */}
          {activeTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {/* Thanh thêm mục */}
              <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', alignSelf: 'center', marginRight: '0.25rem' }}>+ Mục mới:</span>
                {BLOCK_TYPES.map(({ type, icon: Icon, label }) => (
                  <button key={type} type="button" onClick={() => addSection(type)}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0.35rem 0.7rem', backgroundColor: '#fff', color: '#374151', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#374151'; }}>
                    <Icon size={11} /> {label}
                  </button>
                ))}
              </div>

              {rootSections.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1.5px dashed #e2e8f0' }}>
                  <FiLayers size={28} style={{ marginBottom: '0.75rem', opacity: 0.4 }} />
                  <p style={{ fontSize: '0.9rem', margin: 0 }}>Chưa có mục nào. Nhấn nút bên trên để thêm.</p>
                </div>
              )}

              {/* Cây mục — đệ quy, không giới hạn độ sâu */}
              <SectionTree
                parentId={null}
                flatSections={flatSections}
                depth={0}
                numberingStyle={project.numberingStyle}
                customPrefix={project.customNumberPrefix}
                updateSection={updateSection}
                removeSection={removeSection}
                addChildSection={addChildSection}
                duplicateSection={duplicateSection}
                moveSectionAmongSiblings={moveSectionAmongSiblings}
                setNotification={setNotification}
                collapsedMap={collapsedMap}
                toggleCollapse={toggleCollapse}
              />
            </div>
          )}

          {/* ══ TAB TOC ══ */}
          {activeTab === 'toc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1.125rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b' }}>Cài đặt mục lục</h4>

                {/* Toggle hiện/ẩn */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', marginBottom: '1rem' }}>
                  <div onClick={() => upd({ showToc: !project.showToc })}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', position: 'relative', backgroundColor: project.showToc !== false ? '#2563eb' : '#cbd5e1', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '4px', left: project.showToc !== false ? '22px' : '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Hiển thị mục lục sidebar</span>
                </label>

                {/* Kiểu đánh số */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>KIỂU ĐÁNH SỐ MỤC LỤC</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {NUMBER_STYLES.map(ns => (
                      <button key={ns.value} type="button" onClick={() => upd({ numberingStyle: ns.value })}
                        style={{ padding: '0.4rem 0.8rem', border: `1.5px solid ${project.numberingStyle === ns.value ? '#2563eb' : '#e2e8f0'}`, borderRadius: '8px', background: project.numberingStyle === ns.value ? '#eff6ff' : '#fff', color: project.numberingStyle === ns.value ? '#2563eb' : '#374151', cursor: 'pointer', fontSize: '0.8rem', fontWeight: project.numberingStyle === ns.value ? 700 : 500 }}>
                        {ns.label}
                      </button>
                    ))}
                  </div>
                </div>

                {project.numberingStyle === 'custom' && (
                  <div>
                    <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Prefix tuỳ chỉnh (VD: "Phần ", "Step ")</label>
                    <input type="text" value={project.customNumberPrefix || ''} onChange={e => upd({ customNumberPrefix: e.target.value })}
                      placeholder="Phần " style={{ padding: '0.5rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.85rem', outline: 'none', width: '200px' }} />
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.3rem 0 0', fontStyle: 'italic' }}>Kết quả: {project.customNumberPrefix || 'Phần '}1, {project.customNumberPrefix || 'Phần '}2, ...</p>
                  </div>
                )}
              </div>

              {/* Preview */}
              <div style={{ padding: '1.125rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiList size={14} /> Xem trước mục lục
                </h4>
                {flatSections.filter(s => !s.parentId && s.showInToc !== false).length === 0
                  ? <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>Chưa có mục nào hoặc tất cả đều bị ẩn.</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>{renderTocPreview(null, 0)}</div>
                }
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.5rem', borderTop: '1px solid #f1f5f9', flexShrink: 0, gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            {flatSections.length} mục {isDirty && <span style={{ color: '#f59e0b', fontWeight: 700 }}>• Chưa lưu</span>}
          </div>
          <div style={{ display: 'flex', gap: '0.625rem' }}>
            <button type="button" onClick={handleClose}
              style={{ padding: '0.6rem 1.375rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '9px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
              Hủy
            </button>
            <button type="button" onClick={handleSave}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.6rem 1.875rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}>
              <FiCheck size={15} /> Lưu dự án
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