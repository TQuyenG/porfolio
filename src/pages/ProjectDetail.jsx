import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import {
  FiArrowLeft, FiClock, FiLayers, FiPaperclip, FiDownload,
  FiMaximize2, FiX, FiChevronLeft, FiChevronRight, FiExternalLink,
  FiUsers, FiTrendingUp, FiTag, FiList, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';

/* ═══════════════════════════════════════════════════
   BUILD SECTION TREE (fix lỗi mục con dồn xuống cuối)
   Flat array → tree đúng thứ tự: mỗi root kèm children
═══════════════════════════════════════════════════ */
function buildSectionTree(flat = []) {
  // Tách root và children
  const roots = flat.filter(s => !s.parentId);
  const childMap = {};
  flat.filter(s => s.parentId).forEach(s => {
    if (!childMap[s.parentId]) childMap[s.parentId] = [];
    childMap[s.parentId].push(s);
  });
  // Gắn children theo đúng vị trí của root
  return roots.map(r => ({ ...r, children: childMap[r.id] || [] }));
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
   TOC SIDEBAR
═══════════════════════════════════════════════════ */
function TocSidebar({ tree, activeId, onClickSection, demoUrl, numberingStyle, customNumberPrefix, showToc }) {
  if (showToc === false) return demoUrl ? (
    <a href={demoUrl} target="_blank" rel="noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}>
      <FiExternalLink size={16} /> Xem Demo
    </a>
  ) : null;

  const visibleRoots = tree.filter(s => s.showInToc !== false);

  const getLabel = (idx) => {
    const n = idx + 1;
    if (!numberingStyle || numberingStyle === 'none') return '';
    if (numberingStyle === '1') return `${n}.`;
    if (numberingStyle === 'A') return `${String.fromCharCode(64 + n)}.`;
    if (numberingStyle === 'a') return `${String.fromCharCode(96 + n)}.`;
    if (numberingStyle === 'I') { const r = ['I','II','III','IV','V','VI','VII','VIII','IX','X']; return `${r[idx] || n}.`; }
    if (numberingStyle === 'i') { const r = ['i','ii','iii','iv','v','vi','vii','viii','ix','x']; return `${r[idx] || n}.`; }
    if (numberingStyle === 'custom') return `${customNumberPrefix || ''}${n}`;
    return '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {demoUrl && (
        <a href={demoUrl} target="_blank" rel="noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', backgroundColor: '#2563eb', color: '#fff', padding: '0.85rem 1rem', borderRadius: '12px', fontWeight: 800, textDecoration: 'none', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(37,99,235,0.3)', transition: 'transform 0.2s, box-shadow 0.2s' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(37,99,235,0.35)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(37,99,235,0.3)'; }}>
          <FiExternalLink size={16} /> Xem Demo
        </a>
      )}

      {visibleRoots.length > 0 && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '0.875rem 1.125rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiList size={14} color="#94a3b8" />
            <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Mục lục</span>
          </div>
          <div style={{ padding: '0.5rem 0' }}>
            {visibleRoots.map((sec, idx) => (
              <div key={sec.id}>
                <button onClick={() => onClickSection(sec.id)}
                  style={{ width: '100%', textAlign: 'left', background: activeId === sec.id ? '#eff6ff' : 'none', border: 'none', borderLeft: activeId === sec.id ? '3px solid #2563eb' : '3px solid transparent', padding: '0.55rem 1.125rem', color: activeId === sec.id ? '#2563eb' : '#4b5563', fontSize: '0.85rem', fontWeight: activeId === sec.id ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '5px' }}
                  onMouseOver={e => { if (activeId !== sec.id) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; } }}
                  onMouseOut={e => { if (activeId !== sec.id) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4b5563'; } }}>
                  {getLabel(idx) && <span style={{ color: '#6366f1', fontWeight: 800, minWidth: '24px', flexShrink: 0 }}>{getLabel(idx)}</span>}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sec.title}</span>
                </button>
                {(sec.children || []).filter(c => c.showInToc !== false).map(child => (
                  <button key={child.id} onClick={() => onClickSection(child.id)}
                    style={{ width: '100%', textAlign: 'left', background: activeId === child.id ? '#eff6ff' : 'none', border: 'none', borderLeft: activeId === child.id ? '3px solid #93c5fd' : '3px solid transparent', padding: '0.45rem 1.125rem 0.45rem 2rem', color: activeId === child.id ? '#2563eb' : '#6b7280', fontSize: '0.8rem', fontWeight: activeId === child.id ? 700 : 500, cursor: 'pointer', transition: 'all 0.15s', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    └ {child.title}
                  </button>
                ))}
              </div>
            ))}
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

  return (
    <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {showToc !== false && visibleRoots.length > 0 && (
          <button onClick={() => setOpen(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#374151', cursor: 'pointer' }}>
            <FiList size={14} /> Mục lục {open ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
          </button>
        )}
        {demoUrl && (
          <a href={demoUrl} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.6rem 1rem', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
            <FiExternalLink size={14} /> Xem Demo
          </a>
        )}
      </div>
      {open && (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '1.5rem', overflow: 'hidden' }}>
          {visibleRoots.map(sec => (
            <div key={sec.id}>
              <button onClick={() => { onClickSection(sec.id); setOpen(false); }}
                style={{ width: '100%', textAlign: 'left', background: activeId === sec.id ? '#eff6ff' : 'none', border: 'none', borderBottom: '1px solid #f8fafc', padding: '0.7rem 1rem', color: activeId === sec.id ? '#2563eb' : '#374151', fontSize: '0.875rem', fontWeight: activeId === sec.id ? 700 : 500, cursor: 'pointer' }}>
                {sec.title}
              </button>
              {(sec.children || []).filter(c => c.showInToc !== false).map(child => (
                <button key={child.id} onClick={() => { onClickSection(child.id); setOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', background: activeId === child.id ? '#eff6ff' : 'none', border: 'none', borderBottom: '1px solid #f8fafc', padding: '0.6rem 1rem 0.6rem 2rem', color: activeId === child.id ? '#2563eb' : '#64748b', fontSize: '0.82rem', fontWeight: activeId === child.id ? 700 : 400, cursor: 'pointer' }}>
                  └ {child.title}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION RENDERER (root hoặc child)
═══════════════════════════════════════════════════ */
function SectionRenderer({ sec, isChild, onOpenLightbox }) {
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
   MAIN
═══════════════════════════════════════════════════ */
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
          margin-top: 1.75rem;
          padding: 1.25rem 1.25rem 1.25rem 1.5rem;
          border-left: 3px solid #dbeafe;
          background: #f8fbff;
          border-radius: 0 10px 10px 0;
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
              <div className="rich-content" style={{ color: '#475569', fontSize: '0.975rem', lineHeight: '1.8', marginBottom: '2rem', padding: '1.25rem 1.5rem', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '4px solid #2563eb' }}
                dangerouslySetInnerHTML={{ __html: project.description }} />
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

            {/* ── Sections ── */}
            <div>
              {sectionTree.map(sec => (
                <div key={sec.id} id={sec.id} className="section-block" ref={el => sectionRefs.current[sec.id] = el}>
                  {/* Section title */}
                  <h3 className="section-title">{sec.title}</h3>

                  {/* Section content */}
                  <SectionRenderer sec={sec} isChild={false} onOpenLightbox={openLightbox} />

                  {/* ── Children – đúng thứ tự trong cùng section ── */}
                  {(sec.children || []).map(child => (
                    <div key={child.id} id={child.id} className="child-section" ref={el => sectionRefs.current[child.id] = el}>
                      <h4>{child.title}</h4>
                      <SectionRenderer sec={child} isChild={true} onOpenLightbox={openLightbox} />
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {sectionTree.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
                <FiLayers size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
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