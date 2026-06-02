import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPageContent } from '../utils/supabaseClient';
import { FiArrowLeft, FiClock, FiLayers, FiPaperclip, FiDownload, FiMaximize2, FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function ProjectDetail() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // State điều khiển Lightbox phóng to hình ảnh sơ đồ quy trình
  const [lightbox, setLightbox] = useState({ open: false, list: [], index: 0 });

  useEffect(() => {
    const fetchProject = async () => {
      const content = await getPageContent('projects');
      if (content && content.projects) {
        const found = content.projects.find(p => p.slug === slug && !p.isHidden);
        setProject(found);
      }
      setLoading(false);
    };
    fetchProject();
  }, [slug]);

  // Hàm click vào mục lục tự động lướt xuống nội dung tương ứng
  const scrollToSection = (secId) => {
    const element = document.getElementById(secId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#6b7280', fontSize: '1.2rem' }}>Đang tải cấu trúc giải pháp hồ sơ...</div>;
  if (!project) return (
    <div style={{ textAlign: 'center', padding: '5rem' }}>
      <h2>Hồ sơ dự án hệ thống không tồn tại hoặc đã được ẩn.</h2>
      <Link to="/projects" style={{ color: '#2563eb', fontWeight: 600 }}>← Trở về danh mục</Link>
    </div>
  );

  const sections = project.sections || [];

  return (
    <section className="page project-detail-page" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      <Link to="/projects" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
        <FiArrowLeft /> Quay lại danh sách giải pháp
      </Link>

      {/* SPLIT LAYOUT ĐẲNG CẤP TẠP CHÍ BA (Trái: Nội dung, Phải: Mục lục Sticky) */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '3rem', alignItems: 'start' }}>
        
        {/* CỘT TRÁI: KHÔNG GIAN SHOW NỘI DUNG CHI TIẾT */}
        <div style={{ backgroundColor: '#ffffff', padding: '3.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 30px rgba(0,0,0,0.01)' }}>
          <div style={{ borderBottom: '2px dashed #e2e8f0', paddingBottom: '2rem', marginBottom: '3rem' }}>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', lineHeight: '1.2' }}>{project.title}</h1>
            <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.95rem', fontWeight: 500, flexWrap:'wrap' }}>
              {project.duration && <span style={{ display:'flex', alignItems:'center', gap:'6px' }}><FiClock /> Vòng đời: {project.duration}</span>}
              <span style={{ display:'flex', alignItems:'center', gap:'6px' }}><FiLayers /> Phân mục kỹ thuật: {sections.length} khối nội dung</span>
            </div>
            <p style={{ fontSize:'1.15rem', color:'#475569', lineHeight:'1.7', marginTop:'1.5rem', fontStyle:'italic' }}>{project.description}</p>
          </div>

          {/* VÒNG LẶP RENDER DYNAMIC COMPONENT BLOCK THEO LOẠI DỮ LIỆU */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
            {sections.map((sec) => (
              <div key={sec.id} id={sec.id} style={{ scrollMarginTop: '100px' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', marginBottom: '1.2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
                  {sec.title}
                </h3>

                {/* BLOCK 1: VĂN BẢN RICH TEXT (Dùng cho BRD, SRS) */}
                {sec.type === 'text' && sec.textContent && (
                  <p style={{ color: '#334155', fontSize: '1.1rem', lineHeight: '1.8', whiteSpace: 'pre-wrap', margin: 0 }}>
                    {sec.textContent}
                  </p>
                )}

                {/* BLOCK 2: SƠ ĐỒ HÌNH ẢNH KÈM CAPTION GHI CHÚ */}
                {sec.type === 'image' && sec.images && sec.images.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {sec.images.map((img, imgIdx) => (
                      <div key={imgIdx} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', backgroundColor: '#f8fafc' }}>
                        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setLightbox({ open: true, list: sec.images.map(i => i.url), index: imgIdx })}>
                          <img src={img.url} alt="BA Artifact Diagram" style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '450px', objectFit: 'contain' }} />
                          <div style={{ position: 'absolute', bottom: '10px', right: '10px', backgroundColor: 'rgba(15,23,42,0.8)', color: '#fff', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}><FiMaximize2 size={16}/></div>
                        </div>
                        {img.caption && (
                          <p style={{ margin: '1rem 0 0 0', color: '#475569', fontSize: '1rem', lineHeight: '1.6', borderLeft: '3px solid #2563eb', paddingLeft: '0.75rem', whiteSpace: 'pre-wrap' }}>
                            {img.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* BLOCK 3: MA TRẬN / BẢNG BIỂU ĐỒ HỌA */}
                {sec.type === 'table' && sec.tableData && sec.tableData.headers && (
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.01)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '1rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
                          {sec.tableData.headers.map((h, hIdx) => (
                            <th key={hIdx} style={{ padding: '1rem 1.25rem', color: '#0f172a', fontWeight: 700 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(sec.tableData.rows || []).map((row, rIdx) => (
                          <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} style={{ padding: '1rem 1.25rem', color: '#334155', lineHeight: '1.5' }}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* BLOCK 4: TỆP ĐÍNH KÈM VÀ PREVIEW PDF INLINE */}
                {sec.type === 'file' && sec.files && sec.files.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {sec.files.map((file, fIdx) => (
                      <div key={fIdx} style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: '#1e293b' }}><FiPaperclip color="#2563eb" /> {file.name}</span>
                          <a href={file.url} download target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}><FiDownload /> Tải tài liệu</a>
                        </div>
                        {/* Inline PDF Viewer Render Elements */}
                        <div style={{ backgroundColor: '#64748b', padding: '0.5rem' }}>
                          <iframe src={`${file.url}#toolbar=0`} title="Document Viewer" style={{ width: '100%', height: '500px', border: 'none', backgroundColor: '#fff', borderRadius: '6px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* BLOCK 5: BIỂU ĐỒ SỐ LIỆU */}
                {sec.type === 'chart' && sec.chartData && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2.5rem', backgroundColor: '#ffffff' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
                      {(sec.chartData).map((cItem, cIdx) => (
                        <div key={cIdx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ width: '120px', fontSize: '0.9rem', fontWeight: 600, color: '#475569', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cItem.label}</div>
                          <div style={{ flex: 1, backgroundColor: '#f1f5f9', height: '24px', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: sec.chartType === 'line' ? '#10b981' : '#2563eb', width: `${Math.min(cItem.value, 100)}%`, height: '100%', transition: 'width 1s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '8px' }}>
                              <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>{cItem.value}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: THANH ĐIỀU HƯỚNG MỤC LỤC ĐỘNG STICKY PANEL */}
        <div style={{ position: 'sticky', top: '100px', backgroundColor: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Mục lục cấu trúc</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {sections.map((sec) => (
              <li key={sec.id}>
                <button 
                  onClick={() => scrollToSection(sec.id)}
                  style={{ 
                    background: 'none', border: 'none', width: '100%', textAlign: 'left', 
                    padding: '0.6rem 0.75rem', borderRadius: '6px', color: '#475569', 
                    fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer',
                    transition: 'all 0.2s', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis'
                  }}
                  onMouseOver={e => { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.color = '#2563eb'; }}
                  onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                >
                  {sec.title}
                </button>
              </li>
            ))}
            {sections.length === 0 && <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Chưa thiết lập mục lục.</span>}
          </ul>
        </div>

      </div>

      {/* LIGHTBOX PHÓNG TO ẢNH TRÌNH CHI TIẾT SƠ ĐỒ LUỒNG */}
      {lightbox.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.95)', zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLightbox({ ...lightbox, open: false })}>
          <button style={{ position: 'absolute', top: '30px', right: '30px', background: 'none', border: 'none', color: '#fff', fontSize: '2.5rem', cursor: 'pointer' }} onClick={() => setLightbox({ ...lightbox, open: false })}><FiX /></button>
          {lightbox.list.length > 1 && (
            <>
              <button style={{ position: 'absolute', left: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '2.5rem', padding: '1rem 0.5rem', borderRadius: '8px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: lightbox.index === 0 ? lightbox.list.length - 1 : lightbox.index - 1 }); }}><FiChevronLeft /></button>
              <button style={{ position: 'absolute', right: '30px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '2.5rem', padding: '1rem 0.5rem', borderRadius: '8px', cursor: 'pointer' }} onClick={(e) => { e.stopPropagation(); setLightbox({ ...lightbox, index: (lightbox.index + 1) % lightbox.list.length }); }}><FiChevronRight /></button>
            </>
          )}
          <img src={lightbox.list[lightbox.index]} alt="Large view" style={{ maxWidth: '85%', maxHeight: '85vh', borderRadius: '8px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
        </div>
      )}

    </section>
  );
}

export default ProjectDetail;