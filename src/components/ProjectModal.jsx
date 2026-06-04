import React, { useState } from 'react';
import { FiX, FiCheck, FiPlus, FiArrowUp, FiArrowDown, FiTrash2, FiUploadCloud, FiPaperclip, FiStar, FiEdit } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import { uploadFileToStorage } from '../utils/supabaseClient';
import ConfirmModal from './ConfirmModal';
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';

const ProjectModal = ({ mode, initialData, onClose, onSave, setNotification }) => {
  const [project, setProject] = useState(initialData);
  const [loading, setLoading] = useState(false);
  
  const [isDirty, setIsDirty, checkUnsavedChanges] = useUnsavedChangesWarning();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleCancelClick = () => {
    if (isDirty) setShowConfirm(true);
    else onClose();
  };

  const addSection = () => {
    const newSection = { 
      id: `sec-${Date.now()}`, title: 'Chương mục mới', type: 'text', 
      textContent: '', tableData: { headers: ['Cột 1', 'Cột 2'], rows: [['', '']] }, files: [], images: [], chartType: 'bar', chartData: [{ label: 'Yêu cầu A', value: 70 }] 
    };
    setProject({ ...project, sections: [...(project.sections || []), newSection] });
    setIsDirty(true);
  };

  const updateSection = (sIdx, field, value) => {
    const sections = [...project.sections];
    sections[sIdx][field] = value;
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const moveSection = (sIdx, direction) => {
    const sections = [...project.sections];
    if (direction === 'up' && sIdx === 0) return;
    if (direction === 'down' && sIdx === sections.length - 1) return;
    const tgt = direction === 'up' ? sIdx - 1 : sIdx + 1;
    [sections[sIdx], sections[tgt]] = [sections[tgt], sections[sIdx]];
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const deleteSection = (sIdx) => {
    setProject({ ...project, sections: project.sections.filter((_, i) => i !== sIdx) });
    setIsDirty(true);
  };

  const addTableColumn = (sIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.headers.push(`Cột ${sections[sIdx].tableData.headers.length + 1}`);
    sections[sIdx].tableData.rows.forEach(r => r.push(''));
    setProject({ ...project, sections });
    setIsDirty(true);
  };
  
  const addTableRow = (sIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.rows.push(new Array(sections[sIdx].tableData.headers.length).fill(''));
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const updateTableData = (sIdx, isHeader, rIdx, cIdx, val) => {
    const sections = [...project.sections];
    if (isHeader) sections[sIdx].tableData.headers[cIdx] = val;
    else sections[sIdx].tableData.rows[rIdx][cIdx] = val;
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const deleteTableRow = (sIdx, rIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.rows.splice(rIdx, 1);
    setProject({ ...project, sections });
    setIsDirty(true);
  }

  const deleteTableColumn = (sIdx, cIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.headers.splice(cIdx, 1);
    sections[sIdx].tableData.rows.forEach(r => r.splice(cIdx, 1));
    setProject({ ...project, sections });
    setIsDirty(true);
  }

  const addChartData = (sIdx) => {
    const sections = [...project.sections];
    sections[sIdx].chartData.push({ label: 'Thông số mới', value: 50 });
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const updateChartData = (sIdx, cIdx, field, val) => {
    const sections = [...project.sections];
    sections[sIdx].chartData[cIdx][field] = field === 'value' ? Number(val) : val;
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const deleteChartData = (sIdx, cIdx) => {
    const sections = [...project.sections];
    sections[sIdx].chartData.splice(cIdx, 1);
    setProject({ ...project, sections });
    setIsDirty(true);
  };

  const handleSubmit = () => {
    if (!project.title.trim()) return setNotification({ open: true, type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tên dự án.' });
    setIsDirty(false); 
    onSave(project);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      
      {/* 🚀 CSS ÉP GRID VÀ TỐI ƯU KHI MỞ TRÊN ĐIỆN THOẠI */}
      <style>{`
        .pm-container { background-color: #ffffff; border-radius: 16px; width: 100%; max-width: 1050px; height: 94vh; overflow-y: auto; padding: 2.5rem; box-shadow: 0 25px 50px rgba(0,0,0,0.2); }
        .pm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .pm-grid-sec { display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; width: 85%; }
        .pm-grid-chart { display: grid; grid-template-columns: 2fr 1fr 50px; gap: 1rem; align-items: center; }
        
        @media (max-width: 768px) {
          .pm-container { padding: 1.25rem; height: 98vh; }
          .pm-grid-2 { grid-template-columns: 1fr; }
          .pm-grid-sec { grid-template-columns: 1fr; width: 100%; }
          .pm-grid-chart { grid-template-columns: 1fr 1fr 40px; }
          .pm-btn-group { flex-direction: column; gap: 0.5rem; }
          .pm-btn-group button { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="pm-container">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.4rem)', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {mode === 'add' ? <><FiStar color="#f59e0b" /> Xây Dựng Hồ Sơ Mới</> : <><FiEdit color="#2563eb" /> Cấu Trúc Tài Liệu: {project.title}</>}
          </h3>
          <button onClick={handleCancelClick} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}><FiX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label style={{ fontWeight: 700 }}>Tên tiêu đề hồ sơ</label>
            <input type="text" value={project.title || ''} onChange={(e) => { setProject({ ...project, title: e.target.value }); setIsDirty(true); }} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="pm-grid-2">
            <div className="form-group">
              <label style={{ fontWeight: 700 }}>Thời gian triển khai</label>
              <input type="text" value={project.duration || ''} onChange={(e) => { setProject({ ...project, duration: e.target.value }); setIsDirty(true); }} placeholder="VD: T3/2026 - T5/2026" style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
            </div>
            <div className="form-group">
              <label style={{ fontWeight: 700 }}>Tags công nghệ (Cách nhau dấu phẩy)</label>
              <input 
                type="text" 
                defaultValue={Array.isArray(project.technologies) ? project.technologies.join(', ') : ''} 
                onBlur={(e) => { setProject({ ...project, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }); setIsDirty(true); }} 
                placeholder="BPMN 2.0, Figma, React..." 
                style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <label style={{ fontWeight: 700 }}>Link Demo Dự Án (Live URL)</label>
            <input type="text" value={project.demoUrl || ''} onChange={(e) => { setProject({ ...project, demoUrl: e.target.value }); setIsDirty(true); }} placeholder="https://github.com/..." style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          </div>

          <div className="form-group">
            <label style={{ fontWeight: 700 }}>Mô tả bài toán tổng quan</label>
            <RichTextEditor value={project.description || ''} onChange={(val) => { setProject({ ...project, description: val }); setIsDirty(true); }} />
          </div>

          <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '8px', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: 0, color: '#2563eb', fontWeight: 800, fontSize: '1.2rem' }}>Kiến trúc Mục lục (Table of Contents)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Thêm các chương mục để thiết kế layout trang hồ sơ.</p>
              </div>
              <button 
                type="button" 
                onClick={addSection} 
                style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
              >
                <FiPlus /> Thêm Mục Lục
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {(project.sections || []).map((sec, sIdx) => (
                <div key={sec.id} style={{ padding: 'clamp(1rem, 3vw, 2rem)', border: '1px solid #cbd5e1', borderRadius: '12px', backgroundColor: '#f8fafc', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px', backgroundColor: '#fff', padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => moveSection(sIdx, 'up')} disabled={sIdx === 0} style={{ border:'none', background:'none', cursor:'pointer' }} title="Lên"><FiArrowUp size={16}/></button>
                    <button type="button" onClick={() => moveSection(sIdx, 'down')} disabled={sIdx === project.sections.length - 1} style={{ border:'none', background:'none', cursor:'pointer' }} title="Xuống"><FiArrowDown size={16}/></button>
                    <button type="button" onClick={() => deleteSection(sIdx)} style={{ color: '#ef4444', border:'none', background:'none', cursor:'pointer' }} title="Xóa Mục"><FiTrash2 size={16}/></button>
                  </div>

                  <div className="pm-grid-sec" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group">
                      <label style={{ fontSize:'0.9rem', fontWeight: 800, color: '#0f172a' }}>Tiêu đề mục</label>
                      <input type="text" value={sec.title} onChange={(e) => updateSection(sIdx, 'title', e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'6px', border:'1px solid #94a3b8', backgroundColor:'#fff', fontWeight: 600 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize:'0.9rem', fontWeight: 800, color:'#2563eb' }}>Hình thức Trình bày</label>
                      <select value={sec.type} onChange={(e) => updateSection(sIdx, 'type', e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'6px', border:'1px solid #94a3b8', backgroundColor:'#fff', fontWeight: 600, color: '#2563eb' }}>
                        <option value="text">Văn bản Đặc tả (Rich-text)</option>
                        <option value="image">Bộ sưu tập Sơ đồ / Ảnh</option>
                        <option value="table">Bảng dữ liệu (Table Excel)</option>
                        <option value="file">Tệp tài liệu đính kèm (PDF)</option>
                        <option value="chart">Biểu đồ phân tích số liệu</option>
                      </select>
                    </div>
                  </div>

                  {sec.type === 'text' && (
                    <div>
                      <label style={{ fontSize:'0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Nội dung Đặc tả</label>
                      <RichTextEditor value={sec.textContent || ''} onChange={(val) => updateSection(sIdx, 'textContent', val)} />
                    </div>
                  )}

                  {sec.type === 'image' && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                      <label style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'1.5rem', backgroundColor: '#2563eb', color: '#ffffff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600 }}>
                        <FiUploadCloud /> Tải sơ đồ Flowchart/Hình ảnh lên {loading && '...'}
                        <input type="file" accept="image/*" onChange={async(e)=>{ const file=e.target.files[0]; if(!file)return; setLoading(true); const res=await uploadFileToStorage(file,'assets'); setLoading(false); if(!res.error){ const curImg=sec.images || []; updateSection(sIdx, 'images', [...curImg, { url: res.url, caption: '' }]); }else{ setNotification({open:true, type:'error', title:'Lỗi ảnh', message:res.error.message}); } }} style={{ display:'none' }} disabled={loading}/>
                      </label>
                      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        {(sec.images || []).map((img, imgIdx) => (
                          <div key={imgIdx} style={{ display:'flex', flexWrap: 'wrap', gap:'1.5rem', alignItems:'center', border:'1px solid #cbd5e1', padding:'1rem', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <img src={img.url} alt="block" style={{ width:'120px', height:'120px', objectFit:'cover', borderRadius:'6px', border: '1px solid #94a3b8' }} />
                            <div style={{ flex: '1 1 200px' }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Caption / Giải thích sơ đồ:</label>
                              <RichTextEditor value={img.caption || ''} onChange={(val)=>{ const copy=[...sec.images]; copy[imgIdx].caption=val; updateSection(sIdx, 'images', copy); }} />
                            </div>
                            <button type="button" onClick={()=>{ const copy=sec.images.filter((_,i)=>i!==imgIdx); updateSection(sIdx, 'images', copy); }} style={{ backgroundColor: '#fef2f2', color:'#ef4444', border: '1px solid #fca5a5', padding: '0.6rem', borderRadius: '6px', cursor: 'pointer', display: 'flex' }}><FiTrash2 size={18}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'table' && sec.tableData && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0', overflowX: 'auto' }}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button type="button" onClick={() => addTableColumn(sIdx)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Thêm Cột</button>
                        <button type="button" onClick={() => addTableRow(sIdx)} style={{ padding: '0.5rem 1rem', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Thêm Hàng</button>
                      </div>
                      
                      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                          <tr>
                            {sec.tableData.headers.map((h, cIdx) => (
                              <th key={cIdx} style={{ padding: '0.5rem', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', position: 'relative' }}>
                                <input type="text" value={h} onChange={(e) => updateTableData(sIdx, true, 0, cIdx, e.target.value)} style={{ width: '85%', padding: '0.4rem', fontWeight: 'bold', border: 'none', background: 'transparent' }} placeholder={`Tiêu đề cột ${cIdx+1}`}/>
                                {sec.tableData.headers.length > 1 && <button type="button" onClick={() => deleteTableColumn(sIdx, cIdx)} style={{ position: 'absolute', right: '4px', top: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}>×</button>}
                              </th>
                            ))}
                            <th style={{ width: '50px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {sec.tableData.rows.map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} style={{ padding: '0.5rem', border: '1px solid #cbd5e1' }}>
                                  <input type="text" value={cell} onChange={(e) => updateTableData(sIdx, false, rIdx, cIdx, e.target.value)} style={{ width: '100%', padding: '0.4rem', border: 'none', outline: 'none' }} placeholder="Nhập dữ liệu..."/>
                                </td>
                              ))}
                              <td style={{ textAlign: 'center', border: '1px solid #cbd5e1' }}>
                                {sec.tableData.rows.length > 1 && <button type="button" onClick={() => deleteTableRow(sIdx, rIdx)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {sec.type === 'file' && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                      <label style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'1.5rem', backgroundColor: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 600 }}>
                        <FiPaperclip /> Đính kèm Tệp (PDF) <input type="file" accept=".pdf" onChange={async(e)=>{ const file=e.target.files[0]; if(!file)return; setLoading(true); const res=await uploadFileToStorage(file,'documents'); setLoading(false); if(!res.error){ const curFiles=sec.files || []; updateSection(sIdx, 'files', [...curFiles, { name: file.name, url: res.url }]); } }} style={{ display:'none' }} disabled={loading} />
                      </label>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                        {(sec.files || []).map((file, fIdx) => (
                          <div key={fIdx} style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', backgroundColor:'#f1f5f9', padding:'1rem', borderRadius:'6px', border: '1px solid #cbd5e1', flexWrap: 'wrap', gap: '1rem' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>📄 {file.name}</span>
                            <button type="button" onClick={()=>{ const copy=sec.files.filter((_,i)=>i!==fIdx); updateSection(sIdx, 'files', copy); }} style={{ backgroundColor: '#fef2f2', color:'#ef4444', border: '1px solid #fca5a5', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}><FiTrash2 /> Xóa tệp</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'chart' && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                      <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                        <strong style={{ color: '#0f172a' }}>Chọn loại đồ thị:</strong>
                        <select value={sec.chartType || 'bar'} onChange={(e)=>updateSection(sIdx, 'chartType', e.target.value)} style={{ padding:'0.5rem 1rem', borderRadius:'6px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                          <option value="bar">Biểu đồ Cột (Thanh ngang Bar Chart)</option>
                          <option value="line">Biểu đồ Tiến độ (Màu xanh lá)</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div className="pm-grid-chart" style={{ fontWeight: 700, color: '#475569', paddingBottom: '0.5rem', borderBottom: '1px solid #cbd5e1' }}>
                          <span>Tên Thông Số / Trục Y</span>
                          <span>Giá trị %</span>
                          <span>Xóa</span>
                        </div>
                        {(sec.chartData || []).map((cItem, cIdx) => (
                          <div key={cIdx} className="pm-grid-chart">
                            <input type="text" value={cItem.label} onChange={(e) => updateChartData(sIdx, cIdx, 'label', e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Nhập tên..." />
                            <input type="number" value={cItem.value} onChange={(e) => updateChartData(sIdx, cIdx, 'value', e.target.value)} max="100" min="0" style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            <button type="button" onClick={() => deleteChartData(sIdx, cIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addChartData(sIdx)} style={{ marginTop: '1rem', width: 'max-content', padding: '0.6rem 1.2rem', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Thêm Dữ Liệu</button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pm-btn-group" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', position: 'sticky', bottom: '-20px', backgroundColor: '#fff', zIndex: 10 }}>
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
            style={{ padding: '0.8rem 3rem', fontSize: '1.1rem', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiCheck /> Hoàn Tất Lưu Hồ Sơ
          </button>
        </div>
      </div>

      <ConfirmModal 
        open={showConfirm}
        title="Dữ liệu chưa được lưu!"
        message="Bạn đang chỉnh sửa dở dang. Nếu thoát ra, các thay đổi sẽ bị xóa bỏ hoàn toàn. Bạn có chắc chắn muốn thoát?"
        onConfirm={onClose}
        onCancel={() => setShowConfirm(false)}
        confirmText="Vẫn thoát"
        cancelText="Ở lại"
      />
    </div>
  );
};

export default ProjectModal;