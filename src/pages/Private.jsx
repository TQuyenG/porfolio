import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { 
  FiLock, FiLogOut, FiSave, FiHome, FiUser, 
  FiFolder, FiFileText, FiGlobe, FiPlus, FiTrash2, FiUploadCloud,
  FiEye, FiEyeOff, FiStar, FiArrowUp, FiArrowDown, FiImage, FiEdit3, FiEdit, FiFolderPlus, FiX
} from 'react-icons/fi';
import { getPageContent, upsertPageContent, uploadFileToStorage, supabase } from '../utils/supabaseClient';
import NotificationModal from '../components/NotificationModal';
import ProjectModal from '../components/ProjectModal';
import BlogModal from '../components/BlogModal';
import RichTextEditor from '../components/RichTextEditor'; 

const generateUniqueSlug = (title, existingItems, currentId) => {
  let baseSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!baseSlug) baseSlug = `item-${currentId}`;
  let finalSlug = baseSlug;
  let counter = 1;
  while (existingItems.some(item => item.id !== currentId && item.slug === finalSlug)) { finalSlug = `${baseSlug}-${counter}`; counter++; }
  return finalSlug;
};

function Private() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

  const [projectModalConfig, setProjectModalConfig] = useState({ open: false, mode: 'add', index: null, data: {} });
  const [blogModalConfig, setBlogModalConfig] = useState({ open: false, mode: 'add', index: null, data: {} });
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || '';

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) setIsAuthenticated(ADMIN_EMAIL ? (data.session.user.email === ADMIN_EMAIL) : true);
    };
    checkSession();
  }, [ADMIN_EMAIL]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTabContent = async () => {
      setLoading(true);
      const data = await getPageContent(activeTab);
      setFormData(data || {});
      setLoading(false);
    };
    fetchTabContent();
  }, [isAuthenticated, activeTab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const resp = await supabase.auth.signInWithPassword({ email, password });
    if (resp.error) return setModal({ open: true, type: 'error', title: 'Lỗi đăng nhập', message: resp.error.message });
    setIsAuthenticated(ADMIN_EMAIL ? (resp.data?.user?.email === ADMIN_EMAIL) : true);
  };

  const handleSaveContent = async () => {
    setLoading(true);
    const { error } = await upsertPageContent(activeTab, formData);
    setLoading(false);
    if (error) setModal({ open: true, type: 'error', title: 'Lưu thất bại', message: error.message });
    else setModal({ open: true, type: 'success', title: 'Thành công', message: 'Dữ liệu đã được đồng bộ lên website.' });
  };

  const handleSingleFileUpload = async (e, fieldKey, bucket = 'assets') => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const res = await uploadFileToStorage(file, bucket);
    setLoading(false);
    if (!res.error) setFormData(prev => ({ ...prev, [fieldKey]: res.url }));
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const res = await uploadFileToStorage(file, 'assets');
    setLoading(false);
    if (!res.error) setFormData(prev => ({ ...prev, gallery: [...(formData.gallery || []), res.url] }));
  };

  const removeGalleryImage = (index) => setFormData({ ...formData, gallery: formData.gallery.filter((_, idx) => idx !== index) });

  const moveItem = (type, index, direction) => {
    const key = type === 'project' ? 'projects' : 'posts';
    const list = [...(formData[key] || [])];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;
    const tgt = direction === 'up' ? index - 1 : index + 1;
    [list[index], list[tgt]] = [list[tgt], list[index]];
    setFormData({ ...formData, [key]: list });
  };

  const deleteItem = (type, index) => setFormData({ ...formData, [type === 'project' ? 'projects' : 'posts']: (formData[type === 'project' ? 'projects' : 'posts'] || []).filter((_, i) => i !== index) });
  
  const toggleStatus = (type, index, field) => {
    const key = type === 'project' ? 'projects' : 'posts';
    const list = [...(formData[key] || [])];
    list[index][field] = !list[index][field];
    setFormData({ ...formData, [key]: list });
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const currentCats = formData.categories || ['Chung', 'Nghiệp vụ BA', 'Kỹ năng mềm', 'Bài học kỹ thuật'];
    if (currentCats.includes(trimmed)) return;
    setFormData({ ...formData, categories: [...currentCats, trimmed] });
    setNewCategoryInput('');
  };
  const handleRemoveCategory = (catName) => setFormData({ ...formData, categories: (formData.categories || []).filter(c => c !== catName) });

  const openProjectForm = (mode, index = null) => {
    if (mode === 'add') setProjectModalConfig({ open: true, mode: 'add', index: null, data: { id: Date.now(), title: '', slug: '', duration: '', description: '', isHidden: false, isPinned: false, technologies: [], sections: [] } });
    else setProjectModalConfig({ open: true, mode: 'edit', index, data: { ...formData.projects[index], sections: formData.projects[index].sections || [] } });
  };

  const handleSaveProjectFromModal = (updatedProjectData) => {
    const list = [...(formData.projects || [])];
    updatedProjectData.slug = generateUniqueSlug(updatedProjectData.title, list, updatedProjectData.id);
    if (projectModalConfig.mode === 'add') setFormData({ ...formData, projects: [updatedProjectData, ...list] });
    else { list[projectModalConfig.index] = updatedProjectData; setFormData({ ...formData, projects: list }); }
    setProjectModalConfig({ ...projectModalConfig, open: false });
  };

  const openBlogForm = (mode, index = null) => {
    const currentCats = formData.categories || ['Chung', 'Nghiệp vụ BA'];
    if (mode === 'add') setBlogModalConfig({ open: true, mode: 'add', index: null, data: { id: Date.now(), title: '', slug: '', category: currentCats[0], excerpt: '', content: '', date: new Date().toLocaleDateString('vi-VN'), isHidden: false, isPinned: false, isDraft: false, coverImage: '' } });
    else setBlogModalConfig({ open: true, mode: 'edit', index, data: { ...formData.posts[index] } });
  };

  const handleSaveBlogFromModal = (updatedBlogData) => {
    const list = [...(formData.posts || [])];
    updatedBlogData.slug = generateUniqueSlug(updatedBlogData.title, list, updatedBlogData.id);
    updatedBlogData.date = new Date().toLocaleDateString('vi-VN');
    if (blogModalConfig.mode === 'add') setFormData({ ...formData, posts: [updatedBlogData, ...list] });
    else { list[blogModalConfig.index] = updatedBlogData; setFormData({ ...formData, posts: list }); }
    setBlogModalConfig({ ...blogModalConfig, open: false });
  };

  const addExperience = () => {
    const currentExp = formData.experiences || [];
    setFormData({ ...formData, experiences: [...currentExp, { title: '', company: '', date: '', description: '' }] });
  };
  const updateExperience = (idx, field, value) => {
    const updated = [...(formData.experiences || [])];
    updated[idx][field] = value;
    setFormData({ ...formData, experiences: updated });
  };
  const removeExperience = (idx) => setFormData({ ...formData, experiences: (formData.experiences || []).filter((_, i) => i !== idx) });

  const addSkill = () => {
    const currentSkills = formData.skills || [];
    setFormData({ ...formData, skills: [...currentSkills, { title: '', items: [] }] });
  };
  const updateSkill = (idx, field, value) => {
    const updated = [...(formData.skills || [])];
    if (field === 'items') updated[idx][field] = value.split(',').map(s => s.trim()).filter(Boolean);
    else updated[idx][field] = value;
    setFormData({ ...formData, skills: updated });
  };
  const removeSkill = (idx) => setFormData({ ...formData, skills: (formData.skills || []).filter((_, i) => i !== idx) });


  if (!isAuthenticated) {
    return (
      <section className="page private-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FiLock /> Quản trị viên</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-group"><label style={{ fontWeight: 600 }}>Email đăng nhập</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} required /></div>
            <div className="form-group"><label style={{ fontWeight: 600 }}>Mật khẩu</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} required /></div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', marginTop: '0.5rem' }}>Đăng nhập hệ thống</button>
          </form>
        </div>
        <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
      </section>
    );
  }

  return (
    <section className="page private-page" style={{ display: 'flex', minHeight: '80vh', gap: '2rem', marginTop: '1rem', flexWrap: 'wrap' }}>
      <div style={{ width: '280px', flexShrink: 0, backgroundColor: '#ffffff', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb', height: 'fit-content' }}>
        <h4 style={{ color: '#9ca3af', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '1rem', paddingLeft: '0.5rem' }}>Menu CMS</h4>
        {[
          { id: 'home', label: 'Trang Chủ', icon: <FiHome /> },
          { id: 'about', label: 'Giới Thiệu', icon: <FiUser /> },
          { id: 'projects', label: 'Hồ Sơ Dự Án BA', icon: <FiFolder /> },
          { id: 'blog', label: 'Bài Viết (Blog)', icon: <FiEdit3 /> },
          { id: 'resume', label: 'Hồ Sơ CV', icon: <FiFileText /> },
          { id: 'global', label: 'Cấu Hình Chung', icon: <FiGlobe /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '0.8rem 1rem', borderRadius: '8px', border: 'none', backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent', color: activeTab === tab.id ? '#ffffff' : '#4b5563', fontWeight: activeTab === tab.id ? 600 : 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s' }}>
            {tab.icon} {tab.label}
          </button>
        ))}
        <hr style={{ border: '0', borderTop: '1px solid #f3f4f6', margin: '1.5rem 0' }} />
        <button className="btn btn-secondary" onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid #ef4444', color: '#ef4444' }}><FiLogOut /> Đăng xuất</button>
      </div>

      <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.02)', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ textTransform: 'capitalize', color: '#111827', margin: 0 }}>Quản lý Trang {activeTab}</h2>
          <button className="btn btn-primary" onClick={handleSaveContent} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.7rem 2rem' }}><FiSave /> {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</button>
        </div>

        {activeTab === 'home' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
 
    {/* ── Nội dung Hero ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 1.2rem 0', color: '#0f172a' }}>Nội Dung Hero (Màn Hình Chính)</h4>
 
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Tiêu đề chính</label>
        <input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
      </div>
 
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Slogan / Định vị nghề nghiệp</label>
        <input type="text" value={formData.tagline || ''} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="VD: Business Analyst Intern · Web Developer" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
        <small style={{ color: '#94a3b8' }}>Dùng dấu · để phân cách các vị trí</small>
      </div>
 
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Đoạn giới thiệu ngắn</label>
        <RichTextEditor value={formData.intro || ''} onChange={(val) => setFormData({ ...formData, intro: val })} />
      </div>
 
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Vị trí / Thành phố</label>
        <input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="VD: Ho Chi Minh City, Vietnam" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
      </div>
 
      <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id="openToWork"
          checked={formData.openToWork !== false}
          onChange={(e) => setFormData({ ...formData, openToWork: e.target.checked })}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <label htmlFor="openToWork" style={{ fontWeight: 600, cursor: 'pointer', margin: 0 }}>
          Hiển thị badge "Đang tìm kiếm cơ hội mới"
        </label>
      </div>
    </div>
 
    {/* ── Avatar ── */}
    <div style={{ padding: '1.5rem', background: '#eff6ff', borderRadius: '10px', border: '1px dashed #93c5fd' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#1e40af' }}>Ảnh Đại Diện (Avatar)</h4>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {formData.avatarUrl && (
          <img src={formData.avatarUrl} alt="avatar" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #93c5fd' }} />
        )}
        <input type="text" value={formData.avatarUrl || ''} onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} placeholder="URL hoặc upload ảnh" style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }} />
        <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiUploadCloud /> Upload
          <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'avatarUrl')} style={{ display: 'none' }} />
        </label>
      </div>
      <small style={{ color: '#64748b', display: 'block', marginTop: '0.5rem' }}>Ảnh avatar hiển thị bên phải hero trên màn hình máy tính.</small>
    </div>
 
    {/* ── Banner ── */}
    <div className="form-group">
      <label style={{ fontWeight: 600 }}>Ảnh Banner Nền (URL hoặc Upload)</label>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="text" value={formData.bannerUrl || ''} onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', minWidth: '200px' }} />
        <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiUploadCloud /> Tải ảnh lên
          <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'bannerUrl')} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
 
    {/* ── Stats ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <h4 style={{ margin: 0 }}>Số Liệu Nổi Bật (Stats Bar)</h4>
        <button
          type="button" className="btn btn-secondary"
          onClick={() => setFormData({ ...formData, stats: [...(formData.stats || []), { icon: 'briefcase', value: 0, suffix: '+', label: '' }] })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        ><FiPlus /> Thêm</button>
      </div>
      <small style={{ color: '#94a3b8', display: 'block', marginBottom: '1rem' }}>Icon: briefcase | trending | users | zap</small>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {(formData.stats || []).map((stat, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 1fr 36px', gap: '0.5rem', alignItems: 'center' }}>
            <input type="text" value={stat.label} placeholder="Nhãn (VD: Dự Án BA)" onChange={(e) => { const s = [...formData.stats]; s[idx].label = e.target.value; setFormData({ ...formData, stats: s }); }} style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <input type="number" value={stat.value} placeholder="Số" onChange={(e) => { const s = [...formData.stats]; s[idx].value = Number(e.target.value); setFormData({ ...formData, stats: s }); }} style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <input type="text" value={stat.suffix} placeholder="Hậu tố (+/%)" onChange={(e) => { const s = [...formData.stats]; s[idx].suffix = e.target.value; setFormData({ ...formData, stats: s }); }} style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <input type="text" value={stat.icon} placeholder="Icon key" onChange={(e) => { const s = [...formData.stats]; s[idx].icon = e.target.value; setFormData({ ...formData, stats: s }); }} style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <button type="button" onClick={() => setFormData({ ...formData, stats: formData.stats.filter((_, i) => i !== idx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
 
    {/* ── Highlighted Skills ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 0.8rem 0' }}>Kỹ Năng Nổi Bật (Skills Strip)</h4>
      <small style={{ color: '#94a3b8', display: 'block', marginBottom: '1rem' }}>Nhập mỗi kỹ năng, cách nhau bằng dấu phẩy.</small>
      <textarea
        rows={3}
        value={(formData.highlightedSkills || []).join(', ')}
        onChange={(e) => setFormData({ ...formData, highlightedSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
        placeholder="VD: Requirements Elicitation, BPMN / UML, SQL & Data Analysis, Agile / Scrum"
        style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical', fontFamily: 'inherit' }}
      />
    </div>
 
    {/* ── Gallery ── */}
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
      <h4 style={{ margin: '0 0 1rem 0' }}><FiImage /> Thư Viện Hình Ảnh (Gallery Marquee)</h4>
      <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
        <FiPlus /> Thêm ảnh
        <input type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />
      </label>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {(formData.gallery || []).map((imgUrl, idx) => (
          <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
            <img src={imgUrl} alt="gal" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            <button onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
          </div>
        ))}
      </div>
    </div>
 
  </div>
)}

        {activeTab === 'about' && (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
 
    {/* ── Header trang ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 1rem 0' }}>Tiêu Đề Trang</h4>
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Tiêu đề chính</label>
        <input type="text" value={formData.pageTitle || ''} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
      </div>
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Tiêu đề phụ (Subtitle)</label>
        <input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
      </div>
    </div>
 
    {/* ── Giới thiệu bản thân ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <h4 style={{ margin: '0 0 1rem 0' }}>Phần Giới Thiệu Bản Thân</h4>
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Tiêu đề phần tự thuật</label>
        <input type="text" value={formData.intro?.title || ''} onChange={(e) => setFormData({ ...formData, intro: { ...formData.intro, title: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
      </div>
      <div className="form-group">
        <label style={{ fontWeight: 600 }}>Nội dung chi tiết</label>
        <RichTextEditor value={formData.intro?.body || ''} onChange={(val) => setFormData({ ...formData, intro: { ...formData.intro, body: val } })} />
      </div>
    </div>
 
    {/* ── Values / Nguyên tắc ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>Nguyên Tắc Làm Việc (Values)</h4>
        <button
          type="button" className="btn btn-secondary"
          onClick={() => setFormData({ ...formData, values: [...(formData.values || []), { emoji: '✨', title: '', desc: '' }] })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        ><FiPlus /> Thêm</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(formData.values || []).map((v, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '50px 1fr 2fr 36px', gap: '0.5rem', alignItems: 'center', background: '#fff', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <input type="text" value={v.emoji} placeholder="🔍" onChange={(e) => { const arr = [...(formData.values || [])]; arr[idx].emoji = e.target.value; setFormData({ ...formData, values: arr }); }} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '1.2rem', textAlign: 'center' }} />
            <input type="text" value={v.title} placeholder="Tiêu đề" onChange={(e) => { const arr = [...(formData.values || [])]; arr[idx].title = e.target.value; setFormData({ ...formData, values: arr }); }} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <input type="text" value={v.desc} placeholder="Mô tả ngắn" onChange={(e) => { const arr = [...(formData.values || [])]; arr[idx].desc = e.target.value; setFormData({ ...formData, values: arr }); }} style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            <button type="button" onClick={() => setFormData({ ...formData, values: (formData.values || []).filter((_, i) => i !== idx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
 
    {/* ── Timeline / Cột mốc ── */}
    <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>Hành Trình Chuyên Môn (Timeline)</h4>
        <button
          type="button" className="btn btn-secondary"
          onClick={() => setFormData({ ...formData, timeline: [...(formData.timeline || []), { year: '', title: '', desc: '', location: '' }] })}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        ><FiPlus /> Thêm cột mốc</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {(formData.timeline || []).map((item, idx) => (
          <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', position: 'relative' }}>
            <button type="button" onClick={() => setFormData({ ...formData, timeline: (formData.timeline || []).filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={15} /></button>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr', gap: '0.75rem', paddingRight: '2rem' }}>
              <div><label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Năm</label><input type="text" value={item.year} placeholder="2024" onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].year = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
              <div><label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tiêu đề sự kiện</label><input type="text" value={item.title} placeholder="VD: Thực tập BA" onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].title = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
              <div><label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Địa điểm</label><input type="text" value={item.location || ''} placeholder="TP. HCM" onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].location = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
            </div>
            <div style={{ marginTop: '0.75rem' }}><label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mô tả</label><input type="text" value={item.desc} placeholder="Mô tả ngắn về sự kiện..." onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].desc = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
          </div>
        ))}
      </div>
    </div>
 
    {/* ── CTA Section ── */}
    <div style={{ padding: '1.5rem', background: '#f0f4ff', borderRadius: '10px', border: '1px solid #c7d2fe' }}>
      <h4 style={{ margin: '0 0 1rem 0', color: '#4338ca' }}>Phần Kêu Gọi Hành Động (CTA Cuối Trang)</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tiêu đề CTA</label><input type="text" value={formData.ctaSection?.heading || ''} onChange={(e) => setFormData({ ...formData, ctaSection: { ...formData.ctaSection, heading: e.target.value } })} placeholder="Sẵn sàng kết nối?" style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
        <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nút chính (text)</label><input type="text" value={formData.ctaSection?.primaryText || ''} onChange={(e) => setFormData({ ...formData, ctaSection: { ...formData.ctaSection, primaryText: e.target.value } })} placeholder="Liên Hệ Ngay" style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} /></div>
      </div>
      <div><label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nội dung mô tả CTA</label><textarea rows={2} value={formData.ctaSection?.body || ''} onChange={(e) => setFormData({ ...formData, ctaSection: { ...formData.ctaSection, body: e.target.value } })} placeholder="Tôi luôn mở cửa với các cơ hội mới..." style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical', fontFamily: 'inherit' }} /></div>
    </div>
 
    {/* ── Gallery ── */}
    <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
      <h4 style={{ margin: '0 0 1rem 0' }}><FiImage /> Ảnh Hành Trình (Gallery)</h4>
      <label className="btn btn-primary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
        <FiPlus /> Thêm ảnh
        <input type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />
      </label>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {(formData.gallery || []).map((imgUrl, idx) => (
          <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
            <img src={imgUrl} alt="gal" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
            <button onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
          </div>
        ))}
      </div>
    </div>
 
  </div>
)}

        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Hồ sơ dự án ({ (formData.projects || []).length })</h3>
              <button className="btn btn-secondary" onClick={() => openProjectForm('add')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Tạo Giải Pháp Mới</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
              {(formData.projects || []).map((proj, idx) => (
                <div key={proj.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: proj.isHidden ? '#f3f4f6' : '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ color: '#111827' }}>{proj.title}</strong>
                    <span style={{ fontSize: '0.8rem', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>{(proj.sections || []).length} mục lục</span>
                    {proj.isPinned && <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontWeight: 700 }}>Đã Ghim</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => moveItem('project', idx, 'up')} disabled={idx === 0} className="action-row-btn" title="Lên"><FiArrowUp /></button>
                    <button onClick={() => moveItem('project', idx, 'down')} disabled={idx === formData.projects.length - 1} className="action-row-btn" title="Xuống"><FiArrowDown /></button>
                    <button onClick={() => toggleStatus('project', idx, 'isPinned')} className="action-row-btn" style={{ color: proj.isPinned ? '#f59e0b' : '#9ca3af' }} title="Ghim"><FiStar fill={proj.isPinned ? '#f59e0b' : 'none'} /></button>
                    <button onClick={() => toggleStatus('project', idx, 'isHidden')} className="action-row-btn" style={{ color: '#2563eb' }} title="Ẩn/Hiện">{proj.isHidden ? <FiEyeOff /> : <FiEye />}</button>
                    <button onClick={() => openProjectForm('edit', idx)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><FiEdit size={14}/> Sửa nội dung</button>
                    <button onClick={() => deleteItem('project', idx)} className="action-row-btn" style={{ color: '#ef4444' }} title="Xóa"><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="form-group"><label style={{ fontWeight: 600 }}>Tiêu đề trang Góc Chia Sẻ</label><input type="text" value={formData.pageTitle || ''} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '6px' }}><FiFolderPlus /> Cấu hình Danh Mục</h4>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} placeholder="Nhập tên danh mục..." style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                <button type="button" className="btn btn-primary" onClick={handleAddCategory}>Thêm</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(formData.categories || ['Chung', 'Nghiệp vụ BA']).map(cat => (
                  <span key={cat} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    {cat} <FiX style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleRemoveCategory(cat)} />
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Kho bài viết ({ (formData.posts || []).length })</h3>
              <button className="btn btn-secondary" onClick={() => openBlogForm('add')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Soạn Bài Mới</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {(formData.posts || []).map((post, idx) => (
                <div key={post.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: post.isHidden ? '#f3f4f6' : '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <strong style={{ color: '#111827' }}>{post.title}</strong>
                    <span style={{ backgroundColor: '#f1f5f9', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{post.category}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button onClick={() => moveItem('blog', idx, 'up')} disabled={idx === 0} className="action-row-btn"><FiArrowUp /></button>
                    <button onClick={() => moveItem('blog', idx, 'down')} disabled={idx === formData.posts.length - 1} className="action-row-btn"><FiArrowDown /></button>
                    <button onClick={() => toggleStatus('blog', idx, 'isPinned')} className="action-row-btn" style={{ color: post.isPinned ? '#f59e0b' : '#9ca3af' }}><FiStar fill={post.isPinned ? '#f59e0b' : 'none'} /></button>
                    <button onClick={() => toggleStatus('blog', idx, 'isHidden')} className="action-row-btn" style={{ color: '#2563eb' }}>{post.isHidden ? <FiEyeOff /> : <FiEye />}</button>
                    <button onClick={() => openBlogForm('edit', idx)} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}><FiEdit size={14}/> Sửa</button>
                    <button onClick={() => deleteItem('blog', idx)} className="action-row-btn" style={{ color: '#ef4444' }}><FiTrash2 /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB RESUME --- */}
        {activeTab === 'resume' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* THIẾT LẬP CHẾ ĐỘ HIỂN THỊ */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#b45309' }}>Cài Đặt Hiển Thị Trang Resume</h4>
              <div className="form-group">
                <label style={{ fontWeight: 600, color: '#1e293b' }}>Chọn chế độ hiển thị cho nhà tuyển dụng:</label>
                <select 
                  value={formData.displayMode || 'both'} 
                  onChange={(e) => setFormData({ ...formData, displayMode: e.target.value })} 
                  style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid #fcd34d', backgroundColor: '#fff', fontWeight: 600, marginTop: '0.5rem', color: '#1e293b' }}
                >
                  <option value="both">Hiển thị cả Bản PDF (Trình xem) và Hồ sơ Động (Web Format)</option>
                  <option value="dynamic_only">Chỉ hiển thị Hồ sơ Động trên Web (Ẩn bản xem PDF)</option>
                  <option value="pdf_only">Chỉ hiển thị Trình xem bản PDF gốc (Ẩn Hồ sơ Web)</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Thông Tin Cá Nhân & Lời Tựa</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group"><label style={{ fontWeight: 600 }}>Họ và tên</label><input type="text" value={formData.header?.name || ''} onChange={(e) => setFormData({ ...formData, header: { ...formData.header, name: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
                <div className="form-group"><label style={{ fontWeight: 600 }}>Liên hệ nhanh (Email / SĐT)</label><input type="text" value={formData.header?.contact || ''} onChange={(e) => setFormData({ ...formData, header: { ...formData.header, contact: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ fontWeight: 600 }}>Địa điểm cư trú</label>
                <input type="text" value={formData.header?.location || ''} onChange={(e) => setFormData({ ...formData, header: { ...formData.header, location: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600 }}>Tuyên bố Tổng quan (Overview)</label>
                <RichTextEditor value={formData.overview || ''} onChange={(val) => setFormData({ ...formData, overview: val })} />
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0 }}>Quản lý Kinh Nghiệm Làm Việc</h4>
                <button className="btn btn-secondary" onClick={addExperience} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Thêm Kinh Nghiệm</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(formData.experiences || []).map((exp, idx) => (
                  <div key={idx} style={{ padding: '1.5rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', position: 'relative' }}>
                    <button onClick={() => removeExperience(idx)} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18}/></button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', marginBottom: '1rem', width: '90%' }}>
                      <div className="form-group"><label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chức danh / Vị trí</label><input type="text" value={exp.title} onChange={(e) => updateExperience(idx, 'title', e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}/></div>
                      <div className="form-group"><label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Công ty</label><input type="text" value={exp.company} onChange={(e) => updateExperience(idx, 'company', e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}/></div>
                      <div className="form-group"><label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Thời gian</label><input type="text" value={exp.date} onChange={(e) => updateExperience(idx, 'date', e.target.value)} style={{ width: '100%', padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}/></div>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Chi tiết công việc</label>
                      <RichTextEditor value={exp.description || ''} onChange={(val) => updateExperience(idx, 'description', val)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: 0 }}>Quản lý Bộ Kỹ Năng</h4>
                <button className="btn btn-secondary" onClick={addSkill} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPlus /> Thêm Kỹ Năng</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.skills || []).map((skill, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 40px', gap: '1rem', alignItems: 'center' }}>
                    <input type="text" value={skill.title} onChange={(e) => updateSkill(idx, 'title', e.target.value)} placeholder="Tên nhóm (VD: Công cụ)" style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}/>
                    <input type="text" value={Array.isArray(skill.items) ? skill.items.join(', ') : ''} onChange={(e) => updateSkill(idx, 'items', e.target.value)} placeholder="Liệt kê kỹ năng, cách nhau dấu phẩy" style={{ padding: '0.6rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}/>
                    <button type="button" onClick={() => removeSkill(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18}/></button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px dashed #2563eb' }}>
              <h4 style={{ margin: '0 0 0.5rem 0' }}>Tập tin CV gốc đám mây (PDF)</h4>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="text" value={formData.cvUrl || ''} readOnly style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff' }} />
                <label className="btn btn-primary" style={{ cursor: 'pointer', fontWeight: 600 }}>
                  Upload PDF <input type="file" accept=".pdf" onChange={(e) => handleSingleFileUpload(e, 'cvUrl', 'documents')} style={{ display: 'none' }} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB GLOBAL --- */}
        {activeTab === 'global' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="form-group"><label style={{ fontWeight: 600 }}>Email liên hệ</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
            <div className="form-group"><label style={{ fontWeight: 600 }}>Số điện thoại</label><input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
            <div className="form-group"><label style={{ fontWeight: 600 }}>Địa chỉ hành chính</label><input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
            
            <div className="form-group">
              <label style={{ fontWeight: 600, color: '#2563eb' }}>Mô tả Footer Bio</label>
              <RichTextEditor value={formData.footerBio || ''} onChange={(val) => setFormData({ ...formData, footerBio: val })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group"><label>GitHub URL</label><input type="text" value={formData.social?.github || ''} onChange={(e) => setFormData({ ...formData, social: { ...formData.social, github: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
              <div className="form-group"><label>LinkedIn URL</label><input type="text" value={formData.social?.linkedin || ''} onChange={(e) => setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} /></div>
            </div>
          </div>
        )}
      </div>

      {projectModalConfig.open && <ProjectModal mode={projectModalConfig.mode} initialData={projectModalConfig.data} onClose={() => setProjectModalConfig({ ...projectModalConfig, open: false })} onSave={handleSaveProjectFromModal} setNotification={setModal} />}
      {blogModalConfig.open && <BlogModal mode={blogModalConfig.mode} initialData={blogModalConfig.data} categories={formData.categories || ['Chung']} onClose={() => setBlogModalConfig({ ...blogModalConfig, open: false })} onSave={handleSaveBlogFromModal} setNotification={setModal} />}

      <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
    </section>
  );
}

export default Private;