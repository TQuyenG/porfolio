import React, { useState } from 'react';
import { FiX, FiCheck, FiPlus, FiArrowUp, FiArrowDown, FiTrash2, FiUploadCloud, FiPaperclip, FiStar, FiEdit } from 'react-icons/fi';
import RichTextEditor from './RichTextEditor';
import { uploadFileToStorage } from '../utils/supabaseClient';

const ProjectModal = ({ mode, initialData, onClose, onSave, setNotification }) => {
  const [project, setProject] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const addSection = () => {
    const newSection = { 
      id: `sec-${Date.now()}`, title: 'Chương mục mới', type: 'text', 
      textContent: '', tableData: { headers: ['Cột 1', 'Cột 2'], rows: [['', '']] }, files: [], images: [], chartType: 'bar', chartData: [{ label: 'Yêu cầu A', value: 70 }] 
    };
    setProject({ ...project, sections: [...(project.sections || []), newSection] });
  };

  const updateSection = (sIdx, field, value) => {
    const sections = [...project.sections];
    sections[sIdx][field] = value;
    setProject({ ...project, sections });
  };

  const moveSection = (sIdx, direction) => {
    const sections = [...project.sections];
    if (direction === 'up' && sIdx === 0) return;
    if (direction === 'down' && sIdx === sections.length - 1) return;
    const tgt = direction === 'up' ? sIdx - 1 : sIdx + 1;
    [sections[sIdx], sections[tgt]] = [sections[tgt], sections[sIdx]];
    setProject({ ...project, sections });
  };

  const deleteSection = (sIdx) => setProject({ ...project, sections: project.sections.filter((_, i) => i !== sIdx) });

  const addTableColumn = (sIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.headers.push(`Cột ${sections[sIdx].tableData.headers.length + 1}`);
    sections[sIdx].tableData.rows.forEach(r => r.push(''));
    setProject({ ...project, sections });
  };
  
  const addTableRow = (sIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.rows.push(new Array(sections[sIdx].tableData.headers.length).fill(''));
    setProject({ ...project, sections });
  };

  const updateTableData = (sIdx, isHeader, rIdx, cIdx, val) => {
    const sections = [...project.sections];
    if (isHeader) sections[sIdx].tableData.headers[cIdx] = val;
    else sections[sIdx].tableData.rows[rIdx][cIdx] = val;
    setProject({ ...project, sections });
  };

  const deleteTableRow = (sIdx, rIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.rows.splice(rIdx, 1);
    setProject({ ...project, sections });
  }

  const deleteTableColumn = (sIdx, cIdx) => {
    const sections = [...project.sections];
    sections[sIdx].tableData.headers.splice(cIdx, 1);
    sections[sIdx].tableData.rows.forEach(r => r.splice(cIdx, 1));
    setProject({ ...project, sections });
  }

  const addChartData = (sIdx) => {
    const sections = [...project.sections];
    sections[sIdx].chartData.push({ label: 'Thông số mới', value: 50 });
    setProject({ ...project, sections });
  };

  const updateChartData = (sIdx, cIdx, field, val) => {
    const sections = [...project.sections];
    sections[sIdx].chartData[cIdx][field] = field === 'value' ? Number(val) : val;
    setProject({ ...project, sections });
  };

  const deleteChartData = (sIdx, cIdx) => {
    const sections = [...project.sections];
    sections[sIdx].chartData.splice(cIdx, 1);
    setProject({ ...project, sections });
  };

  const handleSubmit = () => {
    if (!project.title.trim()) return setNotification({ open: true, type: 'error', title: 'Lỗi', message: 'Vui lòng nhập tên dự án.' });
    onSave(project);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(5px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '1050px', height: '94vh', overflowY: 'auto', padding: '2.5rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', position: 'sticky', top: 0, backgroundColor: '#fff', zIndex: 10 }}>
          <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {mode === 'add' ? <><FiStar color="#f59e0b" /> Xây Dựng Hồ Sơ Mới</> : <><FiEdit color="#2563eb" /> Cấu Trúc Tài Liệu: {project.title}</>}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b' }}><FiX /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group"><label style={{ fontWeight: 700 }}>Tên tiêu đề hồ sơ</label><input type="text" value={project.title || ''} onChange={(e) => setProject({ ...project, title: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
            <div className="form-group"><label style={{ fontWeight: 700 }}>Thời gian triển khai</label><input type="text" value={project.duration || ''} onChange={(e) => setProject({ ...project, duration: e.target.value })} placeholder="VD: T3/2026 - T5/2026" style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
          </div>
          
          <div className="form-group"><label style={{ fontWeight: 700 }}>Tags công nghệ (Cách nhau dấu phẩy)</label><input type="text" value={Array.isArray(project.technologies) ? project.technologies.join(', ') : ''} onChange={(e) => setProject({ ...project, technologies: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} placeholder="BPMN 2.0, Figma..." style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></div>
          
          <div className="form-group">
            <label style={{ fontWeight: 700 }}>Mô tả bài toán tổng quan</label>
            <RichTextEditor value={project.description || ''} onChange={(val) => setProject({ ...project, description: val })} />
          </div>

          <div style={{ borderTop: '2px dashed #cbd5e1', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', backgroundColor: '#f1f5f9', padding: '1rem', borderRadius: '8px' }}>
              <div>
                <h4 style={{ margin: 0, color: '#2563eb', fontWeight: 800, fontSize: '1.2rem' }}>Kiến trúc Mục lục (Table of Contents)</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Thêm các chương mục để thiết kế layout trang hồ sơ.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={addSection} style={{ padding: '0.6rem 1.2rem', display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Thêm Mục Lục</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {(project.sections || []).map((sec, sIdx) => (
                <div key={sec.id} style={{ padding: '2rem', border: '1px solid #cbd5e1', borderRadius: '12px', backgroundColor: '#f8fafc', position: 'relative', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  
                  <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', display: 'flex', gap: '6px', backgroundColor: '#fff', padding: '0.4rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <button type="button" onClick={() => moveSection(sIdx, 'up')} disabled={sIdx === 0} style={{ border:'none', background:'none', cursor:'pointer' }} title="Lên"><FiArrowUp size={16}/></button>
                    <button type="button" onClick={() => moveSection(sIdx, 'down')} disabled={sIdx === project.sections.length - 1} style={{ border:'none', background:'none', cursor:'pointer' }} title="Xuống"><FiArrowDown size={16}/></button>
                    <button type="button" onClick={() => deleteSection(sIdx)} style={{ color: '#ef4444', border:'none', background:'none', cursor:'pointer' }} title="Xóa Mục"><FiTrash2 size={16}/></button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', width: '85%' }}>
                    <div className="form-group">
                      <label style={{ fontSize:'0.9rem', fontWeight: 800, color: '#0f172a' }}>Tiêu đề mục (Xuất hiện ở Menu Sticky)</label>
                      <input type="text" value={sec.title} onChange={(e) => updateSection(sIdx, 'title', e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'6px', border:'1px solid #94a3b8', backgroundColor:'#fff', fontWeight: 600 }} />
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize:'0.9rem', fontWeight: 800, color:'#2563eb' }}>Hình thức Trình bày</label>
                      <select value={sec.type} onChange={(e) => updateSection(sIdx, 'type', e.target.value)} style={{ width:'100%', padding:'0.75rem', borderRadius:'6px', border:'1px solid #94a3b8', backgroundColor:'#fff', fontWeight: 600, color: '#2563eb' }}>
                        {/* Đã loại bỏ Emoji trong thẻ option */}
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
                      <label style={{ fontSize:'0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>Nội dung Đặc tả (Rich Text Editor)</label>
                      <RichTextEditor value={sec.textContent || ''} onChange={(val) => updateSection(sIdx, 'textContent', val)} />
                    </div>
                  )}

                  {sec.type === 'image' && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                      <label className="btn btn-primary" style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'1.5rem' }}>
                        <FiUploadCloud /> Tải sơ đồ Flowchart/Hình ảnh lên {loading && '...'}
                        <input type="file" accept="image/*" onChange={async(e)=>{ const file=e.target.files[0]; if(!file)return; setLoading(true); const res=await uploadFileToStorage(file,'assets'); setLoading(false); if(!res.error){ const curImg=sec.images || []; updateSection(sIdx, 'images', [...curImg, { url: res.url, caption: '' }]); }else{ setNotification({open:true, type:'error', title:'Lỗi ảnh', message:res.error.message}); } }} style={{ display:'none' }} disabled={loading}/>
                      </label>
                      <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                        {(sec.images || []).map((img, imgIdx) => (
                          <div key={imgIdx} style={{ display:'flex', gap:'1.5rem', alignItems:'center', border:'1px solid #cbd5e1', padding:'1rem', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
                            <img src={img.url} alt="block" style={{ width:'120px', height:'120px', objectFit:'cover', borderRadius:'6px', border: '1px solid #94a3b8' }} />
                            <div style={{ flex: 1 }}>
                              <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Caption / Giải thích sơ đồ:</label>
                              <RichTextEditor value={img.caption || ''} onChange={(val)=>{ const copy=[...sec.images]; copy[imgIdx].caption=val; updateSection(sIdx, 'images', copy); }} />
                            </div>
                            <button type="button" onClick={()=>{ const copy=sec.images.filter((_,i)=>i!==imgIdx); updateSection(sIdx, 'images', copy); }} className="btn btn-secondary" style={{ color:'#ef4444', borderColor: '#ef4444', padding: '0.5rem' }}><FiTrash2 size={18}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'table' && sec.tableData && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0', overflowX: 'auto' }}>
                      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => addTableColumn(sIdx)}><FiPlus /> Thêm Cột</button>
                        <button type="button" className="btn btn-secondary" onClick={() => addTableRow(sIdx)}><FiPlus /> Thêm Hàng</button>
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
                      <label className="btn btn-secondary" style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'8px', marginBottom:'1.5rem', color: '#2563eb', borderColor: '#2563eb' }}>
                        <FiPaperclip /> Đính kèm Tệp (PDF) <input type="file" accept=".pdf" onChange={async(e)=>{ const file=e.target.files[0]; if(!file)return; setLoading(true); const res=await uploadFileToStorage(file,'documents'); setLoading(false); if(!res.error){ const curFiles=sec.files || []; updateSection(sIdx, 'files', [...curFiles, { name: file.name, url: res.url }]); } }} style={{ display:'none' }} disabled={loading} />
                      </label>
                      <div style={{ display:'flex', flexDirection:'column', gap:'0.8rem' }}>
                        {(sec.files || []).map((file, fIdx) => (
                          <div key={fIdx} style={{ display:'flex', justifyContent:'space-between', alignItems: 'center', backgroundColor:'#f1f5f9', padding:'1rem', borderRadius:'6px', border: '1px solid #cbd5e1' }}>
                            <span style={{ fontWeight: 600, color: '#1e293b' }}>📄 {file.name}</span>
                            <button type="button" className="btn btn-secondary" onClick={()=>{ const copy=sec.files.filter((_,i)=>i!==fIdx); updateSection(sIdx, 'files', copy); }} style={{ color:'#ef4444', borderColor: '#ef4444', padding: '0.4rem 1rem' }}><FiTrash2 /> Xóa tệp</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {sec.type === 'chart' && (
                    <div style={{ backgroundColor:'#fff', padding:'1.5rem', borderRadius:'8px', border:'1px solid #e2e8f0' }}>
                      <div style={{ display:'flex', gap:'1rem', alignItems:'center', marginBottom: '1.5rem' }}>
                        <strong style={{ color: '#0f172a' }}>Chọn loại đồ thị:</strong>
                        <select value={sec.chartType || 'bar'} onChange={(e)=>updateSection(sIdx, 'chartType', e.target.value)} style={{ padding:'0.5rem 1rem', borderRadius:'6px', border: '1px solid #cbd5e1', fontWeight: 600 }}>
                          <option value="bar">Biểu đồ Cột (Thanh ngang Bar Chart)</option>
                          <option value="line">Biểu đồ Tiến độ (Màu xanh lá)</option>
                        </select>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 50px', gap: '1rem', fontWeight: 700, color: '#475569', paddingBottom: '0.5rem', borderBottom: '1px solid #cbd5e1' }}>
                          <span>Tên Thông Số / Trục Y</span>
                          <span>Giá trị % (0-100)</span>
                          <span>Xóa</span>
                        </div>
                        {(sec.chartData || []).map((cItem, cIdx) => (
                          <div key={cIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 50px', gap: '1rem', alignItems: 'center' }}>
                            <input type="text" value={cItem.label} onChange={(e) => updateChartData(sIdx, cIdx, 'label', e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} placeholder="Nhập tên..." />
                            <input type="number" value={cItem.value} onChange={(e) => updateChartData(sIdx, cIdx, 'value', e.target.value)} max="100" min="0" style={{ padding: '0.6rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                            <button type="button" onClick={() => deleteChartData(sIdx, cIdx)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '1.2rem', cursor: 'pointer' }}>×</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => addChartData(sIdx)} className="btn btn-secondary" style={{ marginTop: '1rem', width: 'max-content' }}><FiPlus /> Thêm Dữ Liệu</button>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem', position: 'sticky', bottom: '-20px', backgroundColor: '#fff', zIndex: 10 }}>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.8rem 2rem' }}>Hủy Bỏ</button>
          <button className="btn btn-primary" onClick={handleSubmit} style={{ padding: '0.8rem 3rem', fontSize: '1.1rem' }}><FiCheck /> Hoàn Tất Lưu Hồ Sơ</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;