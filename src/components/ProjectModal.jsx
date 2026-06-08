import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  FiX, FiCheck, FiPlus, FiTrash2, FiUploadCloud, FiMove,
  FiChevronUp, FiChevronDown, FiEdit3, FiEdit, FiImage,
  FiVideo, FiType, FiGrid, FiPaperclip, FiBarChart2,
  FiChevronRight, FiChevronsRight, FiAlertTriangle,
  FiEye, FiEyeOff, FiLink, FiLayers, FiCopy, FiList,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiDroplet,
  FiColumns, FiMinus, FiPlus as FiPlusCircle, FiSettings,
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

const CHART_TYPES = [
  { value: 'bar',         label: 'Cột (Bar)' },
  { value: 'bar_h',       label: 'Cột ngang (Horizontal Bar)' },
  { value: 'line',        label: 'Đường (Line)' },
  { value: 'pie',         label: 'Tròn (Pie)' },
  { value: 'doughnut',    label: 'Vòng (Doughnut)' },
  { value: 'radar',       label: 'Mạng nhện (Radar)' },
  { value: 'area',        label: 'Vùng (Area)' },
  { value: 'scatter',     label: 'Phân tán (Scatter)' },
  { value: 'bubble',      label: 'Bong bóng (Bubble)' },
  { value: 'waterfall',   label: 'Thác nước (Waterfall)' },
  { value: 'gauge',       label: 'Đồng hồ (Gauge)' },
  { value: 'progress',    label: 'Thanh tiến độ (Progress)' },
];

const NUMBER_STYLES = [
  { value: 'none',        label: 'Không đánh số' },
  { value: '1',           label: '1. 2. 3.' },
  { value: 'A',           label: 'A. B. C.' },
  { value: 'a',           label: 'a. b. c.' },
  { value: 'I',           label: 'I. II. III.' },
  { value: 'i',           label: 'i. ii. iii.' },
  { value: 'custom',      label: 'Tuỳ chỉnh...' },
];

const emptySection = (type = 'text', parentId = null) => ({
  id: uid(),
  title: '',
  type,
  parentId,
  textContent: '',
  images: [],
  files: [],
  tableData: {
    headers: ['Cột 1', 'Cột 2', 'Cột 3'],
    rows: [['', '', '']],
    showHeader: true,
    cellStyles: {},   // { "ri_ci": { bold, italic, bg, color, align } }
    colWidths: {},    // { ci: width }
    merges: {},       // { "ri_ci": { rowspan, colspan } }
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
});

/* ─────────────────────────────────────────
   EXCEL-LIKE TABLE EDITOR (nâng cấp)
───────────────────────────────────────── */
function TableEditor({ tableData, onChange }) {
  const {
    headers = [],
    rows = [],
    showHeader = true,
    cellStyles = {},
    colWidths = {},
    merges = {},
  } = tableData;

  const [selected, setSelected] = useState(null); // { ri, ci } hoặc null (-1 = header)
  const [duplicateTable, setDuplicateTable] = useState(false);

  const update = (patch) => onChange({ ...tableData, ...patch });
  const updateCell = (ri, ci, val) => {
    const newR = rows.map((r, i) => i === ri ? r.map((c, j) => j === ci ? val : c) : r);
    update({ rows: newR });
  };
  const updateHeader = (ci, val) => {
    const h = [...headers]; h[ci] = val; update({ headers: h });
  };
  const addRow = () => update({ rows: [...rows, headers.map(() => '')] });
  const removeRow = (ri) => update({ rows: rows.filter((_, i) => i !== ri) });
  const duplicateRow = (ri) => {
    const newR = [...rows]; newR.splice(ri + 1, 0, [...rows[ri]]); update({ rows: newR });
  };
  const addCol = () => {
    update({ headers: [...headers, `Cột ${headers.length + 1}`], rows: rows.map(r => [...r, '']) });
  };
  const removeCol = (ci) => {
    update({ headers: headers.filter((_, i) => i !== ci), rows: rows.map(r => r.filter((_, i) => i !== ci)) });
  };
  const moveRow = (ri, dir) => {
    const ni = ri + dir; if (ni < 0 || ni >= rows.length) return;
    const newR = [...rows]; [newR[ri], newR[ni]] = [newR[ni], newR[ri]]; update({ rows: newR });
  };
  const moveCol = (ci, dir) => {
    const ni = ci + dir; if (ni < 0 || ni >= headers.length) return;
    const newH = [...headers]; [newH[ci], newH[ni]] = [newH[ni], newH[ci]];
    const newR = rows.map(r => { const nr = [...r]; [nr[ci], nr[ni]] = [nr[ni], nr[ci]]; return nr; });
    update({ headers: newH, rows: newR });
  };

  /* Cell style helpers */
  const getCStyle = (ri, ci) => cellStyles[`${ri}_${ci}`] || {};
  const setCStyle = (ri, ci, patch) => {
    const k = `${ri}_${ci}`;
    update({ cellStyles: { ...cellStyles, [k]: { ...getCStyle(ri, ci), ...patch } } });
  };

  /* Selected cell tools */
  const sel = selected;
  const selStyle = sel ? getCStyle(sel.ri, sel.ci) : {};

  const CELL_MIN_W = 120;
  const TB = ({ onClick, title, active, children, small }) => (
    <button type="button" title={title} onClick={onClick}
      style={{ padding: small ? '2px 5px' : '0.3rem 0.5rem', border: `1px solid ${active ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '4px', background: active ? '#eff6ff' : '#fff', cursor: 'pointer', color: active ? '#2563eb' : '#374151', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
      {children}
    </button>
  );

  /* Import từ CSV */
  const handleCsvImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      const lines = text.trim().split('\n').map(l => l.split(',').map(c => c.replace(/^"|"$/g, '').trim()));
      if (lines.length < 1) return;
      const newHeaders = lines[0];
      const newRows = lines.slice(1);
      update({ headers: newHeaders, rows: newRows });
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div>
      {/* ── Table toolbar ── */}
      <div style={{ display: 'flex', gap: '4px', padding: '0.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center', border: '1px solid #e2e8f0' }}>
        {/* Hiện/ẩn header */}
        <TB onClick={() => update({ showHeader: !showHeader })} title={showHeader ? 'Ẩn hàng tiêu đề' : 'Hiện hàng tiêu đề'} active={showHeader}>
          {showHeader ? <FiEye size={12} /> : <FiEyeOff size={12} />} Header
        </TB>

        <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }} />

        {/* Cell formatting – chỉ hiện khi có ô chọn */}
        {sel && (
          <>
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { bold: !selStyle.bold })} active={selStyle.bold} title="In đậm"><b>B</b></TB>
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { italic: !selStyle.italic })} active={selStyle.italic} title="In nghiêng"><i>I</i></TB>
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { underline: !selStyle.underline })} active={selStyle.underline} title="Gạch chân"><u>U</u></TB>
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { strike: !selStyle.strike })} active={selStyle.strike} title="Gạch ngang"><s>S</s></TB>
            <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }} />
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { align: 'left' })} active={selStyle.align === 'left'} title="Căn trái"><FiAlignLeft size={11} /></TB>
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { align: 'center' })} active={selStyle.align === 'center'} title="Căn giữa"><FiAlignCenter size={11} /></TB>
            <TB onClick={() => setCStyle(sel.ri, sel.ci, { align: 'right' })} active={selStyle.align === 'right'} title="Căn phải"><FiAlignRight size={11} /></TB>
            <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }} />
            {/* Màu chữ */}
            <label title="Màu chữ" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.3rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.78rem' }}>
              <FiType size={11} style={{ color: selStyle.color || '#374151' }} />
              <input type="color" defaultValue={selStyle.color || '#374151'}
                onChange={e => setCStyle(sel.ri, sel.ci, { color: e.target.value })}
                style={{ width: '14px', height: '14px', border: 'none', padding: 0, cursor: 'pointer', opacity: 0, position: 'absolute' }} />
            </label>
            {/* Màu nền ô */}
            <label title="Màu nền ô" style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0.3rem 0.4rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: selStyle.bg || '#fff', cursor: 'pointer', fontSize: '0.78rem' }}>
              <FiDroplet size={11} />
              <input type="color" defaultValue={selStyle.bg || '#ffffff'}
                onChange={e => setCStyle(sel.ri, sel.ci, { bg: e.target.value })}
                style={{ width: '14px', height: '14px', border: 'none', padding: 0, cursor: 'pointer', opacity: 0, position: 'absolute' }} />
            </label>
            <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }} />
          </>
        )}

        {/* Chèn hàng / cột */}
        <TB onClick={addRow} title="Thêm hàng"><FiPlus size={11} /> Hàng</TB>
        <TB onClick={addCol} title="Thêm cột"><FiPlus size={11} /> Cột</TB>
        {sel && (
          <>
            <TB onClick={() => duplicateRow(sel.ri)} title="Nhân bản hàng đang chọn"><FiCopy size={11} /> Nhân hàng</TB>
          </>
        )}

        <div style={{ width: '1px', height: '18px', background: '#e2e8f0' }} />

        {/* Import CSV */}
        <label title="Import từ CSV" style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '0.3rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, color: '#374151' }}>
          CSV
          <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCsvImport} />
        </label>

        {/* Nhân bản toàn bộ bảng */}
        <TB onClick={() => {
          const copy = JSON.parse(JSON.stringify(tableData));
          // Gọi onChange 2 lần giả lập – để dùng được cần báo parent, tạm thời bỏ qua
          // Vì đây là trong SectionEditor, tính năng này cần parent handle
        }} title="Nhân bản bảng"><FiCopy size={11} /> Nhân bảng</TB>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1.5px solid #e2e8f0' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', tableLayout: 'fixed' }}>
          {showHeader && (
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                <th style={{ width: '32px', padding: '0.3rem', borderRight: '1px solid #e2e8f0', borderBottom: '2px solid #e2e8f0' }} />
                {headers.map((h, ci) => (
                  <th key={ci} style={{ padding: '0.3rem', borderBottom: '2px solid #e2e8f0', borderRight: '1px solid #e8edf2', minWidth: `${CELL_MIN_W}px` }}>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '3px', justifyContent: 'center' }}>
                      <button type="button" onClick={() => moveCol(ci, -1)} disabled={ci === 0} style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.65rem', opacity: ci === 0 ? 0.3 : 1 }}>←</button>
                      <button type="button" onClick={() => moveCol(ci, 1)} disabled={ci === headers.length - 1} style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.65rem', opacity: ci === headers.length - 1 ? 0.3 : 1 }}>→</button>
                      <button type="button" onClick={() => removeCol(ci)} disabled={headers.length <= 1} style={{ padding: '1px 4px', border: '1px solid #fecaca', borderRadius: '3px', background: '#fff', cursor: 'pointer', color: '#ef4444', fontSize: '0.65rem', opacity: headers.length <= 1 ? 0.3 : 1 }}>✕</button>
                    </div>
                    <input value={h} onChange={e => updateHeader(ci, e.target.value)}
                      style={{ width: '100%', padding: '0.3rem 0.4rem', border: '1px solid #cbd5e1', borderRadius: '5px', fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', boxSizing: 'border-box', outline: 'none', background: '#fff' }} />
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: ri % 2 === 0 ? '#fff' : '#fafafa' }}>
                {/* Row controls */}
                <td style={{ padding: '0.2rem', borderRight: '1px solid #f1f5f9', verticalAlign: 'middle', width: '32px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                    <button type="button" onClick={() => moveRow(ri, -1)} disabled={ri === 0} style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.6rem', opacity: ri === 0 ? 0.3 : 1 }}>↑</button>
                    <button type="button" onClick={() => moveRow(ri, 1)} disabled={ri === rows.length - 1} style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.6rem', opacity: ri === rows.length - 1 ? 0.3 : 1 }}>↓</button>
                    <button type="button" onClick={() => duplicateRow(ri)} title="Nhân bản hàng" style={{ padding: '1px 4px', border: '1px solid #e2e8f0', borderRadius: '3px', background: '#fff', cursor: 'pointer', fontSize: '0.6rem' }}>⎘</button>
                    <button type="button" onClick={() => removeRow(ri)} disabled={rows.length <= 1} style={{ padding: '1px 4px', border: '1px solid #fecaca', borderRadius: '3px', background: '#fff', cursor: 'pointer', color: '#ef4444', fontSize: '0.6rem', opacity: rows.length <= 1 ? 0.3 : 1 }}>✕</button>
                  </div>
                </td>
                {row.map((cell, ci) => {
                  const cs = getCStyle(ri, ci);
                  const isSelected = sel && sel.ri === ri && sel.ci === ci;
                  return (
                    <td key={ci} style={{ padding: '0.2rem', verticalAlign: 'top', borderRight: '1px solid #f1f5f9' }}>
                      <textarea
                        value={cell}
                        onChange={e => updateCell(ri, ci, e.target.value)}
                        onFocus={() => setSelected({ ri, ci })}
                        rows={2}
                        style={{
                          width: '100%', padding: '0.35rem 0.5rem', border: `1.5px solid ${isSelected ? '#93c5fd' : '#e2e8f0'}`, borderRadius: '5px',
                          fontSize: '0.82rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
                          lineHeight: '1.5', boxSizing: 'border-box', minHeight: '48px',
                          backgroundColor: cs.bg || '#fff', color: cs.color || '#374151',
                          fontWeight: cs.bold ? 700 : 400, fontStyle: cs.italic ? 'italic' : 'normal',
                          textDecoration: cs.underline ? 'underline' : cs.strike ? 'line-through' : 'none',
                          textAlign: cs.align || 'left',
                        }}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Hint */}
      {sel && <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: '0.375rem 0 0', fontStyle: 'italic' }}>Ô đang chọn: [{sel.ri + 1},{sel.ci + 1}] — dùng thanh công cụ để định dạng</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   CHART EDITOR (nâng cấp toàn diện)
───────────────────────────────────────── */
function ChartEditor({ sec, upd }) {
  const [csvText, setCsvText] = useState('');
  const [showCsvInput, setShowCsvInput] = useState(false);

  const COLORS_PRESET = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

  const updateItem = (idx, patch) => {
    const d = [...sec.chartData]; d[idx] = { ...d[idx], ...patch }; upd({ chartData: d });
  };
  const removeItem = (idx) => upd({ chartData: sec.chartData.filter((_, i) => i !== idx) });
  const addItem = () => {
    const i = sec.chartData.length;
    upd({ chartData: [...sec.chartData, { label: `Mục ${i + 1}`, value: 50, color: COLORS_PRESET[i % COLORS_PRESET.length] }] });
  };

  const importCsv = () => {
    const lines = csvText.trim().split('\n').filter(Boolean);
    const data = lines.map((l, i) => {
      const [label, value, color] = l.split(',').map(s => s.trim());
      return { label: label || `Mục ${i + 1}`, value: parseFloat(value) || 0, color: color || COLORS_PRESET[i % COLORS_PRESET.length] };
    });
    if (data.length > 0) { upd({ chartData: data }); setShowCsvInput(false); setCsvText(''); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {/* Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Loại biểu đồ</label>
          <select value={sec.chartType || 'bar'} onChange={e => upd({ chartType: e.target.value })}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', fontWeight: 700, outline: 'none', backgroundColor: '#fff' }}>
            {CHART_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Tiêu đề biểu đồ</label>
          <input type="text" placeholder="Tên biểu đồ (tuỳ chọn)" value={sec.chartTitle || ''} onChange={e => upd({ chartTitle: e.target.value })}
            style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
          <input type="checkbox" checked={sec.chartShowValues !== false} onChange={e => upd({ chartShowValues: e.target.checked })} />
          Hiện giá trị
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
          <input type="checkbox" checked={sec.chartShowLegend !== false} onChange={e => upd({ chartShowLegend: e.target.checked })} />
          Hiện chú thích
        </label>
      </div>

      {/* Import CSV */}
      <div>
        <button type="button" onClick={() => setShowCsvInput(v => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.4rem 0.875rem', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
          📊 Import dữ liệu từ CSV / bảng
        </button>
        {showCsvInput && (
          <div style={{ marginTop: '0.5rem', padding: '0.875rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.5rem', fontStyle: 'italic' }}>Định dạng: Nhãn, Giá trị, Màu (tuỳ chọn) — mỗi dòng một mục</p>
            <textarea rows={5} value={csvText} onChange={e => setCsvText(e.target.value)} placeholder={"Doanh thu Q1, 1250000, #2563eb\nDoanh thu Q2, 1800000, #10b981\nDoanh thu Q3, 1450000, #f59e0b"}
              style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', fontFamily: 'monospace', resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button type="button" onClick={importCsv}
                style={{ padding: '0.45rem 1rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Import</button>
              <button type="button" onClick={() => setShowCsvInput(false)}
                style={{ padding: '0.45rem 1rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Hủy</button>
            </div>
          </div>
        )}
      </div>

      {/* Data rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {(sec.chartData || []).map((item, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem', backgroundColor: '#fafafa', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
            <input type="color" value={item.color || '#2563eb'} onChange={e => updateItem(idx, { color: e.target.value })}
              style={{ width: '32px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '6px', padding: 0, flexShrink: 0 }} />
            <input type="text" placeholder="Nhãn" value={item.label} onChange={e => updateItem(idx, { label: e.target.value })}
              style={{ flex: 2, padding: '0.45rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
            <input type="number" placeholder="Giá trị" value={item.value} onChange={e => updateItem(idx, { value: Number(e.target.value) })}
              style={{ flex: 1, padding: '0.45rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none', textAlign: 'center' }} />
            <button type="button" onClick={() => removeItem(idx)}
              style={{ padding: '6px 8px', border: '1px solid #fecaca', borderRadius: '7px', background: '#fff', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <FiTrash2 size={13} />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={addItem}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '0.5rem 1rem', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', width: 'fit-content' }}>
        <FiPlus size={13} /> Thêm mục dữ liệu
      </button>
    </div>
  );
}

/* RichEditor = alias dùng RichTextEditor đã import, truyền thêm onUploadImage */
function RichEditor({ value, onChange, onUploadImage }) {
  return (
    <RichTextEditor
      value={value}
      onChange={onChange}
      onUploadImage={onUploadImage}
      compact={false}
    />
  );
}

/* ─────────────────────────────────────────
   SECTION EDITOR
───────────────────────────────────────── */
function SectionEditor({ sec, index, total, numberingStyle, onUpdate, onRemove, onMove, onAddChild, setNotification }) {
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
    if (res?.url) upd({ images: [...(sec.images || []), { url: res.url, caption: '', align: 'center', width: '100%' }] });
  };

  const addFile = async (file) => {
    const res = await handleImageUpload(file);
    if (res?.url) upd({ files: [...(sec.files || []), { url: res.url, name: file.name }] });
  };

  // Tính nhãn đánh số
  const getLabel = () => {
    if (!numberingStyle || numberingStyle === 'none') return '';
    const n = index + 1;
    if (numberingStyle === '1') return `${n}.`;
    if (numberingStyle === 'A') return `${String.fromCharCode(64 + n)}.`;
    if (numberingStyle === 'a') return `${String.fromCharCode(96 + n)}.`;
    if (numberingStyle === 'I') {
      const roman = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];
      return `${roman[index] || n}.`;
    }
    if (numberingStyle === 'i') {
      const roman = ['i','ii','iii','iv','v','vi','vii','viii','ix','x','xi','xii'];
      return `${roman[index] || n}.`;
    }
    return '';
  };

  const TypeIcon = BLOCK_TYPES.find(b => b.type === sec.type)?.icon || FiType;

  return (
    <div style={{
      border: '1.5px solid', borderColor: isChild ? '#dbeafe' : '#e2e8f0',
      borderRadius: '12px', backgroundColor: isChild ? '#f8fbff' : '#fff',
      marginLeft: isChild ? '1.5rem' : '0', overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: isChild ? '#eff6ff' : '#f8fafc', borderBottom: collapsed ? 'none' : '1px solid #f1f5f9', cursor: 'pointer' }}
        onClick={() => setCollapsed(v => !v)}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: isChild ? '#dbeafe' : '#e2e8f0', borderRadius: '6px', flexShrink: 0, color: '#2563eb' }}>
          <TypeIcon size={14} />
        </div>
        {getLabel() && (
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6366f1', minWidth: '24px' }}>{getLabel()}</span>
        )}
        <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 700, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sec.title || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa đặt tiêu đề</span>}
        </span>

        <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {/* Ẩn khỏi mục lục */}
          <button type="button" onClick={() => upd({ showInToc: !sec.showInToc })}
            title={sec.showInToc !== false ? 'Đang hiện trong mục lục' : 'Đang ẩn khỏi mục lục'}
            style={{ padding: '4px 6px', border: `1px solid ${sec.showInToc !== false ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: '5px', background: sec.showInToc !== false ? '#f0fdf4' : '#f1f5f9', color: sec.showInToc !== false ? '#16a34a' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            {sec.showInToc !== false ? <FiEye size={11} /> : <FiEyeOff size={11} />}
          </button>
          {!isChild && (
            <button type="button" onClick={() => onAddChild(sec.id)} title="Thêm mục con"
              style={{ padding: '4px 6px', border: '1px solid #bfdbfe', borderRadius: '5px', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
              <FiChevronsRight size={11} /> Con
            </button>
          )}
          <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
            style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', color: '#475569', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }}>
            <FiChevronUp size={13} />
          </button>
          <button type="button" onClick={() => onMove(index, 1)} disabled={index >= total - 1}
            style={{ padding: '4px 6px', border: '1px solid #e2e8f0', borderRadius: '5px', background: '#fff', color: '#475569', cursor: 'pointer', opacity: index >= total - 1 ? 0.3 : 1 }}>
            <FiChevronDown size={13} />
          </button>
          <button type="button" onClick={() => onRemove(sec.id)}
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
            <input type="text" placeholder="Tiêu đề mục..." value={sec.title} onChange={e => upd({ title: e.target.value })}
              style={{ padding: '0.6rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, outline: 'none', width: '100%', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#93c5fd'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            <select value={sec.type} onChange={e => upd({ type: e.target.value })}
              style={{ padding: '0.6rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#374151', backgroundColor: '#f8fafc', outline: 'none', cursor: 'pointer' }}>
              {BLOCK_TYPES.map(b => <option key={b.type} value={b.type}>{b.label}</option>)}
            </select>
          </div>

          {/* TEXT */}
          {sec.type === 'text' && (
            <RichEditor value={sec.textContent || ''} onChange={val => upd({ textContent: val })} onUploadImage={handleImageUpload} />
          )}

          {/* IMAGE */}
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
                  <div style={{ padding: '0.625rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="Caption ảnh..." value={img.caption || ''}
                      onChange={e => { const imgs = [...sec.images]; imgs[idx] = { ...img, caption: e.target.value }; upd({ images: imgs }); }}
                      style={{ flex: 2, padding: '0.5rem 0.75rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.82rem', outline: 'none' }} />
                    <select value={img.align || 'center'}
                      onChange={e => { const imgs = [...sec.images]; imgs[idx] = { ...img, align: e.target.value }; upd({ images: imgs }); }}
                      style={{ flex: 1, padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', outline: 'none' }}>
                      <option value="left">Căn trái</option>
                      <option value="center">Căn giữa</option>
                      <option value="right">Căn phải</option>
                      <option value="full">Full width</option>
                    </select>
                    <input type="text" placeholder="Độ rộng (100%, 400px...)" value={img.width || '100%'}
                      onChange={e => { const imgs = [...sec.images]; imgs[idx] = { ...img, width: e.target.value }; upd({ images: imgs }); }}
                      style={{ flex: 1, padding: '0.5rem 0.625rem', border: '1px solid #e2e8f0', borderRadius: '7px', fontSize: '0.8rem', outline: 'none', minWidth: '80px' }} />
                  </div>
                </div>
              ))}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.75rem 1.25rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '10px', cursor: 'pointer', color: '#475569', fontSize: '0.85rem', fontWeight: 700, justifyContent: 'center' }}>
                <FiUploadCloud size={16} color="#2563eb" /> Tải ảnh lên
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={async e => { for (const f of Array.from(e.target.files)) await addImage(f); e.target.value = ''; }} />
              </label>
            </div>
          )}

          {/* TABLE */}
          {sec.type === 'table' && (
            <TableEditor tableData={sec.tableData || { headers: [], rows: [], showHeader: true, cellStyles: {} }} onChange={tableData => upd({ tableData })} />
          )}

          {/* FILE */}
          {sec.type === 'file' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {(sec.files || []).map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiPaperclip size={13} color="#2563eb" /> {file.name}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input type="text" value={file.name}
                      onChange={e => { const files = [...sec.files]; files[idx] = { ...file, name: e.target.value }; upd({ files }); }}
                      placeholder="Tên hiển thị"
                      style={{ padding: '0.3rem 0.6rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.8rem', outline: 'none', width: '160px' }} />
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

          {/* CHART */}
          {sec.type === 'chart' && (
            <ChartEditor sec={sec} upd={upd} />
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

  const upd = (patch) => { setProject(p => ({ ...p, ...patch })); setIsDirty(true); };

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

  const flatSections = project.sections || [];
  const addSection = (type = 'text', parentId = null) => {
    upd({ sections: [...flatSections, emptySection(type, parentId)] });
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
    if (!project.title.trim()) { setNotification({ open: true, type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập tên dự án.' }); return; }
    if (!project.slug.trim()) { setNotification({ open: true, type: 'error', title: 'Thiếu thông tin', message: 'Vui lòng nhập slug dự án.' }); return; }
    setIsDirty(false);
    onSave(project);
  };

  const handleClose = () => { if (isDirty) setShowConfirm(true); else onClose(); };

  const roots = flatSections.filter(s => !s.parentId);

  const TABS = [
    { id: 'basic', label: 'Thông tin chung' },
    { id: 'sections', label: `Nội dung (${flatSections.length})` },
    { id: 'toc', label: 'Mục lục & Số thứ tự' },
  ];

  const INPUT_STYLE = { width: '100%', padding: '0.65rem 0.875rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.82)', backdropFilter: 'blur(6px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem' }}>
      <style>{`
        .pm-wrap { background:#fff; border-radius:16px; width:100%; max-width:960px; max-height:96vh; display:flex; flex-direction:column; box-shadow:0 30px 60px rgba(0,0,0,0.25); }
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
        {/* HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.125rem 1.5rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0, gap: '0.75rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {mode === 'add' ? <><FiEdit3 size={18} color="#2563eb" /> Thêm dự án mới</> : <><FiEdit size={18} color="#10b981" /> Chỉnh sửa dự án</>}
          </h3>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <FiX size={22} />
          </button>
        </div>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc', flexShrink: 0 }}>
          {TABS.map(tab => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
              style={{ padding: '0.75rem 1.25rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: activeTab === tab.id ? 800 : 600, color: activeTab === tab.id ? '#2563eb' : '#64748b', borderBottom: activeTab === tab.id ? '2.5px solid #2563eb' : '2.5px solid transparent', transition: 'all 0.2s' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="pm-body">

          {/* ════ TAB BASIC ════ */}
          {activeTab === 'basic' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="pm-grid-2">
                <div><label className="pm-label">Tên dự án *</label><input className="pm-input" style={INPUT_STYLE} type="text" placeholder="Tên dự án..." value={project.title} onChange={e => handleTitleChange(e.target.value)} /></div>
                <div><label className="pm-label">Slug (URL) *</label><input className="pm-input" style={INPUT_STYLE} type="text" placeholder="ten-du-an" value={project.slug} onChange={e => upd({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} /></div>
              </div>
              <div className="pm-grid-2">
                <div><label className="pm-label">Ngành nghề</label><input className="pm-input" style={INPUT_STYLE} type="text" placeholder="FINTECH, HEALTHCARE..." value={project.category || ''} onChange={e => upd({ category: e.target.value })} /></div>
                <div><label className="pm-label">Khách hàng</label><input className="pm-input" style={INPUT_STYLE} type="text" placeholder="Tên khách hàng / công ty" value={project.client || ''} onChange={e => upd({ client: e.target.value })} /></div>
              </div>
              <div className="pm-grid-3">
                <div><label className="pm-label">Thời gian</label><input className="pm-input" style={INPUT_STYLE} type="text" placeholder="Q1/2024 – Q3/2024" value={project.duration || ''} onChange={e => upd({ duration: e.target.value })} /></div>
                <div><label className="pm-label">Chỉ số nổi bật</label><input className="pm-input" style={INPUT_STYLE} type="text" placeholder="98.5% Uptime..." value={project.metric || ''} onChange={e => upd({ metric: e.target.value })} /></div>
                <div><label className="pm-label">Link Demo</label><input className="pm-input" style={INPUT_STYLE} type="url" placeholder="https://..." value={project.demoUrl || ''} onChange={e => upd({ demoUrl: e.target.value })} /></div>
              </div>
              <div>
                <label className="pm-label">Mô tả ngắn</label>
                <RichEditor value={project.description || ''} onChange={val => upd({ description: val })} onUploadImage={async (file) => { const res = await uploadFileToStorage(file, 'assets'); return res; }} />
              </div>
              <div>
                <label className="pm-label">Công nghệ & Công cụ</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.625rem' }}>
                  <input style={{ ...INPUT_STYLE, flex: 1 }} type="text" placeholder="Nhập rồi Enter (VD: Figma, SQL...)" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }} />
                  <button type="button" onClick={addTech} style={{ padding: '0.65rem 1rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1.5px solid #bfdbfe', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}><FiPlus size={15} /></button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(project.technologies || []).map(t => (
                    <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '0.25rem 0.625rem', fontSize: '0.78rem', fontWeight: 700 }}>
                      {t}
                      <button type="button" onClick={() => removeTech(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: 0, display: 'flex', alignItems: 'center' }}><FiX size={11} /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="pm-label">Ảnh bìa dự án</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1.5px dashed #cbd5e1', flexWrap: 'wrap' }}>
                  {project.coverImage && (
                    <div style={{ position: 'relative' }}>
                      <img src={project.coverImage} alt="" style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      <button type="button" onClick={() => upd({ coverImage: '' })} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', border: 'none', color: '#fff', width: '20px', height: '20px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={11} /></button>
                    </div>
                  )}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.6rem 1.125rem', backgroundColor: '#fff', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                    <FiUploadCloud size={15} color="#2563eb" /> {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading} onChange={e => { if (e.target.files[0]) handleUploadCover(e.target.files[0]); e.target.value = ''; }} />
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {[
                  { key: 'isPinned', label: 'Ghim nổi bật', color: '#d97706', bg: '#fef3c7' },
                  { key: 'isHidden', label: 'Ẩn dự án', color: '#64748b', bg: '#f1f5f9' },
                ].map(({ key, label, color }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                    <div onClick={() => upd({ [key]: !project[key] })} style={{ width: '40px', height: '22px', borderRadius: '11px', position: 'relative', transition: 'background 0.2s', backgroundColor: project[key] ? color : '#cbd5e1', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', top: '3px', left: project[key] ? '21px' : '3px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: project[key] ? color : '#94a3b8' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ════ TAB SECTIONS ════ */}
          {activeTab === 'sections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
                      sec={sec} index={idx} total={roots.length}
                      numberingStyle={project.numberingStyle}
                      onUpdate={updateSection} onRemove={removeSection} onMove={moveSection}
                      onAddChild={(parentId) => addSection('text', parentId)}
                      setNotification={setNotification}
                    />
                    {children.map((child, ci) => (
                      <SectionEditor
                        key={child.id} sec={child} index={ci} total={children.length}
                        numberingStyle="none"
                        onUpdate={updateSection} onRemove={removeSection}
                        onMove={(i, dir) => {
                          const ni = i + dir; if (ni < 0 || ni >= children.length) return;
                          const newCh = [...children]; [newCh[i], newCh[ni]] = [newCh[ni], newCh[i]];
                          const others = flatSections.filter(s => s.parentId !== sec.id && s.id !== sec.id);
                          upd({ sections: [sec, ...newCh, ...others.filter(s => !s.parentId)] });
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

          {/* ════ TAB TOC ════ */}
          {activeTab === 'toc' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>Cài đặt mục lục</h4>

                {/* Hiển thị / ẩn mục lục */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none', marginBottom: '1rem' }}>
                  <div onClick={() => upd({ showToc: !project.showToc })}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', position: 'relative', backgroundColor: project.showToc !== false ? '#2563eb' : '#cbd5e1', cursor: 'pointer', transition: 'background 0.2s' }}>
                    <div style={{ position: 'absolute', top: '4px', left: project.showToc !== false ? '22px' : '4px', width: '16px', height: '16px', borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Hiển thị mục lục sidebar</span>
                </label>

                {/* Kiểu đánh số */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '0.5rem' }}>KIỂU ĐÁNH SỐ MỤC LỤC</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {NUMBER_STYLES.map(ns => (
                      <button key={ns.value} type="button"
                        onClick={() => upd({ numberingStyle: ns.value })}
                        style={{ padding: '0.45rem 0.875rem', border: `1.5px solid ${project.numberingStyle === ns.value ? '#2563eb' : '#e2e8f0'}`, borderRadius: '8px', background: project.numberingStyle === ns.value ? '#eff6ff' : '#fff', color: project.numberingStyle === ns.value ? '#2563eb' : '#374151', cursor: 'pointer', fontSize: '0.82rem', fontWeight: project.numberingStyle === ns.value ? 700 : 500 }}>
                        {ns.label}
                      </button>
                    ))}
                  </div>
                </div>

                {project.numberingStyle === 'custom' && (
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px' }}>Tuỳ chỉnh prefix (VD: "Phần ", "Step ")</label>
                    <input type="text" value={project.customNumberPrefix || ''} onChange={e => upd({ customNumberPrefix: e.target.value })}
                      placeholder="Phần " style={{ padding: '0.55rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '7px', fontSize: '0.85rem', outline: 'none', width: '200px' }} />
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0.375rem 0 0', fontStyle: 'italic' }}>Kết quả: {project.customNumberPrefix || 'Phần '}1, {project.customNumberPrefix || 'Phần '}2, ...</p>
                  </div>
                )}
              </div>

              {/* Preview mục lục */}
              <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 0.875rem', fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiList size={14} /> Xem trước mục lục
                </h4>
                {roots.filter(s => s.showInToc !== false).length === 0
                  ? <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>Chưa có mục nào hoặc tất cả đều bị ẩn.</p>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {roots.filter(s => s.showInToc !== false).map((sec, idx) => {
                        let label = '';
                        const n = idx + 1;
                        if (project.numberingStyle === '1') label = `${n}. `;
                        else if (project.numberingStyle === 'A') label = `${String.fromCharCode(64 + n)}. `;
                        else if (project.numberingStyle === 'a') label = `${String.fromCharCode(96 + n)}. `;
                        else if (project.numberingStyle === 'I') label = `${'I'.repeat(n)}. `;
                        else if (project.numberingStyle === 'custom') label = `${project.customNumberPrefix || 'Phần '}${n} `;
                        const children = flatSections.filter(s => s.parentId === sec.id && s.showInToc !== false);
                        return (
                          <div key={sec.id}>
                            <div style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', borderLeft: '3px solid #2563eb', marginBottom: '1px' }}>
                              {label}{sec.title || '(Chưa đặt tiêu đề)'}
                            </div>
                            {children.map(child => (
                              <div key={child.id} style={{ padding: '0.3rem 0.75rem 0.3rem 1.75rem', fontSize: '0.8rem', color: '#4b5563', borderLeft: '2px solid #e2e8f0', marginLeft: '0.75rem', marginBottom: '1px' }}>
                                └ {child.title || '(Chưa đặt tiêu đề)'}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  )
                }
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', flexShrink: 0, gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            {flatSections.length} mục nội dung {isDirty && <span style={{ color: '#f59e0b', fontWeight: 700 }}>• Chưa lưu</span>}
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