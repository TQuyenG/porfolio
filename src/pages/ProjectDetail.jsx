import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import {
  FiArrowLeft, FiClock, FiLayers, FiPaperclip, FiDownload,
  FiMaximize2, FiX, FiChevronLeft, FiChevronRight, FiExternalLink,
  FiUsers, FiTrendingUp, FiTag, FiList, FiChevronDown, FiChevronUp, FiFileText,
} from 'react-icons/fi';

/* ═══════════════════════════════════════════════════
   BUILD SECTION TREE — đệ quy không giới hạn depth
   Flat array → tree giữ đúng thứ tự, mỗi node kèm children
═══════════════════════════════════════════════════ */
function buildSectionTree(flat = []) {
  // Xây childMap: parentId → [children theo thứ tự]
  const childMap = {};
  flat.forEach(s => {
    const pid = s.parentId || null;
    if (!childMap[pid]) childMap[pid] = [];
    childMap[pid].push(s);
  });
  // Đệ quy gắn children vào từng node
  const attachChildren = (nodes) =>
    (nodes || []).map(n => ({
      ...n,
      children: attachChildren(childMap[n.id] || []),
    }));
  return attachChildren(childMap[null] || []);
}

/* ═══════════════════════════════════════════════════
   LIGHTBOX — hỗ trợ image / table / chart
═══════════════════════════════════════════════════ */
function Lightbox({ list, index, onClose, onPrev, onNext, type = 'image', tableContent, chartContent }) {
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && type === 'image') onPrev();
      if (e.key === 'ArrowRight' && type === 'image') onNext();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', h);
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose, onPrev, onNext, type]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,10,20,0.97)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }} onClick={onClose}>
      <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <FiX />
      </button>

      {type === 'image' && (
        <>
          {list.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onPrev(); }} style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiChevronLeft /></button>
              <button onClick={(e) => { e.stopPropagation(); onNext(); }} style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiChevronRight /></button>
            </>
          )}
          <img src={list[index]} alt="Phóng to" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw', maxHeight: '88vh', borderRadius: '10px', objectFit: 'contain', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }} />
          {list.length > 1 && (
            <div style={{ position: 'absolute', bottom: '1.25rem', display: 'flex', gap: '6px' }}>
              {list.map((_, i) => <div key={i} style={{ width: i === index ? '20px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === index ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />)}
            </div>
          )}
        </>
      )}

      {type === 'table' && tableContent && (
        <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(95vw, 1100px)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
          <div style={{ padding: '0.875rem 1.25rem', backgroundColor: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}> {tableContent.title || 'Bảng dữ liệu'}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>{tableContent.rows?.length || 0} hàng · {tableContent.headers?.length || 0} cột</span>
          </div>
          <div style={{ overflowY: 'auto', overflowX: 'auto', flex: 1, backgroundColor: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: `${Math.max((tableContent.headers?.length || 1) * 160, 400)}px` }}>
              {tableContent.showHeader && tableContent.headers?.some(h => h && !h.match(/^Cột\s*\d+$/)) && (
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                    {tableContent.headers.map((h, i) => <th key={i} style={{ padding: '0.875rem 1.125rem', textAlign: 'left', color: '#1e293b', fontWeight: 700, fontSize: '0.85rem', position: 'sticky', top: 0, background: '#f1f5f9' }}>{h}</th>)}
                  </tr>
                </thead>
              )}
              <tbody>
                {(tableContent.rows || []).map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: ri % 2 === 0 ? '#fff' : '#fafbfc' }}>
                    {row.map((cell, ci) => {
                      const cs = (tableContent.cellStyles || {})[`${ri}_${ci}`] || {};
                      return (
                        <td key={ci} style={{ padding: '0.875rem 1.125rem', verticalAlign: 'top', lineHeight: '1.6', color: cs.color || '#374151', backgroundColor: cs.bg || 'transparent', fontWeight: cs.bold ? 700 : 400, fontStyle: cs.italic ? 'italic' : 'normal', textDecoration: cs.underline ? 'underline' : 'none', textAlign: cs.align || 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                          {typeof cell === 'string' && cell.includes('<') ? <span dangerouslySetInnerHTML={{ __html: cell }} /> : cell}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {type === 'chart' && chartContent && (
        <div onClick={(e) => e.stopPropagation()} style={{ width: 'min(90vw, 720px)', maxHeight: '88vh', overflowY: 'auto', borderRadius: '14px', boxShadow: '0 30px 80px rgba(0,0,0,0.6)' }}>
          <ChartBlock sec={chartContent} isFullscreen />
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   BLOCK RENDERERS
═══════════════════════════════════════════════════ */
/* ── Analysis text block (dùng chung cho image/chart/table) ── */
function AnalysisBlock({ html }) {
  if (!html) return null;
  return (
    <div className="rich-content analysis-block" style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#374151', lineHeight: '1.8' }}
      dangerouslySetInnerHTML={{ __html: html }} />
  );
}

function TextBlock({ sec }) {
  return (
    <div className="rich-content" style={{ color: '#374151', fontSize: '0.975rem', lineHeight: '1.85' }}
      dangerouslySetInnerHTML={{ __html: sec.textContent }} />
  );
}

function ImageBlock({ sec, onOpenLightbox }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {(sec.images || []).map((img, idx) => {
        const align = img.align || 'center';
        const imgWidth = img.width || '100%';
        const textAlign = align === 'full' ? 'center' : align;
        return (
          <figure key={idx} style={{ margin: 0, textAlign }}>
            <div style={{ display: 'inline-block', position: 'relative', cursor: 'zoom-in', maxWidth: '100%' }}
              onClick={() => onOpenLightbox((sec.images || []).map(i => i.url), idx)}>
              <img src={img.url} alt={img.caption || ''}
                style={{ width: align === 'full' ? '100%' : imgWidth, maxWidth: '100%', borderRadius: '12px', display: 'block', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(15,23,42,0.7)', color: '#fff', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FiMaximize2 size={15} />
              </div>
            </div>
            {img.caption && (
              <figcaption style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.85rem', lineHeight: '1.5', fontStyle: 'italic' }}
                dangerouslySetInnerHTML={{ __html: img.caption }} />
            )}
          </figure>
        );
      })}
      <AnalysisBlock html={sec.analysisText} />
    </div>
  );
}

/* TableBlock — smart column sizing, scroll ngang, zoom lightbox */
function TableBlock({ sec, onOpenLightbox }) {
  const { headers = [], rows = [], showHeader = true, cellStyles = {}, title } = sec.tableData || {};
  const getCStyle = (ri, ci) => cellStyles[`${ri}_${ci}`] || {};

  /* ── Tự động nhận diện loại cột để gán width hint ── */
  const getColWidth = (header = '', colIndex, totalCols) => {
    const h = header.toLowerCase();
    // Cột ID ngắn
    if (h.match(/^(id|#|stt|no\.?|số)$/) || h.match(/^[a-z]{2,4}[\s-]?id$/i)) return '60px';
    // Cột SP/số
    if (h.match(/^(sp|point|điểm|số|qty|count)$/)) return '55px';
    // Cột Priority/Status/Type
    if (h.match(/(priority|status|loại|type|mức)/)) return '90px';
    // Cột Dependency/Tag
    if (h.match(/(depend|tag|label)/)) return '110px';
    // Cột tên ngắn (Epic, Feature, Feature Name...)
    if (h.match(/^(epic|feature|module|phase|giai đoạn)$/)) return '120px';
    // Cột nội dung dài (User Story, Description, Acceptance...)
    if (h.match(/(story|description|mô tả|acceptance|criteria|ghi chú|note|content|nội dung)/)) return 'auto';
    // Default: auto
    return 'auto';
  };

  const hasRealHeaders = showHeader && headers.some(h => h && !h.match(/^Cột\s*\d+$/));
  const colCount = Math.max(headers.length, rows[0]?.length || 0, 1);

  return (
    <div>
      {/* Wrapper: giới hạn trong cột trái, scroll ngang */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '100%', overflow: 'hidden' }}>
        {/* Nút zoom */}
        {onOpenLightbox && rows.length > 0 && (
          <button
            onClick={() => onOpenLightbox({ headers, rows, showHeader, cellStyles, title }, 'table')}
            title="Xem toàn màn hình"
            style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5, background: 'rgba(30,41,59,0.75)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <FiMaximize2 size={13} />
          </button>
        )}
        <div style={{ overflowX: 'auto', overflowY: 'visible', WebkitOverflowScrolling: 'touch', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%', tableLayout: 'auto' }}>
            {hasRealHeaders && (
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                  {headers.map((h, i) => (
                    <th key={i} style={{
                      padding: '0.75rem 0.875rem',
                      textAlign: 'left',
                      color: '#1e293b',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      letterSpacing: '0.3px',
                      whiteSpace: 'nowrap',
                      width: getColWidth(h, i, colCount),
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: ri % 2 === 0 ? '#fff' : '#fafbfc' }}>
                  {row.map((cell, ci) => {
                    const cs = getCStyle(ri, ci);
                    const hdr = headers[ci] || '';
                    const w = getColWidth(hdr, ci, colCount);
                    // Cột "auto" (nội dung dài): wrap bình thường. Cột nhỏ: nowrap
                    const isLongCol = w === 'auto';
                    return (
                      <td key={ci} style={{
                        padding: '0.75rem 0.875rem',
                        verticalAlign: 'top',
                        lineHeight: '1.6',
                        color: cs.color || '#374151',
                        backgroundColor: cs.bg || 'transparent',
                        fontWeight: cs.bold ? 700 : 400,
                        fontStyle: cs.italic ? 'italic' : 'normal',
                        textDecoration: cs.underline ? 'underline' : cs.strike ? 'line-through' : 'none',
                        textAlign: cs.align || 'left',
                        whiteSpace: isLongCol ? 'pre-wrap' : 'normal',
                        wordBreak: isLongCol ? 'break-word' : 'normal',
                        maxWidth: isLongCol ? '340px' : undefined,
                        minWidth: w !== 'auto' ? w : '80px',
                      }}>
                        {typeof cell === 'string' && cell.includes('<')
                          ? <span dangerouslySetInnerHTML={{ __html: cell }} />
                          : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={Math.max(colCount, 1)} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                    Chưa có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AnalysisBlock html={sec.analysisText} />
    </div>
  );
}

function FileBlock({ sec }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {(sec.files || []).map((file, idx) => (
        <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
              <FiPaperclip color="#2563eb" size={15} /> {file.name}
            </span>
            <a href={file.url} download target="_blank" rel="noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '7px', padding: '0.4rem 0.875rem', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              <FiDownload size={13} /> Tải xuống
            </a>
          </div>
          <div style={{ backgroundColor: '#4b5563', padding: '0.5rem' }}>
            <iframe src={`${file.url}#toolbar=0`} title={file.name}
              style={{ width: '100%', height: '400px', border: 'none', borderRadius: '6px', backgroundColor: '#fff', display: 'block' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Chart Block – hỗ trợ nhiều loại ── */
function ChartBlock({ sec }) {
  const data = sec.chartData || [];
  const type = sec.chartType || 'bar';
  const max = Math.max(...data.map(d => Math.abs(d.value || 0)), 1);
  const showValues = sec.chartShowValues !== false;
  const showLegend = sec.chartShowLegend !== false;
  const total = data.reduce((s, d) => s + Math.abs(d.value || 0), 0);

  const defaultColors = ['#2563eb','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];
  const getColor = (item, i) => item.color || defaultColors[i % defaultColors.length];

  // Progress bars (bar / bar_h / area / line → horizontal bars)
  if (['bar', 'bar_h', 'progress', 'area'].includes(type)) {
    const isHorizontal = type !== 'bar';
    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem 2rem', backgroundColor: '#fff' }}>
        {sec.chartTitle && <h4 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>{sec.chartTitle}</h4>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '560px', margin: '0 auto' }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '110px', fontSize: '0.82rem', fontWeight: 600, color: '#4b5563', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </div>
              <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '24px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${(Math.abs(item.value) / max) * 100}%`, height: '100%', backgroundColor: getColor(item, i), borderRadius: '6px', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px', minWidth: showValues ? '40px' : '4px' }}>
                  {showValues && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{item.value}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
        {showLegend && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.25rem', justifyContent: 'center' }}>
            {data.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#4b5563' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: getColor(item, i), flexShrink: 0 }} />
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Pie / Doughnut – SVG
  if (['pie', 'doughnut'].includes(type)) {
    const isDoughnut = type === 'doughnut';
    const cx = 100, cy = 100, r = 80, innerR = isDoughnut ? 45 : 0;
    let currentAngle = -Math.PI / 2;
    const slices = data.map((item, i) => {
      const angle = (Math.abs(item.value) / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(currentAngle);
      const y1 = cy + r * Math.sin(currentAngle);
      currentAngle += angle;
      const x2 = cx + r * Math.cos(currentAngle);
      const y2 = cy + r * Math.sin(currentAngle);
      const li1x = cx + innerR * Math.cos(currentAngle - angle);
      const li1y = cy + innerR * Math.sin(currentAngle - angle);
      const li2x = cx + innerR * Math.cos(currentAngle);
      const li2y = cy + innerR * Math.sin(currentAngle);
      const largeArc = angle > Math.PI ? 1 : 0;
      const d = isDoughnut
        ? `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${li2x} ${li2y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${li1x} ${li1y} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
      return { d, color: getColor(item, i), item };
    });

    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem 2rem', backgroundColor: '#fff' }}>
        {sec.chartTitle && <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>{sec.chartTitle}</h4>}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <svg viewBox="0 0 200 200" style={{ width: '220px', height: '220px' }}>
            {slices.map((s, i) => (
              <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth="2" />
            ))}
            {isDoughnut && <circle cx={cx} cy={cy} r={innerR - 2} fill="#fff" />}
          </svg>
          {showLegend && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
              {data.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#4b5563' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: getColor(item, i) }} />
                  {item.label}{showValues && ` (${item.value})`}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Radar
  if (type === 'radar') {
    const n = data.length;
    if (n < 3) return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Cần ít nhất 3 mục dữ liệu cho biểu đồ Radar.</div>;
    const cx = 120, cy = 120, maxR = 90;
    const angles = data.map((_, i) => (i / n) * 2 * Math.PI - Math.PI / 2);
    const getPoint = (i, ratio) => ({
      x: cx + maxR * ratio * Math.cos(angles[i]),
      y: cy + maxR * ratio * Math.sin(angles[i]),
    });
    const gridLevels = [0.25, 0.5, 0.75, 1.0];
    const dataPoints = data.map((d, i) => getPoint(i, Math.abs(d.value) / max));
    const polyPoints = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem 2rem', backgroundColor: '#fff' }}>
        {sec.chartTitle && <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>{sec.chartTitle}</h4>}
        <svg viewBox="0 0 240 240" style={{ width: '260px', height: '260px', display: 'block', margin: '0 auto' }}>
          {/* Grid */}
          {gridLevels.map(l => {
            const pts = data.map((_, i) => getPoint(i, l));
            return <polygon key={l} points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
          })}
          {/* Axes */}
          {data.map((_, i) => {
            const p = getPoint(i, 1);
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#e2e8f0" strokeWidth="1" />;
          })}
          {/* Data polygon */}
          <polygon points={polyPoints} fill="rgba(37,99,235,0.15)" stroke="#2563eb" strokeWidth="2" />
          {/* Points */}
          {dataPoints.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="4" fill="#2563eb" />)}
          {/* Labels */}
          {data.map((d, i) => {
            const lp = getPoint(i, 1.18);
            return <text key={i} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#374151">{d.label}</text>;
          })}
        </svg>
      </div>
    );
  }

  // Gauge
  if (type === 'gauge') {
    const item = data[0] || { label: '', value: 0 };
    const pct = Math.min(Math.max(item.value, 0), 100);
    const angle = (pct / 100) * 180 - 90;
    const rad = (angle * Math.PI) / 180;
    const needleX = 100 + 70 * Math.cos(rad);
    const needleY = 110 + 70 * Math.sin(rad);
    return (
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem 2rem', backgroundColor: '#fff', textAlign: 'center' }}>
        {sec.chartTitle && <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>{sec.chartTitle}</h4>}
        <svg viewBox="0 0 200 130" style={{ width: '220px', height: '140px', display: 'block', margin: '0 auto' }}>
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#f1f5f9" strokeWidth="16" strokeLinecap="round" />
          <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#2563eb" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 251.2} 251.2`} />
          <line x1="100" y1="110" x2={needleX} y2={needleY} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="110" r="6" fill="#1e293b" />
          <text x="100" y="95" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">{pct}%</text>
          <text x="100" y="125" textAnchor="middle" fontSize="9" fill="#64748b">{item.label}</text>
        </svg>
      </div>
    );
  }

  // Waterfall / Scatter / Bubble → fallback to bar
  return (
    <div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem 2rem', backgroundColor: '#fff' }}>
        {sec.chartTitle && <h4 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>{sec.chartTitle}</h4>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', maxWidth: '560px', margin: '0 auto' }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: '110px', fontSize: '0.82rem', fontWeight: 600, color: '#4b5563', textAlign: 'right', flexShrink: 0 }}>{item.label}</div>
              <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '24px', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{ width: `${(Math.abs(item.value) / max) * 100}%`, height: '100%', backgroundColor: getColor(item, i), borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px', transition: 'width 1.2s ease' }}>
                  {showValues && <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{item.value}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AnalysisBlock html={sec.analysisText} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   EXPORT BUTTON — 3 click + giữ 5s mới mở
═══════════════════════════════════════════════════ */
function ExportButton({ project, sectionTree }) {
  const [clicks, setClicks] = React.useState(0);
  const [holding, setHolding] = React.useState(false);  // đang giữ sau click 3
  const [holdProgress, setHoldProgress] = React.useState(0); // 0-100
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState('');
  const clickTimerRef = React.useRef(null);
  const holdTimerRef = React.useRef(null);
  const progressRef = React.useRef(null);
  const ref = React.useRef(null);

  // Đóng khi click ngoài
  React.useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const handleClick = () => {
    if (holding || open) return;
    const next = clicks + 1;
    clearTimeout(clickTimerRef.current);
    if (next >= 3) {
      // Bắt đầu chế độ giữ 5 giây
      setClicks(0);
      setHolding(true);
      setHoldProgress(0);
      let elapsed = 0;
      const interval = 50; // ms
      const total = 5000;
      progressRef.current = setInterval(() => {
        elapsed += interval;
        const pct = Math.min((elapsed / total) * 100, 100);
        setHoldProgress(pct);
        if (elapsed >= total) {
          clearInterval(progressRef.current);
          setHolding(false);
          setHoldProgress(0);
          setOpen(true);
        }
      }, interval);
    } else {
      setClicks(next);
      clickTimerRef.current = setTimeout(() => setClicks(0), 1800);
    }
  };

  const cancelHold = () => {
    if (holding) {
      clearInterval(progressRef.current);
      setHolding(false);
      setHoldProgress(0);
      setClicks(0);
    }
  };

  /* ── Fetch ảnh về base64 ── */
  const fetchImgBase64 = async (url) => {
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      return await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
    } catch { return url; }
  };

  /* ── Thu thập tất cả URL ảnh từ tree ── */
  const collectAllImages = (nodes) => {
    const urls = [];
    const walk = (n) => {
      if (n.type === 'image' && n.images?.length) urls.push(...n.images);
      (n.children || []).forEach(walk);
    };
    nodes.forEach(walk);
    return [...new Set(urls)];
  };

  /* ── Build HTML nội dung để xuất ── */
  const buildExportHTML = async () => {
    const allUrls = collectAllImages(sectionTree);
    const b64Map = {};
    await Promise.all(allUrls.map(async url => { b64Map[url] = await fetchImgBase64(url); }));

    const ns = project.numberingStyle;
    const pfx = project.customNumberPrefix || '';
    const getLabel = (i) => {
      const n = i + 1;
      if (!ns || ns === 'none') return '';
      if (ns === '1') return `${n}. `;
      if (ns === 'A') return `${String.fromCharCode(64+n)}. `;
      if (ns === 'a') return `${String.fromCharCode(96+n)}. `;
      if (ns === 'I') { const r=['I','II','III','IV','V','VI','VII','VIII','IX','X']; return `${r[i]||n}. `; }
      if (ns === 'i') { const r=['i','ii','iii','iv','v','vi','vii','viii','ix','x']; return `${r[i]||n}. `; }
      if (ns === 'custom') return `${pfx}${n} `;
      return '';
    };

    const renderSec = (sec, depth, idx) => {
      const tag = depth === 0 ? 'h2' : depth === 1 ? 'h3' : 'h4';
      const lbl = depth === 0 ? getLabel(idx) : '';
      let html = `<${tag}>${lbl}${sec.title}</${tag}>`;
      if (sec.type === 'text' && sec.textContent) html += sec.textContent;
      if (sec.type === 'table' && sec.tableData?.rows?.length) {
        const { headers=[], rows=[], showHeader=true, cellStyles={} } = sec.tableData;
        html += '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%">';
        if (showHeader && headers.some(h => h && !h.match(/^Cột\s*\d+$/)))
          html += '<thead><tr>' + headers.map(h => `<th style="background:#f1f5f9;font-weight:bold">${h}</th>`).join('') + '</tr></thead>';
        html += '<tbody>' + rows.map((row, ri) =>
          '<tr>' + row.map((cell, ci) => {
            const cs = cellStyles[`${ri}_${ci}`] || {};
            const s = [cs.bold?'font-weight:bold':'',cs.italic?'font-style:italic':'',cs.color?`color:${cs.color}`:'',cs.bg?`background:${cs.bg}`:''].filter(Boolean).join(';');
            return `<td style="${s}">${cell||''}</td>`;
          }).join('') + '</tr>'
        ).join('') + '</tbody></table>';
      }
      if (sec.type === 'image' && sec.images?.length)
        html += sec.images.map(url => `<img src="${b64Map[url]||url}" style="max-width:100%;margin:8px 0;display:block;"/>`).join('');
      if (sec.analysisText) html += sec.analysisText;
      (sec.children||[]).forEach((child,ci) => { html += renderSec(child, depth+1, ci); });
      return html;
    };

    const CSS = `
      body{font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#1e293b;max-width:860px;margin:0 auto;padding:32px}
      h1{font-size:22px;font-weight:bold;margin:0 0 6px}
      h2{font-size:16px;font-weight:bold;border-bottom:2px solid #1e293b;padding-bottom:4px;margin:28px 0 10px;page-break-after:avoid}
      h3{font-size:14px;font-weight:bold;color:#1d4ed8;margin:18px 0 8px;page-break-after:avoid}
      h4{font-size:13px;font-weight:bold;margin:12px 0 6px;page-break-after:avoid}
      p{margin:0 0 8px} ul,ol{margin:4px 0;padding-left:20px} li{margin-bottom:3px}
      table{border-collapse:collapse;width:100%;margin:10px 0;font-size:11px;page-break-inside:avoid}
      td,th{border:1px solid #cbd5e1;padding:5px 8px;vertical-align:top}
      th{background:#f1f5f9;font-weight:bold}
      img{max-width:100%;display:block;margin:8px 0;page-break-inside:avoid}
      .desc{font-style:italic;color:#475569;padding:10px 0 14px;border-top:2px solid #1e293b}
      @media print{
        body{padding:0;max-width:100%}
        h2,h3,h4{page-break-after:avoid}
        table,img{page-break-inside:avoid}
      }`;

    const body = `
      <h1>${project.title || 'Dự án'}</h1>
      ${project.description ? `<div class="desc">${project.description}</div>` : ''}
      ${sectionTree.map((sec,i) => renderSec(sec,0,i)).join('')}`;

    return { body, CSS };
  };

  /* ── Xuất PDF — mở cửa sổ in browser ── */
  const exportPDF = async () => {
    setLoading('pdf'); setOpen(false);
    try {
      const { body, CSS } = await buildExportHTML();
      const win = window.open('', '_blank', 'width=900,height=700');
      win.document.write(`<!DOCTYPE html><html><head>
        <meta charset="utf-8">
        <title>${project.title || 'Du an'}</title>
        <style>${CSS}
          /* Ẩn nút khi in */
          .print-btn{display:flex;gap:10px;margin-bottom:20px;padding:12px 0;border-bottom:1px solid #e2e8f0}
          @media print{.print-btn{display:none!important}}
        </style>
      </head><body>
        <div class="print-btn">
          <button onclick="window.print()" style="padding:8px 20px;background:#1e293b;color:#fff;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer">🖨 In / Lưu PDF</button>
          <button onclick="window.close()" style="padding:8px 16px;background:#f1f5f9;color:#374151;border:none;border-radius:6px;font-size:13px;cursor:pointer">✕ Đóng</button>
          <span style="font-size:12px;color:#94a3b8;align-self:center">Chọn "Save as PDF" trong hộp thoại in</span>
        </div>
        ${body}
      </body></html>`);
      win.document.close();
    } catch(e) { alert('Lỗi: ' + e.message); }
    setLoading('');
  };

  /* ── Xuất Word — MSWord HTML với ảnh base64 ── */
  const exportWord = async () => {
    setLoading('word'); setOpen(false);
    try {
      const { body, CSS } = await buildExportHTML();
      const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office'
        xmlns:w='urn:schemas-microsoft-com:office:word'
        xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'>
        <meta name=ProgId content=Word.Document>
        <!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml><![endif]-->
        <style>
          @page{margin:2cm;size:A4}
          body{font-family:Arial,sans-serif;font-size:12pt;line-height:1.6;color:#000}
          h1{font-size:18pt;font-weight:bold;margin-bottom:6pt}
          h2{font-size:14pt;font-weight:bold;border-bottom:2px solid #000;padding-bottom:3pt;margin-top:20pt}
          h3{font-size:12pt;font-weight:bold;color:#1d4ed8;margin-top:14pt}
          h4{font-size:11pt;font-weight:bold;margin-top:10pt}
          p{margin:0 0 6pt} ul,ol{margin:3pt 0;padding-left:18pt} li{margin-bottom:2pt}
          table{border-collapse:collapse;width:100%;margin:8pt 0;font-size:10pt}
          td,th{border:1px solid #999;padding:4pt 7pt;vertical-align:top}
          th{background:#f0f0f0;font-weight:bold}
          img{max-width:100%;display:block;margin:6pt 0}
          .desc{font-style:italic;color:#444;border-top:2px solid #000;padding-top:8pt;margin-bottom:10pt}
        </style></head>
        <body>${body}</body></html>`;
      const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${project.title || 'du-an'}.doc`;
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch(e) { alert('Xuất Word thất bại: ' + e.message); }
    setLoading('');
  };

  /* ── Indicator: chấm màu theo số click ── */
  const dotColor = clicks === 1 ? '#fbbf24' : clicks === 2 ? '#f97316' : 'transparent';

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={handleClick}
        title={holding ? 'Giữ...' : clicks === 0 ? 'Nhấn 3 lần rồi giữ để xuất' : `Còn ${3-clicks} lần nữa`}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Vòng progress khi đang giữ */}
          {holding && (
            <svg width="22" height="22" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
              <circle cx="11" cy="11" r="9" fill="none" stroke="#e2e8f0" strokeWidth="2"/>
              <circle cx="11" cy="11" r="9" fill="none" stroke="#2563eb" strokeWidth="2"
                strokeDasharray={`${2*Math.PI*9}`}
                strokeDashoffset={`${2*Math.PI*9*(1-holdProgress/100)}`}
                style={{ transition: 'stroke-dashoffset 0.05s linear' }}/>
            </svg>
          )}
          <FiDownload size={13} color={holding ? '#2563eb' : '#94a3b8'} />
          {clicks > 0 && !holding && (
            <div style={{ position: 'absolute', top: '-3px', right: '-3px', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: dotColor }} />
          )}
        </div>
      </button>
      {/* Nút hủy khi đang giữ */}
      {holding && (
        <button onClick={cancelHold}
          style={{ position: 'absolute', right: 0, top: '120%', fontSize: '0.7rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', padding: '2px 4px' }}>
          Hủy
        </button>
      )}
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: '6px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200, minWidth: '150px', overflow: 'hidden' }}>
          <button onClick={exportPDF} disabled={!!loading}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '0.65rem 1rem', fontSize: '0.83rem', fontWeight: 600, color: '#374151', cursor: loading?'wait':'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9' }}
            onMouseOver={e => e.currentTarget.style.background='#f8fafc'}
            onMouseOut={e => e.currentTarget.style.background='none'}>
            <FiFileText size={13} color="#ef4444" />
            {loading === 'pdf' ? 'Đang xử lý...' : 'Xuất PDF'}
          </button>
          <button onClick={exportWord} disabled={!!loading}
            style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '0.65rem 1rem', fontSize: '0.83rem', fontWeight: 600, color: '#374151', cursor: loading?'wait':'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onMouseOver={e => e.currentTarget.style.background='#f8fafc'}
            onMouseOut={e => e.currentTarget.style.background='none'}>
            <FiFileText size={13} color="#2563eb" />
            {loading === 'word' ? 'Đang xử lý...' : 'Xuất Word'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TOC SIDEBAR
═══════════════════════════════════════════════════ */
function TocSidebar({ tree, activeId, onClickSection, demoUrl, numberingStyle, customNumberPrefix, showToc, project, sectionTree }) {
  // Hooks phải đứng đầu — trước mọi early return
  const [collapsed, setCollapsed] = React.useState(new Set());
  const toggle = (id) => setCollapsed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const visibleRoots = tree.filter(s => s.showInToc !== false);

  const getLabel = (idx) => {
    const n = idx + 1;
    if (!numberingStyle || numberingStyle === 'none') return '';
    if (numberingStyle === '1') return `${n}.`;
    if (numberingStyle === 'A') return `${String.fromCharCode(64 + n)}.`;
    if (numberingStyle === 'a') return `${String.fromCharCode(96 + n)}.`;
    if (numberingStyle === 'I') { const r = ['I','II','III','IV','V','VI','VII','VIII','IX','X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX']; return `${r[idx] || n}.`; }
    if (numberingStyle === 'i') { const r = ['i','ii','iii','iv','v','vi','vii','viii','ix','x', 'xi', 'xii', 'xiii', 'xiv', 'xv', 'xvi', 'xvii', 'xviii', 'xix', 'xx', 'xxi', 'xxii', 'xxiii', 'xxiv', 'xxv', 'xxvi', 'xxvii', 'xxviii', 'xxix', 'xxx']; return `${r[idx] || n}.`; }
    if (numberingStyle === 'custom') return `${customNumberPrefix || ''}${n}`;
    return '';
  };

  if (showToc === false) return demoUrl ? (
    <a href={demoUrl} target="_blank" rel="noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
      <FiExternalLink size={16} /> Xem Demo / Link Github
    </a>
  ) : null;

  // State lưu id nào đang collapsed (Set)

  // Đệ quy render TOC item với collapse/expand
  const renderTocItems = (nodes, depth = 0) =>
    nodes.filter(s => s.showInToc !== false).map((sec, idx) => {
      const isActive = activeId === sec.id;
      const hasKids = (sec.children || []).filter(c => c.showInToc !== false).length > 0;
      const isCollapsed = collapsed.has(sec.id);
      const indent = `${0.875 + depth * 0.875}rem`;
      const fs = depth === 0 ? '0.85rem' : depth === 1 ? '0.8rem' : '0.76rem';
      const fw = isActive ? 700 : depth === 0 ? 500 : 400;
      const prefix = depth === 0 ? getLabel(idx) : '';
      return (
        <div key={sec.id}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button onClick={() => onClickSection(sec.id)}
              style={{ flex: 1, minWidth: 0, textAlign: 'left', background: isActive ? '#eff6ff' : 'none', border: 'none', borderLeft: isActive ? '3px solid #2563eb' : '3px solid transparent', padding: `0.45rem ${hasKids ? '0.25rem' : '0.875rem'} 0.45rem ${indent}`, color: isActive ? '#2563eb' : depth === 0 ? '#4b5563' : '#6b7280', fontSize: fs, fontWeight: fw, cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}
              onMouseOver={e => { if (!isActive) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; } }}
              onMouseOut={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = depth === 0 ? '#4b5563' : '#6b7280'; } }}>
              {prefix && <span style={{ color: '#6366f1', fontWeight: 800, minWidth: '22px', flexShrink: 0 }}>{prefix}</span>}
              {depth > 0 && <span style={{ color: '#cbd5e1', flexShrink: 0, fontSize: '0.7rem' }}>└</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.title}</span>
            </button>
            {hasKids && (
              <button onClick={() => toggle(sec.id)}
                title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                style={{ flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer', padding: '0.45rem 0.625rem', color: '#94a3b8', display: 'flex', alignItems: 'center', transition: 'color 0.15s' }}
                onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
                onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                <FiChevronRight size={12} style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
              </button>
            )}
          </div>
          {hasKids && !isCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              {renderTocItems(sec.children, depth + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {demoUrl && (
        <a href={demoUrl} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.35)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)'; }}>
          <FiExternalLink size={16} /> Xem Demo / Link Github
        </a>
      )}

      {visibleRoots.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '0.875rem 1.125rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Mục lục</span>
            <ExportButton project={project} sectionTree={sectionTree} />
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {renderTocItems(visibleRoots)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MOBILE TOC DRAWER
═══════════════════════════════════════════════════ */
function MobileTocDrawer({ tree, activeId, onClickSection, demoUrl, showToc }) {
  const [open, setOpen] = useState(false);
  const visibleRoots = tree.filter(s => s.showInToc !== false);

  const [mCollapsed, setMCollapsed] = React.useState(new Set());
  const mToggle = (id) => setMCollapsed(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const renderItems = (nodes, depth = 0) =>
    nodes.filter(s => s.showInToc !== false).map(sec => {
      const isActive = activeId === sec.id;
      const indent = `${1 + depth * 1}rem`;
      const hasKids = (sec.children || []).filter(c => c.showInToc !== false).length > 0;
      const isCollapsed = mCollapsed.has(sec.id);
      return (
        <div key={sec.id}>
          <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #f8fafc' }}>
            <button onClick={() => { onClickSection(sec.id); setOpen(false); }}
              style={{ flex: 1, minWidth: 0, textAlign: 'left', background: isActive ? '#eff6ff' : 'none', border: 'none', padding: `0.65rem ${hasKids ? '0.25rem' : '1rem'} 0.65rem ${indent}`, color: isActive ? '#2563eb' : depth === 0 ? '#374151' : '#64748b', fontSize: depth === 0 ? '0.875rem' : '0.82rem', fontWeight: isActive ? 700 : depth === 0 ? 500 : 400, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {depth > 0 && <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>└</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.title}</span>
            </button>
            {hasKids && (
              <button onClick={() => mToggle(sec.id)}
                style={{ flexShrink: 0, border: 'none', background: 'none', cursor: 'pointer', padding: '0.65rem 0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                <FiChevronRight size={12} style={{ transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)', transition: 'transform 0.2s' }} />
              </button>
            )}
          </div>
          {hasKids && !isCollapsed && renderItems(sec.children, depth + 1)}
        </div>
      );
    });

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {showToc !== false && visibleRoots.length > 0 && (
          <button onClick={() => setOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
            Mục lục {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        )}
        {demoUrl && (
          <a href={demoUrl} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
            <FiExternalLink size={14} /> Xem Demo / Link Github
          </a>
        )}
      </div>
      {open && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          {renderItems(visibleRoots)}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION CONTENT — render nội dung 1 section
═══════════════════════════════════════════════════ */
function SectionContent({ sec, onOpenLightbox }) {
  return (
    <>
      {sec.type === 'text' && sec.textContent && <TextBlock sec={sec} />}
      {sec.type === 'image' && (sec.images || []).length > 0 && (
        <ImageBlock sec={sec} onOpenLightbox={(list, idx) => onOpenLightbox(list, idx)} />
      )}
      {sec.type === 'table' && sec.tableData?.rows?.length > 0 && <TableBlock sec={sec} onOpenLightbox={(td) => onOpenLightbox(td, 'table')} />}
      {sec.type === 'file' && (sec.files || []).length > 0 && <FileBlock sec={sec} />}
      {sec.type === 'chart' && (sec.chartData || []).length > 0 && <ChartBlock sec={sec} />}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   NESTED SECTION — đệ quy không giới hạn depth
   depth=0: root (section-block), depth>=1: child
═══════════════════════════════════════════════════ */
function NestedSection({ sec, depth, sectionRefs, onOpenLightbox, label }) {
  const isRoot = depth === 0;
  const indent = Math.min(depth - 1, 3) * 1.125;
  const hasChildren = (sec.children || []).length > 0;

  if (isRoot) {
    return (
      <div id={sec.id} className="section-block"
        ref={el => { if (sectionRefs) sectionRefs.current[sec.id] = el; }}>
        <h3 className="section-title">
          {label && <span style={{ color: 'var(--primary, #2563eb)', marginRight: '0.5rem', fontWeight: 800 }}>{label}</span>}
          {sec.title}
        </h3>
        <SectionContent sec={sec} onOpenLightbox={onOpenLightbox} />
        {hasChildren && (sec.children || []).map(child => (
          <NestedSection key={child.id} sec={child} depth={1} sectionRefs={sectionRefs} onOpenLightbox={onOpenLightbox} />
        ))}
      </div>
    );
  }

  // depth >= 1: mục con
  const titleSize = depth === 1 ? '1rem' : depth === 2 ? '0.95rem' : '0.9rem';

  return (
    <div id={sec.id}
      ref={el => { if (sectionRefs) sectionRefs.current[sec.id] = el; }}
      style={{ marginTop: '1.5rem', marginLeft: `${indent}rem`, paddingLeft: '1rem', borderLeft: '2px solid #e2e8f0' }}>
      <h4 style={{ fontSize: titleSize, fontWeight: 700, color: '#1e293b', margin: '0 0 0.875rem', lineHeight: 1.4 }}>
        {sec.title}
      </h4>
      <SectionContent sec={sec} onOpenLightbox={onOpenLightbox} />
      {hasChildren && (sec.children || []).map(child => (
        <NestedSection key={child.id} sec={child} depth={depth + 1} sectionRefs={sectionRefs} onOpenLightbox={onOpenLightbox} />
      ))}
    </div>
  );
}
function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');
  const [lightbox, setLightbox] = useState({ open: false, list: [], index: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const sectionRefs = useRef({});

  const openLightbox = (listOrData, idxOrType) => {
    if (idxOrType === 'table') {
      setLightbox({ open: true, type: 'table', tableContent: listOrData, list: [], index: 0 });
    } else {
      setLightbox({ open: true, type: 'image', list: listOrData, index: idxOrType || 0 });
    }
  };

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    (async () => {
      const content = await getPageContent('projects');
      if (content?.projects) {
        const found = content.projects.find(p => p.slug === slug && !p.isHidden);
        setProject(found || null);
      }
      setLoading(false);
    })();
  }, [slug]);

  useEffect(() => {
    if (!project) return;
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [project]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: '1rem', color: '#94a3b8' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '0.9rem' }}>Đang tải dữ liệu dự án...</span>
    </div>
  );

  if (!project) return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
      <h2 style={{ color: '#1e293b', marginBottom: '0.5rem' }}>Dự án không tồn tại</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Hồ sơ này đã bị ẩn hoặc không tồn tại.</p>
      <Link to="/projects" style={{ color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>← Quay lại danh sách</Link>
    </div>
  );

  /* Build tree đúng thứ tự: children gắn vào đúng root */
  const sectionTree = buildSectionTree(project.sections || []);
  const flatForToc = sectionTree.flatMap(s => [s, ...(s.children || [])]);

  return (
    <>
      <style>{`
        .pd-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 5rem;
          box-sizing: border-box;
        }
        .pd-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 260px;
          gap: 2.5rem;
          align-items: start;
        }
        /* Cột trái không được phình vượt không gian */
        .pd-layout > div:first-child {
          min-width: 0;
          overflow: hidden;
        }
        .pd-sidebar {
          position: sticky;
          top: 80px;
          max-height: calc(100vh - 100px);
          overflow-y: auto;
          min-width: 0;
        }
        .pd-sticky-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid #f1f5f9;
          padding: 0.875rem 0;
          margin-bottom: 2rem;
        }
        .rich-content h1, .rich-content h2, .rich-content h3, .rich-content h4 {
          color: #1e293b; margin: 1.5rem 0 0.75rem; font-weight: 700; line-height: 1.35;
        }
        .rich-content h1 { font-size: 1.35rem; }
        .rich-content h2 { font-size: 1.2rem; }
        .rich-content h3 { font-size: 1.05rem; }
        .rich-content p { margin: 0 0 1rem; }
        .rich-content ul, .rich-content ol { padding-left: 1.5rem; margin: 0.75rem 0 1rem; }
        .rich-content li { margin-bottom: 0.4rem; }
        .rich-content strong { color: #1e293b; }
        .rich-content a { color: #2563eb; }
        .rich-content table { border-collapse: collapse; width: 100%; margin: 0.75rem 0; }
        .rich-content div[style*='overflow'] { max-width: 100%; }
        .rich-content table td, .rich-content table th { border: 1px solid #e2e8f0; padding: 0.5rem 0.75rem; }
        .rich-content table th { background: #f1f5f9; font-weight: 700; }
        .rich-content figure { margin: 1rem 0; }
        .rich-content figcaption { font-size: 0.82rem; color: #6b7280; text-align: center; margin-top: 0.375rem; }
        .rich-content blockquote { border-left: 4px solid #2563eb; margin: 1rem 0; padding: 0.75rem 1rem; background: #f0f6ff; border-radius: 0 8px 8px 0; color: #1e3a5f; }
        .rich-content pre { background: #1e293b; color: #e2e8f0; padding: 1rem; border-radius: 8px; font-family: monospace; overflow-x: auto; }
        .rich-content code { background: #f1f5f9; padding: 0.1rem 0.4rem; border-radius: 4px; font-family: monospace; }
        .rich-content img { max-width: 100%; border-radius: 8px; }
        .section-block {
          scroll-margin-top: 90px;
          padding: 2rem 0;
          border-bottom: 1px solid #f1f5f9;
          /* Ngăn table/chart con tràn ra ngoài */
          min-width: 0;
          overflow: hidden;
        }
        .section-block:last-child { border-bottom: none; }
        .section-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .section-title::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 1.15rem;
          background: #2563eb;
          border-radius: 2px;
          flex-shrink: 0;
        }
        .child-section {
          /* Không dùng nữa — thay bằng NestedSection inline styles */
        }
        .child-section h4 {
          font-size: 1rem;
          font-weight: 700;
          color: #1d4ed8;
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .child-section h4::before {
          content: '';
          display: inline-block;
          width: 3px;
          height: 1rem;
          background: #93c5fd;
          border-radius: 2px;
          flex-shrink: 0;
        }
        @media (max-width: 900px) {
          .pd-layout { grid-template-columns: minmax(0, 1fr); }
          .pd-sidebar { display: none; }
          .pd-wrap { padding: 1.25rem 1rem 3.5rem; overflow: hidden; }
          .pd-layout > div:first-child { overflow: hidden; }
        }
        @media (max-width: 640px) {
          .pd-wrap { padding: 1rem 0.75rem 3rem; }
          .section-title { font-size: 1rem; }
          .section-block { overflow: hidden; }
          .child-section { overflow: hidden; margin-left: 0; }
        }
        @media (max-width: 480px) {
          .pd-wrap { padding: 0.875rem 0.5rem 2.5rem; }
          .child-section { padding-left: 0.875rem; }
        }
      `}</style>

      <div className="pd-wrap">
        <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.5rem' }}>
          <FiArrowLeft size={15} /> Quay lại danh sách dự án
        </Link>

        <div className="pd-layout">
          {/* ── CỘT TRÁI ── */}
          <div>
            <div className="pd-sticky-header">
              <h1 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.25 }}>
                {project.title}
              </h1>
            </div>

            {/* Meta */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '2rem' }}>
              {project.category && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}><FiTag size={12} /> {project.category}</span>}
              {project.duration && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}><FiClock size={12} /> {project.duration}</span>}
              {project.client && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.82rem', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}><FiUsers size={12} /> {project.client}</span>}
              {project.metric && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 700 }}><FiTrendingUp size={12} /> {project.metric}</span>}
              {sectionTree.length > 0 && <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.35rem 0.75rem', borderRadius: '8px' }}><FiLayers size={12} /> {sectionTree.length} phần</span>}
            </div>

            {/* Description */}
            {project.description && (
              <div style={{ marginBottom: '2.25rem' }}>
                <div style={{ width: '48px', height: '2px', backgroundColor: '#1e293b', marginBottom: '1rem' }} />
                <div className="rich-content" style={{ color: '#475569', fontSize: '0.96rem', lineHeight: '1.9', fontStyle: 'italic' }}
                  dangerouslySetInnerHTML={{ __html: project.description }} />
                <div style={{ height: '2px', backgroundColor: '#1e293b', marginTop: '1.25rem', width: '100%' }} />
              </div>
            )}

            {/* Mobile TOC */}
            {isMobile && (
              <MobileTocDrawer
                tree={sectionTree}
                activeId={activeSection}
                onClickSection={scrollToSection}
                demoUrl={project.demoUrl}
                showToc={project.showToc}
              />
            )}

            {/* ── Sections — đệ quy không giới hạn depth ── */}
            <div>
              {sectionTree.map((sec, idx) => {
                const ns = project.numberingStyle;
                const pfx = project.customNumberPrefix || '';
                const n = idx + 1;
                let lbl = '';
                if (ns && ns !== 'none') {
                  if (ns === '1') lbl = `${n}.`;
                  else if (ns === 'A') lbl = `${String.fromCharCode(64 + n)}.`;
                  else if (ns === 'a') lbl = `${String.fromCharCode(96 + n)}.`;
                  else if (ns === 'I') { const r=['I','II','III','IV','V','VI','VII','VIII','IX','X']; lbl = `${r[idx]||n}.`; }
                  else if (ns === 'i') { const r=['i','ii','iii','iv','v','vi','vii','viii','ix','x']; lbl = `${r[idx]||n}.`; }
                  else if (ns === 'custom') lbl = `${pfx}${n}`;
                }
                return (
                  <NestedSection
                    key={sec.id}
                    sec={sec}
                    depth={0}
                    sectionRefs={sectionRefs}
                    onOpenLightbox={openLightbox}
                    label={lbl}
                  />
                );
              })}
            </div>

            {sectionTree.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                <p style={{ fontSize: '0.9rem' }}>Chưa có nội dung chi tiết cho dự án này.</p>
              </div>
            )}
          </div>

          {/* ── CỘT PHẢI: SIDEBAR ── */}
          {!isMobile && (
            <div className="pd-sidebar">
              <TocSidebar
                tree={sectionTree}
                activeId={activeSection}
                onClickSection={scrollToSection}
                demoUrl={project.demoUrl}
                numberingStyle={project.numberingStyle}
                customNumberPrefix={project.customNumberPrefix}
                showToc={project.showToc}
                project={project}
                sectionTree={sectionTree}
              />
            </div>
          )}
        </div>
      </div>

      {lightbox.open && (
        <Lightbox
          type={lightbox.type || 'image'}
          list={lightbox.list || []}
          index={lightbox.index || 0}
          tableContent={lightbox.tableContent}
          onClose={() => setLightbox(lb => ({ ...lb, open: false }))}
          onPrev={() => setLightbox(lb => ({ ...lb, index: lb.index === 0 ? lb.list.length - 1 : lb.index - 1 }))}
          onNext={() => setLightbox(lb => ({ ...lb, index: (lb.index + 1) % lb.list.length }))}
        />
      )}
    </>
  );
}

export default ProjectDetail;