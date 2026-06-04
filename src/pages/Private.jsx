import React, { useEffect, useState, useRef } from 'react';
import '../styles/pages.css';
import { 
  FiLock, FiLogOut, FiSave, FiHome, FiUser, 
  FiFolder, FiFileText, FiGlobe, FiPlus, FiTrash2, FiUploadCloud,
  FiEye, FiEyeOff, FiStar, FiArrowUp, FiArrowDown, FiImage, FiEdit3, FiEdit, FiFolderPlus, FiX,
  FiBriefcase, FiTrendingUp, FiUsers, FiZap, FiGithub,
  FiTarget, FiAward, FiClock, FiActivity, FiMonitor, FiSmartphone,
  FiDatabase, FiCloud, FiHeart, FiSmile, FiMessageCircle, FiThumbsUp, 
  FiCheckCircle, FiCoffee, FiTool, FiShield, FiMenu
} from 'react-icons/fi';
import { getPageContent, upsertPageContent, uploadFileToStorage, supabase } from '../utils/supabaseClient';
import NotificationModal from '../components/NotificationModal';
import ProjectModal from '../components/ProjectModal';
import BlogModal from '../components/BlogModal';
import RichTextEditor from '../components/RichTextEditor'; 
import ConfirmModal from '../components/ConfirmModal';
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';

const generateUniqueSlug = (title, existingItems, currentId) => {
  let baseSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  if (!baseSlug) baseSlug = `item-${currentId}`;
  let finalSlug = baseSlug;
  let counter = 1;
  const isDuplicate = (slug) => existingItems.some(item => item.id !== currentId && item.slug === slug);
  while (isDuplicate(finalSlug)) { 
    finalSlug = `${baseSlug}-${counter}`; 
    counter++; 
  }
  return finalSlug;
};

const AVAILABLE_ICONS = [
  { key: 'briefcase', label: 'Cặp xách (Công việc)', component: <FiBriefcase /> },
  { key: 'trending', label: 'Biểu đồ (Tăng trưởng)', component: <FiTrendingUp /> },
  { key: 'users', label: 'Nhóm người (Khách hàng)', component: <FiUsers /> },
  { key: 'zap', label: 'Tia chớp (Tốc độ)', component: <FiZap /> },
  { key: 'target', label: 'Mục tiêu (Hoàn thành)', component: <FiTarget /> },
  { key: 'award', label: 'Cúp (Giải thưởng)', component: <FiAward /> },
  { key: 'clock', label: 'Đồng hồ (Thời gian)', component: <FiClock /> },
  { key: 'activity', label: 'Nhịp tim (Hoạt động)', component: <FiActivity /> },
  { key: 'monitor', label: 'Màn hình máy tính', component: <FiMonitor /> },
  { key: 'smartphone', label: 'Điện thoại di động', component: <FiSmartphone /> },
  { key: 'globe', label: 'Quả địa cầu (Toàn cầu)', component: <FiGlobe /> },
  { key: 'database', label: 'Cơ sở dữ liệu (Data)', component: <FiDatabase /> },
  { key: 'cloud', label: 'Đám mây (Cloud)', component: <FiCloud /> },
  { key: 'heart', label: 'Trái tim (Yêu thích)', component: <FiHeart /> },
  { key: 'smile', label: 'Mặt cười (Hài lòng)', component: <FiSmile /> },
  { key: 'message', label: 'Tin nhắn (Phản hồi)', component: <FiMessageCircle /> },
  { key: 'thumbsup', label: 'Ngón tay cái (Like)', component: <FiThumbsUp /> },
  { key: 'check', label: 'Dấu tích (Thành công)', component: <FiCheckCircle /> },
  { key: 'star', label: 'Ngôi sao (Đánh giá)', component: <FiStar /> },
  { key: 'coffee', label: 'Cốc cà phê (Sáng tạo)', component: <FiCoffee /> },
  { key: 'tool', label: 'Cờ lê (Công cụ)', component: <FiTool /> },
  { key: 'shield', label: 'Cái khiên (Bảo mật)', component: <FiShield /> },
];

export default function Private() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

  // TRẠNG THÁI CẢNH BÁO & RESPONSIVE ĐIỀU HƯỚNG
  const [isDirty, setIsDirty, checkUnsavedChanges] = useUnsavedChangesWarning();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Hook Đóng/Mở Sidebar
  const isInitialLoading = useRef(false);

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
      isInitialLoading.current = true;
      const data = await getPageContent(activeTab);
      setFormData(data || {});
      setLoading(false);
      setTimeout(() => {
        isInitialLoading.current = false;
        setIsDirty(false);
      }, 100);
    };
    fetchTabContent();
  }, [isAuthenticated, activeTab, setIsDirty]);

  useEffect(() => {
    if (!isInitialLoading.current && Object.keys(formData).length > 0) setIsDirty(true);
  }, [formData, setIsDirty]);

  const requestTabChange = (tabId) => {
    if (tabId === activeTab) {
      setSidebarOpen(false);
      return;
    }
    if (isDirty) {
      setPendingAction(() => () => { setActiveTab(tabId); setIsDirty(false); setSidebarOpen(false); });
      setShowConfirm(true);
    } else {
      setActiveTab(tabId);
      setSidebarOpen(false);
    }
  };

  const confirmTabChange = () => {
    if (pendingAction) pendingAction();
    setShowConfirm(false);
  };

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
    else {
      setModal({ open: true, type: 'success', title: 'Thành công', message: 'Dữ liệu đã được đồng bộ lên website.' });
      setIsDirty(false);
    }
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

  const openProjectForm = (mode, index = null) => {
    if (mode === 'add') setProjectModalConfig({ open: true, mode: 'add', index: null, data: { id: Date.now(), title: '', slug: '', duration: '', demoUrl: '', description: '', isHidden: false, isPinned: false, technologies: [], sections: [] } });
    else setProjectModalConfig({ open: true, mode: 'edit', index, data: { ...formData.projects[index], sections: formData.projects[index].sections || [] } });
  };
  
  const handleSaveProjectFromModal = (updatedProjectData) => {
    const list = [...(formData.projects || [])];
    updatedProjectData.slug = generateUniqueSlug(updatedProjectData.title, list, updatedProjectData.id);
    if (projectModalConfig.mode === 'add') setFormData({ ...formData, projects: [updatedProjectData, ...list] });
    else { list[projectModalConfig.index] = updatedProjectData; setFormData({ ...formData, projects: list }); }
    setProjectModalConfig({ ...projectModalConfig, open: false });
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleAddCategory = () => {
    const trimmed = newCategoryInput.trim();
    if (!trimmed) return;
    const currentCats = formData.categories || ['Chung', 'Nghiệp vụ BA'];
    if (currentCats.includes(trimmed)) return;
    setFormData({ ...formData, categories: [...currentCats, trimmed] });
    setNewCategoryInput('');
  };
  
  const handleRemoveCategory = (catName) => setFormData({ ...formData, categories: (formData.categories || []).filter(c => c !== catName) });

  const addSkill = () => setFormData({ ...formData, skills: [...(formData.skills || []), { title: '', items: [] }] });
  const updateSkill = (idx, field, value) => {
    const updated = [...(formData.skills || [])];
    if (field === 'items') updated[idx][field] = value.split(',').map(s => s.trim()).filter(Boolean);
    else updated[idx][field] = value;
    setFormData({ ...formData, skills: updated });
  };
  const removeSkill = (idx) => setFormData({ ...formData, skills: (formData.skills || []).filter((_, i) => i !== idx) });

  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.95rem' };
  const labelStyle = { fontWeight: 700, color: '#1e1b4b', display: 'block', marginBottom: '0.5rem', fontSize: '0.95rem' };
  const currentStatsCount = (formData.stats || []).length;

  if (!isAuthenticated) {
    return (
      <section style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '75vh', backgroundColor: '#f8fafc' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '16px', backgroundColor: '#ffffff', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1e1b4b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FiLock /> Khu Vực Quản Trị</h2>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div><label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Email đăng nhập</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} required /></div>
            <div><label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Mật khẩu bảo mật</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }} required /></div>
            <button type="submit" style={{ width: '100%', padding: '1rem', marginTop: '1rem', backgroundColor: '#6366F1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>Đăng Nhập</button>
          </form>
        </div>
        <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
      </section>
    );
  }

  return (
    <div className="admin-wrapper">
      
      {/* 🚀 CSS RESPONSIVE CHO ADMIN LAYOUT */}
      <style>{`
        .admin-wrapper { display: flex; min-height: 100vh; background-color: #f1f5f9; position: relative; overflow-x: hidden; }
        .admin-sidebar { width: 260px; flex-shrink: 0; background-color: #1e1b4b; padding: 2rem 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; color: #fff; z-index: 1000; transition: transform 0.3s ease; }
        .admin-main { flex: 1; padding: 3rem 4rem; overflow-y: auto; position: relative; width: 100%; max-width: 100vw; }
        .admin-topbar { position: sticky; top: -3rem; background-color: #f1f5f9; z-index: 100; display: flex; justify-content: space-between; align-items: center; padding-bottom: 1.5rem; padding-top: 0.5rem; margin-bottom: 2.5rem; border-bottom: 2px solid #e2e8f0; }
        .admin-card { padding: 2rem; background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
        .menu-toggle-btn { display: none; background: none; border: none; font-size: 2rem; cursor: pointer; color: #1e1b4b; margin-right: 1rem; padding: 0; }
        .admin-overlay { display: none; }
        
        /* Chế độ Grid tự động co giãn 100% khi màn hình nhỏ */
        .admin-grid-auto { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: 1.5rem; }

        @media (max-width: 900px) {
          .admin-sidebar { position: fixed; top: 0; bottom: 0; left: 0; transform: translateX(-100%); }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-main { padding: 1.5rem 1rem; }
          .admin-topbar { flex-direction: column; align-items: flex-start; gap: 1rem; top: -1.5rem; }
          .admin-topbar .actions { width: 100%; display: flex; justify-content: flex-end; }
          .admin-card { padding: 1.25rem; }
          .menu-toggle-btn { display: block; }
          .admin-overlay.open { display: block; position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(2px); z-index: 999; }
          
          /* Ép Layout Bảng cấu trúc dự án (Tránh vỡ) */
          .admin-list-item { flex-direction: column; align-items: flex-start !important; gap: 1rem; }
          .admin-list-actions { width: 100%; display: flex; justify-content: space-between; overflow-x: auto; padding-bottom: 0.5rem; }
        }
      `}</style>

      {/* OVERLAY ĐỂ ĐÓNG MENU TRÊN MOBILE */}
      <div className={`admin-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* SIDEBAR ĐIỀU HƯỚNG */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <h3 style={{ color: '#818cf8', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1.5px', marginBottom: '2rem', paddingLeft: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Menu CMS
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(false)} style={{ color: '#fff', fontSize: '1.5rem', display: 'block' }}><FiX /></button>
        </h3>
        {[
          { id: 'home', label: 'Trang Chủ', icon: <FiHome /> },
          { id: 'about', label: 'Giới Thiệu', icon: <FiUser /> },
          { id: 'projects', label: 'Hồ Sơ Dự Án BA', icon: <FiFolder /> },
          { id: 'blog', label: 'Bài Viết (Blog)', icon: <FiEdit3 /> },
          { id: 'resume', label: 'Hồ Sơ CV', icon: <FiFileText /> },
          { id: 'global', label: 'Cấu Hình Liên Hệ', icon: <FiGlobe /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => requestTabChange(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', backgroundColor: activeTab === tab.id ? '#6366F1' : 'transparent', color: activeTab === tab.id ? '#ffffff' : '#94a3b8', fontWeight: activeTab === tab.id ? 700 : 500, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto' }}>
          <button onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '1rem', width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}><FiLogOut /> Đăng xuất an toàn</button>
        </div>
      </div>

      {/* KHÔNG GIAN LÀM VIỆC CHÍNH */}
      <div className="admin-main">
        
        {/* THANH TIÊU ĐỀ DÍNH CHẶT (STICKY HEADER) TỐI ƯU MOBILE */}
        <div className="admin-topbar">
          <div style={{ display: 'flex', alignItems: 'flex-start' }}>
            <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}><FiMenu /></button>
            <div>
              <h1 style={{ color: '#1e1b4b', margin: '0 0 0.5rem 0', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, textTransform: 'capitalize' }}>Chỉnh Sửa: {activeTab}</h1>
              <p style={{ color: '#64748b', margin: 0, fontSize: '0.9rem' }}>Cập nhật nội dung hiển thị trực tiếp lên Website. {isDirty && <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: '8px' }}>(Có thay đổi chưa lưu)</span>}</p>
            </div>
          </div>
          <div className="actions">
            <button onClick={handleSaveContent} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.8rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)', transition: 'transform 0.2s', width: '100%', justifyContent: 'center' }}>
              <FiSave size={20} /> {loading ? 'Đang đồng bộ...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>

        {/* TAB HOME */}
        {activeTab === 'home' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Nội Dung Banner Chính</h3>
              <div className="admin-grid-auto">
                <div><label style={labelStyle}>Tiêu đề chính</label><input type="text" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} style={inputStyle} placeholder="VD: Xin Chào! Tôi là Quyen" /></div>
                <div><label style={labelStyle}>Định vị nghề nghiệp (Tagline)</label><input type="text" value={formData.tagline || ''} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} style={inputStyle} placeholder="VD: Business Analyst Intern · Web Developer" /></div>
                <div><label style={labelStyle}>Vị trí địa lý</label><input type="text" value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} style={inputStyle} placeholder="VD: Ho Chi Minh City, Vietnam" /></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e0e7ff', borderRadius: '8px' }}>
                <input type="checkbox" id="openToWork" checked={formData.openToWork !== false} onChange={(e) => setFormData({ ...formData, openToWork: e.target.checked })} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label htmlFor="openToWork" style={{ fontWeight: 700, color: '#4338ca', cursor: 'pointer', margin: 0, fontSize: '0.9rem' }}>Hiển thị nhãn dán "Đang tìm kiếm cơ hội mới (Open to work)"</label>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={labelStyle}>Đoạn văn giới thiệu ngắn</label>
                <RichTextEditor value={formData.intro || ''} onChange={(val) => setFormData({ ...formData, intro: val })} />
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <label style={labelStyle}>Tóm tắt Năng lực (Hiện ở mục Về Tôi)</label>
                <RichTextEditor value={formData.aboutBrief || ''} onChange={(val) => setFormData({ ...formData, aboutBrief: val })} />
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Tài Nguyên Hình Ảnh</h3>
              <div className="admin-grid-auto">
                <div style={{ padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff' }}>
                  <label style={labelStyle}>Ảnh Nền Banner</label>
                  {formData.bannerUrl && <img src={formData.bannerUrl} alt="banner" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                  <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải nền lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'bannerUrl')} style={{ display: 'none' }} /></label>
                </div>
                <div style={{ padding: '1.5rem', border: '2px dashed #818cf8', borderRadius: '12px', background: '#eff6ff' }}>
                  <label style={labelStyle}>Ảnh Chân Dung (Cut-out PNG)</label>
                  {formData.avatarUrl && <img src={formData.avatarUrl} alt="avatar" style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '8px', marginBottom: '1rem' }} />}
                  <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600 }}><FiUploadCloud /> Tải ảnh PNG trong suốt <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'avatarUrl')} style={{ display: 'none' }} /></label>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>Các Chỉ Số Nổi Bật (Stats)</h3>
                  <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Giới hạn tối đa 4 chỉ số ({currentStatsCount}/4).</p>
                </div>
                <button 
                  disabled={currentStatsCount >= 4}
                  onClick={() => setFormData({ ...formData, stats: [...(formData.stats || []), { icon: 'briefcase', value: 10, suffix: '+', label: 'Dự án đã làm' }] })} 
                  style={{ padding: '0.6rem 1.2rem', backgroundColor: currentStatsCount >= 4 ? '#cbd5e1' : '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: currentStatsCount >= 4 ? 'not-allowed' : 'pointer', display: 'flex', gap: '6px' }}
                >
                  <FiPlus /> Thêm chỉ số
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.stats || []).map((stat, idx) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: '#fff', padding: '1.2rem 1rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ flex: '1 1 200px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Chọn Icon (Ký hiệu)</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <span style={{ fontSize: '1.8rem', color: '#6366f1' }}>{AVAILABLE_ICONS.find(i => i.key === stat.icon)?.component || <FiZap/>}</span>
                        <select value={stat.icon} onChange={(e) => { const s = [...formData.stats]; s[idx].icon = e.target.value; setFormData({ ...formData, stats: s }); }} style={{ ...inputStyle, padding: '0.6rem' }}>
                          {AVAILABLE_ICONS.map(ic => <option key={ic.key} value={ic.key}>{ic.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ flex: '1 1 150px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Tên nhãn hiển thị</label><input type="text" value={stat.label} onChange={(e) => { const s = [...formData.stats]; s[idx].label = e.target.value; setFormData({ ...formData, stats: s }); }} style={{ ...inputStyle, padding: '0.6rem', marginTop: '4px' }} placeholder="VD: Dự án, Khách hàng..."/></div>
                    <div style={{ flex: '1 1 80px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Con số</label><input type="number" value={stat.value} onChange={(e) => { const s = [...formData.stats]; s[idx].value = Number(e.target.value); setFormData({ ...formData, stats: s }); }} style={{ ...inputStyle, padding: '0.6rem', marginTop: '4px' }} placeholder="10" /></div>
                    <div style={{ flex: '1 1 80px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Hậu tố</label><input type="text" value={stat.suffix} onChange={(e) => { const s = [...formData.stats]; s[idx].suffix = e.target.value; setFormData({ ...formData, stats: s }); }} style={{ ...inputStyle, padding: '0.6rem', marginTop: '4px' }} placeholder="+, %, th"/></div>
                    <button onClick={() => setFormData({ ...formData, stats: formData.stats.filter((_, i) => i !== idx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }}><FiTrash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Thẻ Kỹ Năng / Công Nghệ Nổi Bật</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>Nhập các từ khóa, phân cách bằng dấu phẩy (,). Click ra ngoài ô để lưu.</p>
              <textarea
                rows={3}
                defaultValue={(formData.highlightedSkills || []).join(', ')}
                onBlur={(e) => setFormData({ ...formData, highlightedSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                placeholder="VD: Requirements Elicitation, BPMN / UML, SQL & Data Analysis..."
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
            
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1rem 0', fontSize: '1.4rem' }}>Khoảnh Khắc Kỷ Niệm (Gallery)</h3>
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.5rem', background: '#10b981', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700 }}>
                <FiPlus /> Thêm hình ảnh mới
                <input type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />
              </label>
              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                {(formData.gallery || []).map((imgUrl, idx) => (
                  <div key={idx} style={{ position: 'relative', width: '120px', height: '120px' }}>
                    <img src={imgUrl} alt="gal" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                    <button onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiX size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB ABOUT */}
        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Thông Tin Banner (Đầu Trang)</h3>
              <div className="admin-grid-auto">
                <div><label style={labelStyle}>Tiêu đề trang (Banner)</label><input type="text" value={formData.pageTitle || ''} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Tiêu đề phụ (Subtitle)</label><input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff' }}>
                <label style={labelStyle}>Ảnh Bìa About (Cover Dài)</label>
                {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải nền lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} /></label>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Thông Tin Tự Thuật</h3>
              <div style={{ padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff', marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Ảnh Chân Dung Phụ (Cạnh Text)</label>
                {formData.portraitUrl && <img src={formData.portraitUrl} alt="portrait" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải ảnh lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'portraitUrl')} style={{ display: 'none' }} /></label>
              </div>

              <div>
                <label style={labelStyle}>Tiêu đề phần tự thuật</label>
                <input type="text" value={formData.intro?.title || ''} onChange={(e) => setFormData({ ...formData, intro: { ...formData.intro, title: e.target.value } })} style={{ ...inputStyle, marginBottom: '1rem' }} />
                <label style={labelStyle}>Nội dung tự thuật chi tiết</label>
                <RichTextEditor value={formData.intro?.body || ''} onChange={(val) => setFormData({ ...formData, intro: { ...formData.intro, body: val } })} />
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>Nguyên Tắc / Giá Trị Cốt Lõi</h3>
                <button onClick={() => setFormData({ ...formData, values: [...(formData.values || []), { emoji: '✨', title: '', desc: '' }] })} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '6px' }}><FiPlus /> Thêm nguyên tắc</button>
              </div>
              <div className="admin-grid-auto">
                {(formData.values || []).map((v, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <button onClick={() => setFormData({ ...formData, values: (formData.values || []).filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={18} /></button>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{ width: '60px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Emoji</label><input type="text" value={v.emoji} onChange={(e) => { const arr = [...(formData.values || [])]; arr[idx].emoji = e.target.value; setFormData({ ...formData, values: arr }); }} style={{ ...inputStyle, textAlign: 'center', padding: '0.6rem' }} /></div>
                      <div style={{ flex: 1 }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Tiêu đề</label><input type="text" value={v.title} onChange={(e) => { const arr = [...(formData.values || [])]; arr[idx].title = e.target.value; setFormData({ ...formData, values: arr }); }} style={{ ...inputStyle, padding: '0.6rem' }} /></div>
                    </div>
                    <div><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Mô tả ngắn</label><textarea rows={2} defaultValue={v.desc} onBlur={(e) => { const arr = [...(formData.values || [])]; arr[idx].desc = e.target.value; setFormData({ ...formData, values: arr }); }} style={{ ...inputStyle, padding: '0.6rem', resize: 'vertical' }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>Hành Trình Chuyên Môn (Timeline)</h3>
                <button onClick={() => setFormData({ ...formData, timeline: [...(formData.timeline || []), { year: '', title: '', desc: '', company: '' }] })} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '6px' }}><FiPlus /> Thêm cột mốc</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.timeline || []).map((item, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', position: 'relative' }}>
                    <button onClick={() => setFormData({ ...formData, timeline: (formData.timeline || []).filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={20} /></button>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', paddingRight: '2rem', marginBottom: '1rem' }}>
                      <div style={{ flex: '1 1 100px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Năm/Tháng</label><input type="text" value={item.year} onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].year = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={inputStyle} /></div>
                      <div style={{ flex: '2 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Chức danh / Tiêu đề</label><input type="text" value={item.title} onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].title = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={inputStyle} /></div>
                      <div style={{ flex: '2 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Tên Công ty</label><input type="text" value={item.company || ''} onChange={(e) => { const arr = [...(formData.timeline || [])]; arr[idx].company = e.target.value; setFormData({ ...formData, timeline: arr }); }} style={inputStyle} /></div>
                    </div>
                    <div><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Nội dung mô tả</label><RichTextEditor value={item.desc || ''} onChange={(val) => { const arr = [...(formData.timeline || [])]; arr[idx].desc = val; setFormData({ ...formData, timeline: arr }); }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>Chứng Chỉ & Bằng Cấp</h3>
                <button onClick={() => setFormData({ ...formData, achievements: [...(formData.achievements || []), { name: '', date: '', logo: '', url: '' }] })} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '6px' }}><FiPlus /> Thêm bằng cấp</button>
              </div>
              <div className="admin-grid-auto">
                {(formData.achievements || []).map((ach, idx) => (
                  <div key={idx} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <button onClick={() => setFormData({ ...formData, achievements: (formData.achievements || []).filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: '15px', right: '15px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', zIndex: 10 }}><FiTrash2 size={18} /></button>
                    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {ach.logo ? <img src={ach.logo} style={{ width: '80px', height: '80px', objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: '8px' }} alt="logo" /> : <div style={{ width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiImage color="#94a3b8"/></div>}
                        <label style={{ fontSize: '0.75rem', textAlign: 'center', cursor: 'pointer', color: '#6366f1', fontWeight: 700 }}>Upload <input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files[0]; if(!file)return; const res = await uploadFileToStorage(file, 'assets'); if(!res.error) { const arr = [...(formData.achievements || [])]; arr[idx].logo = res.url; setFormData({...formData, achievements: arr}); } }} style={{ display: 'none' }} /></label>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem', minWidth: '200px' }}>
                        <div><input type="text" value={ach.name} onChange={(e) => { const arr = [...formData.achievements]; arr[idx].name = e.target.value; setFormData({ ...formData, achievements: arr }); }} style={{ ...inputStyle, padding: '0.6rem' }} placeholder="Tên chứng chỉ" /></div>
                        <div><input type="text" value={ach.date} onChange={(e) => { const arr = [...formData.achievements]; arr[idx].date = e.target.value; setFormData({ ...formData, achievements: arr }); }} style={{ ...inputStyle, padding: '0.6rem' }} placeholder="Thời gian (VD: Tháng 5, 2026)" /></div>
                        <div><input type="text" value={ach.url} onChange={(e) => { const arr = [...formData.achievements]; arr[idx].url = e.target.value; setFormData({ ...formData, achievements: arr }); }} style={{ ...inputStyle, padding: '0.6rem' }} placeholder="Link xác thực chứng chỉ" /></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>Nền Tảng Học Vấn</h3>
                <button onClick={() => setFormData({ ...formData, education: [...(formData.education || []), { title: '', company: '', date: '' }] })} style={{ padding: '0.6rem 1.2rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', gap: '6px' }}><FiPlus /> Thêm trường học</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.education || []).map((edu, idx) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Chuyên ngành</label><input type="text" value={edu.title} onChange={(e) => { const arr = [...(formData.education || [])]; arr[idx].title = e.target.value; setFormData({ ...formData, education: arr }); }} style={{ ...inputStyle, padding: '0.6rem', marginTop: '4px' }} /></div>
                    <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Trường ĐH / Tổ chức</label><input type="text" value={edu.company} onChange={(e) => { const arr = [...(formData.education || [])]; arr[idx].company = e.target.value; setFormData({ ...formData, education: arr }); }} style={{ ...inputStyle, padding: '0.6rem', marginTop: '4px' }} /></div>
                    <div style={{ flex: '1 1 100px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Niên khóa</label><input type="text" value={edu.date} onChange={(e) => { const arr = [...(formData.education || [])]; arr[idx].date = e.target.value; setFormData({ ...formData, education: arr }); }} style={{ ...inputStyle, padding: '0.6rem', marginTop: '4px' }} /></div>
                    <button onClick={() => setFormData({ ...formData, education: (formData.education || []).filter((_, i) => i !== idx) })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }}><FiTrash2 size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB PROJECTS */}
        {activeTab === 'projects' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Thông Tin Banner (Đầu Trang)</h3>
              <div className="admin-grid-auto">
                <div><label style={labelStyle}>Tiêu đề trang</label><input type="text" value={formData.pageTitle || ''} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Tiêu đề phụ (Subtitle)</label><input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff' }}>
                <label style={labelStyle}>Ảnh Bìa (Cover Dài)</label>
                {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải nền lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} /></label>
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e1b4b' }}>Quản Lý Dự Án ({ (formData.projects || []).length })</h3>
                <button style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, cursor: 'pointer' }} onClick={() => openProjectForm('add')}><FiPlus /> Thêm Dự Án Mới</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.projects || []).map((proj, idx) => (
                  <div key={proj.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: proj.isHidden ? '#f8fafc' : '#ffffff' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ color: '#1e1b4b', fontSize: '1.1rem' }}>{proj.title}</strong>
                      <span style={{ fontSize: '0.85rem', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600 }}>{(proj.sections || []).length} mục lục</span>
                      {proj.isPinned && <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.85rem', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 700 }}>Đã Ghim</span>}
                    </div>
                    <div className="admin-list-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => moveItem('project', idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}><FiArrowUp /></button>
                      <button onClick={() => moveItem('project', idx, 'down')} disabled={idx === formData.projects.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}><FiArrowDown /></button>
                      <button onClick={() => toggleStatus('project', idx, 'isPinned')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: proj.isPinned ? '#f59e0b' : '#cbd5e1' }}><FiStar fill={proj.isPinned ? '#f59e0b' : 'none'} /></button>
                      <button onClick={() => toggleStatus('project', idx, 'isHidden')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#3b82f6' }}>{proj.isHidden ? <FiEyeOff /> : <FiEye />}</button>
                      <button onClick={() => openProjectForm('edit', idx)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}><FiEdit size={16}/> Sửa</button>
                      <button onClick={() => deleteItem('project', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB BLOG */}
        {activeTab === 'blog' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Thông Tin Banner (Đầu Trang)</h3>
              <div className="admin-grid-auto">
                <div><label style={labelStyle}>Tiêu đề trang</label><input type="text" value={formData.pageTitle || ''} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Tiêu đề phụ (Subtitle)</label><input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff' }}>
                <label style={labelStyle}>Ảnh Bìa (Cover Dài)</label>
                {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải nền lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} /></label>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e1b4b', fontSize: '1.4rem' }}>Cấu hình Danh Mục</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <input type="text" value={newCategoryInput} onChange={(e) => setNewCategoryInput(e.target.value)} placeholder="Nhập tên danh mục..." style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
                <button type="button" onClick={handleAddCategory} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Thêm</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                {(formData.categories || ['Chung', 'Nghiệp vụ BA']).map(cat => (
                  <span key={cat} style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    {cat} <FiX style={{ cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }} onClick={() => handleRemoveCategory(cat)} />
                  </span>
                ))}
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.4rem', color: '#1e1b4b' }}>Kho Bài Viết ({ (formData.posts || []).length })</h3>
                <button style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 700 }} onClick={() => openBlogForm('add')}><FiPlus /> Viết Bài Mới</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.posts || []).map((post, idx) => (
                  <div key={post.id} className="admin-list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: post.isHidden ? '#f8fafc' : '#ffffff' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ color: '#1e1b4b', fontSize: '1.1rem' }}>{post.title}</strong>
                      <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.85rem', padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 600 }}>{post.category}</span>
                    </div>
                    <div className="admin-list-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button onClick={() => moveItem('blog', idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}><FiArrowUp /></button>
                      <button onClick={() => moveItem('blog', idx, 'down')} disabled={idx === formData.posts.length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b' }}><FiArrowDown /></button>
                      <button onClick={() => toggleStatus('blog', idx, 'isPinned')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: post.isPinned ? '#f59e0b' : '#cbd5e1' }}><FiStar fill={post.isPinned ? '#f59e0b' : 'none'} /></button>
                      <button onClick={() => toggleStatus('blog', idx, 'isHidden')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#3b82f6' }}>{post.isHidden ? <FiEyeOff /> : <FiEye />}</button>
                      <button onClick={() => openBlogForm('edit', idx)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: '#1e293b' }}><FiEdit size={16}/> Sửa</button>
                      <button onClick={() => deleteItem('blog', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}><FiTrash2 /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB RESUME */}
        {activeTab === 'resume' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Thông Tin Banner (Đầu Trang)</h3>
              <div className="admin-grid-auto">
                <div><label style={labelStyle}>Tiêu đề trang</label><input type="text" value={formData.pageTitle || ''} onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Tiêu đề phụ (Subtitle)</label><input type="text" value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} style={inputStyle} /></div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff' }}>
                <label style={labelStyle}>Ảnh Bìa (Cover Dài)</label>
                {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải nền lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} /></label>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ margin: '0 0 1rem 0', color: '#1e1b4b', fontSize: '1.4rem' }}>Chế độ hiển thị Web / PDF</h3>
              <select 
                value={formData.displayMode || 'both'} 
                onChange={(e) => setFormData({ ...formData, displayMode: e.target.value })} 
                style={{ ...inputStyle, fontWeight: 600, color: '#4338ca', backgroundColor: '#e0e7ff', border: 'none' }}
              >
                <option value="both">Hiển thị cả Bản PDF (Trình xem) và Hồ sơ Động (Web Format)</option>
                <option value="dynamic_only">Chỉ hiển thị Hồ sơ Động trên Web (Ẩn bản xem PDF)</option>
                <option value="pdf_only">Chỉ hiển thị Trình xem bản PDF gốc (Ẩn Hồ sơ Web)</option>
              </select>
            </div>

            <div className="admin-card">
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e1b4b', fontSize: '1.4rem' }}>Thông Tin Cá Nhân & Lời Tựa</h3>
              <div className="admin-grid-auto" style={{ marginBottom: '1.5rem' }}>
                <div><label style={labelStyle}>Họ và tên</label><input type="text" value={formData.header?.name || ''} onChange={(e) => setFormData({ ...formData, header: { ...formData.header, name: e.target.value } })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Liên hệ nhanh</label><input type="text" value={formData.header?.contact || ''} onChange={(e) => setFormData({ ...formData, header: { ...formData.header, contact: e.target.value } })} style={inputStyle} /></div>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={labelStyle}>Tuyên bố Tổng quan (Overview)</label>
                <RichTextEditor value={formData.overview || ''} onChange={(val) => setFormData({ ...formData, overview: val })} />
              </div>
              <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px dashed #6366f1' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#4338ca' }}>Tập tin CV gốc (PDF)</h4>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" value={formData.cvUrl || ''} readOnly style={{ ...inputStyle, flex: 1, minWidth: '200px' }} />
                  <label style={{ background: '#6366f1', color: '#fff', padding: '0.8rem 2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                    <FiUploadCloud /> Upload PDF <input type="file" accept=".pdf" onChange={(e) => handleSingleFileUpload(e, 'cvUrl', 'documents')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem' }}>Bộ Kỹ Năng Mềm / Cứng</h3>
                <button onClick={addSkill} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700 }}><FiPlus /> Thêm Nhóm</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(formData.skills || []).map((skill, idx) => (
                  <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', background: '#fff', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                    <div style={{ flex: '1 1 200px' }}><label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Tên nhóm</label><input type="text" value={skill.title} onChange={(e) => updateSkill(idx, 'title', e.target.value)} placeholder="VD: Công cụ" style={{ ...inputStyle, marginTop: '4px' }}/></div>
                    <div style={{ flex: '2 1 300px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>Danh sách kỹ năng (Phân cách bằng dấu phẩy)</label>
                      <textarea rows={1} defaultValue={Array.isArray(skill.items) ? skill.items.join(', ') : ''} onBlur={(e) => updateSkill(idx, 'items', e.target.value)} placeholder="Figma, BPMN, SQL..." style={{ ...inputStyle, marginTop: '4px', resize: 'vertical' }}/>
                    </div>
                    <button type="button" onClick={() => removeSkill(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }}><FiTrash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB GLOBAL LÀ CỦA LIÊN HỆ */}
        {activeTab === 'global' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-card">
              <h3 style={{ color: '#1e1b4b', margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>Thông Tin Banner Trang Liên Hệ</h3>
              <div className="admin-grid-auto">
                <div><label style={labelStyle}>Tiêu đề trang</label><input type="text" value={formData.contactTitle || ''} onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })} style={inputStyle} placeholder="Ví dụ: Liên Hệ Trực Tiếp" /></div>
                <div><label style={labelStyle}>Tiêu đề phụ (Subtitle)</label><input type="text" value={formData.contactSubtitle || ''} onChange={(e) => setFormData({ ...formData, contactSubtitle: e.target.value })} style={inputStyle} placeholder="Để lại thông tin kết nối..." /></div>
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', border: '1px solid #cbd5e1', borderRadius: '12px', background: '#fff' }}>
                <label style={labelStyle}>Ảnh Bìa (Cover Dài)</label>
                {formData.contactCoverUrl && <img src={formData.contactCoverUrl} alt="cover" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }} />}
                <label style={{ ...inputStyle, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#f8fafc', fontWeight: 600 }}><FiUploadCloud /> Tải nền lên <input type="file" accept="image/*" onChange={(e) => handleSingleFileUpload(e, 'contactCoverUrl')} style={{ display: 'none' }} /></label>
              </div>
            </div>

            <div className="admin-card">
              <h3 style={{ margin: '0 0 2rem 0', color: '#1e1b4b', fontSize: '1.4rem' }}>Cấu Hình Thông Tin Hệ Thống</h3>
              <div className="admin-grid-auto" style={{ marginBottom: '2rem' }}>
                <div><label style={labelStyle}>Email liên hệ</label><input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Số điện thoại</label><input type="text" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
                <div><label style={labelStyle}>Địa chỉ hành chính</label><input type="text" value={formData.address || ''} onChange={(e) => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <label style={labelStyle}>Mô tả Footer Bio</label>
                <RichTextEditor value={formData.footerBio || ''} onChange={(val) => setFormData({ ...formData, footerBio: val })} />
              </div>

              <div className="admin-grid-auto" style={{ padding: '1.5rem', backgroundColor: '#f1f5f9', borderRadius: '12px' }}>
                <div><label style={labelStyle}><FiGithub /> GitHub Profile URL</label><input type="text" value={formData.social?.github || ''} onChange={(e) => setFormData({ ...formData, social: { ...formData.social, github: e.target.value } })} style={inputStyle} /></div>
                <div><label style={labelStyle}><FiGlobe /> LinkedIn Profile URL</label><input type="text" value={formData.social?.linkedin || ''} onChange={(e) => setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })} style={inputStyle} /></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        open={showConfirm}
        title="Dữ liệu chưa được lưu!"
        message="Hệ thống phát hiện bạn có thay đổi trên trang này nhưng chưa bấm nút lưu. Nếu rời sang trang khác ngay bây giờ, các chỉnh sửa của bạn sẽ bị hủy bỏ hoàn toàn."
        onConfirm={confirmTabChange}
        onCancel={() => setShowConfirm(false)}
        confirmText="Có, hủy bỏ chỉnh sửa"
        cancelText="Ở lại để lưu"
      />

      {projectModalConfig.open && <ProjectModal mode={projectModalConfig.mode} initialData={projectModalConfig.data} onClose={() => setProjectModalConfig({ ...projectModalConfig, open: false })} onSave={handleSaveProjectFromModal} setNotification={setModal} />}
      {blogModalConfig.open && <BlogModal mode={blogModalConfig.mode} initialData={blogModalConfig.data} categories={formData.categories || ['Chung']} onClose={() => setBlogModalConfig({ ...blogModalConfig, open: false })} onSave={handleSaveBlogFromModal} setNotification={setModal} />}

      <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );
}