import React, { useEffect, useState, useRef } from 'react';
import '../styles/pages.css';
import {
  FiLock, FiLogOut, FiSave, FiHome, FiUser,
  FiFolder, FiFileText, FiGlobe, FiPlus, FiTrash2, FiUploadCloud,
  FiEye, FiEyeOff, FiStar, FiArrowUp, FiArrowDown, FiImage, FiEdit3, FiEdit, FiFolderPlus, FiX,
  FiBriefcase, FiTrendingUp, FiUsers, FiZap, FiGithub,
  FiTarget, FiAward, FiClock, FiActivity, FiMonitor, FiSmartphone,
  FiDatabase, FiCloud, FiHeart, FiSmile, FiMessageCircle, FiThumbsUp,
  FiCheckCircle, FiCoffee, FiTool, FiShield, FiMenu,
  FiCode, FiLayers, FiSearch, FiBarChart2, FiPieChart, FiBookOpen, FiSend,
  FiMapPin, FiMail, FiLinkedin, FiChevronRight,
} from 'react-icons/fi';
import { getPageContent, upsertPageContent, uploadFileToStorage, supabase } from '../utils/supabaseClient';
import NotificationModal from '../components/NotificationModal';
import ProjectModal from '../components/ProjectModal';
import BlogModal from '../components/BlogModal';
import RichTextEditor from '../components/RichTextEditor';
import ConfirmModal from '../components/ConfirmModal';
import useUnsavedChangesWarning from '../hooks/useUnsavedChangesWarning';

/* ─────────────────────────────────────────
   ICON REGISTRY
───────────────────────────────────────── */
const ALL_ICONS = [
  { key: 'briefcase',  label: 'Công việc',    C: FiBriefcase },
  { key: 'trending',   label: 'Tăng trưởng',  C: FiTrendingUp },
  { key: 'users',      label: 'Nhóm người',   C: FiUsers },
  { key: 'zap',        label: 'Tốc độ',       C: FiZap },
  { key: 'target',     label: 'Mục tiêu',     C: FiTarget },
  { key: 'award',      label: 'Giải thưởng',  C: FiAward },
  { key: 'clock',      label: 'Thời gian',    C: FiClock },
  { key: 'activity',   label: 'Hoạt động',    C: FiActivity },
  { key: 'monitor',    label: 'Máy tính',     C: FiMonitor },
  { key: 'smartphone', label: 'Điện thoại',   C: FiSmartphone },
  { key: 'globe',      label: 'Toàn cầu',     C: FiGlobe },
  { key: 'database',   label: 'Dữ liệu',      C: FiDatabase },
  { key: 'cloud',      label: 'Cloud',        C: FiCloud },
  { key: 'heart',      label: 'Yêu thích',    C: FiHeart },
  { key: 'smile',      label: 'Hài lòng',     C: FiSmile },
  { key: 'message',    label: 'Tin nhắn',     C: FiMessageCircle },
  { key: 'thumbsup',   label: 'Like',         C: FiThumbsUp },
  { key: 'check',      label: 'Thành công',   C: FiCheckCircle },
  { key: 'star',       label: 'Đánh giá',     C: FiStar },
  { key: 'coffee',     label: 'Sáng tạo',     C: FiCoffee },
  { key: 'tool',       label: 'Công cụ',      C: FiTool },
  { key: 'shield',     label: 'Bảo mật',      C: FiShield },
  { key: 'code',       label: 'Lập trình',    C: FiCode },
  { key: 'layers',     label: 'Lớp / Stack',  C: FiLayers },
  { key: 'edit',       label: 'Soạn thảo',    C: FiEdit3 },
  { key: 'file',       label: 'Tài liệu',     C: FiFileText },
  { key: 'search',     label: 'Tìm kiếm',     C: FiSearch },
  { key: 'barchart',   label: 'Biểu đồ cột',  C: FiBarChart2 },
  { key: 'piechart',   label: 'Biểu đồ tròn', C: FiPieChart },
  { key: 'book',       label: 'Học tập',      C: FiBookOpen },
  { key: 'send',       label: 'Gửi đi',       C: FiSend },
  { key: 'mappin',     label: 'Vị trí',       C: FiMapPin },
  { key: 'mail',       label: 'Email',        C: FiMail },
  { key: 'linkedin',   label: 'LinkedIn',     C: FiLinkedin },
  { key: 'github',     label: 'GitHub',       C: FiGithub },
  { key: 'folder',     label: 'Thư mục',      C: FiFolderPlus },
];

function DynIcon({ iconKey, size = 16, color }) {
  const found = ALL_ICONS.find(i => i.key === iconKey);
  const Comp = found ? found.C : FiZap;
  return <Comp size={size} color={color} />;
}

/* ─────────────────────────────────────────
   ICON PICKER POPUP
───────────────────────────────────────── */
function IconPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const filtered = query
    ? ALL_ICONS.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || i.key.includes(query.toLowerCase()))
    : ALL_ICONS;

  const CurrentIcon = (ALL_ICONS.find(i => i.key === value) || ALL_ICONS[0]).C;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={ref}>
      <button type="button" onClick={() => setOpen(v => !v)} title="Chọn icon"
        style={{ width: 44, height: 44, border: '1.5px solid #cbd5e1', borderRadius: 10, background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1', transition: 'all 0.2s' }}
        onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
        onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
      >
        <CurrentIcon size={20} />
      </button>
      {open && (
        <div style={{ position: 'absolute', top: '110%', left: 0, zIndex: 9999, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, boxShadow: '0 16px 40px rgba(15,23,42,0.14)', width: 280, padding: '0.75rem' }}>
          <input autoFocus type="text" placeholder="Tìm icon..." value={query} onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.85rem', marginBottom: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
            {filtered.map(ic => (
              <button key={ic.key} type="button" title={ic.label}
                onClick={() => { onChange(ic.key); setOpen(false); setQuery(''); }}
                style={{ width: 38, height: 38, border: value === ic.key ? '2px solid #6366f1' : '1px solid #f1f5f9', borderRadius: 8, background: value === ic.key ? '#eef2ff' : '#fafafa', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: value === ic.key ? '#6366f1' : '#475569', transition: 'all 0.15s' }}
                onMouseOver={e => { e.currentTarget.style.background = '#eef2ff'; e.currentTarget.style.color = '#6366f1'; }}
                onMouseOut={e => { e.currentTarget.style.background = value === ic.key ? '#eef2ff' : '#fafafa'; e.currentTarget.style.color = value === ic.key ? '#6366f1' : '#475569'; }}
              >
                <ic.C size={16} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SLUG GENERATOR
───────────────────────────────────────── */
const generateUniqueSlug = (title, existingItems, currentId) => {
  let baseSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!baseSlug) baseSlug = `item-${currentId}`;
  let finalSlug = baseSlug;
  let counter = 1;
  const isDuplicate = (s) => existingItems.some(item => item.id !== currentId && item.slug === s);
  while (isDuplicate(finalSlug)) { finalSlug = `${baseSlug}-${counter}`; counter++; }
  return finalSlug;
};

/* ─────────────────────────────────────────
   SIDEBAR NAV CONFIG
───────────────────────────────────────── */
const NAV_TABS = [
  { id: 'home',     label: 'Trang Chủ',        icon: FiHome,     color: '#6366f1' },
  { id: 'about',    label: 'Giới Thiệu',        icon: FiUser,     color: '#8b5cf6' },
  { id: 'projects', label: 'Hồ Sơ Dự Án',      icon: FiFolder,   color: '#3b82f6' },
  { id: 'blog',     label: 'Bài Viết (Blog)',   icon: FiEdit3,    color: '#10b981' },
  { id: 'resume',   label: 'Hồ Sơ CV',          icon: FiFileText, color: '#f59e0b' },
  { id: 'global',   label: 'Cấu Hình Liên Hệ', icon: FiGlobe,    color: '#64748b' },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export default function Private() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

  const [isDirty, setIsDirty, checkUnsavedChanges] = useUnsavedChangesWarning();
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isInitialLoading = useRef(false);

  const [projectModalConfig, setProjectModalConfig] = useState({ open: false, mode: 'add', index: null, data: {} });
  const [blogModalConfig, setBlogModalConfig] = useState({ open: false, mode: 'add', index: null, data: {} });
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [allProjects, setAllProjects] = useState([]);

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || '';

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) setIsAuthenticated(ADMIN_EMAIL ? (data.session.user.email === ADMIN_EMAIL) : true);
    })();
  }, [ADMIN_EMAIL]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setLoading(true);
      isInitialLoading.current = true;
      const data = await getPageContent(activeTab);
      setFormData(data || {});
      setLoading(false);
      setTimeout(() => { isInitialLoading.current = false; setIsDirty(false); }, 100);
    })();
  }, [isAuthenticated, activeTab, setIsDirty]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const pd = await getPageContent('projects');
      if (pd?.projects) setAllProjects(pd.projects.filter(p => !p.isHidden));
    })();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isInitialLoading.current && Object.keys(formData).length > 0) setIsDirty(true);
  }, [formData, setIsDirty]);

  const requestTabChange = (tabId) => {
    if (tabId === activeTab) { setSidebarOpen(false); return; }
    if (isDirty) {
      setPendingAction(() => () => { setActiveTab(tabId); setIsDirty(false); setSidebarOpen(false); });
      setShowConfirm(true);
    } else { setActiveTab(tabId); setSidebarOpen(false); }
  };

  const confirmTabChange = () => { if (pendingAction) pendingAction(); setShowConfirm(false); };

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
    else { setModal({ open: true, type: 'success', title: 'Đã lưu!', message: 'Dữ liệu đã được đồng bộ lên website.' }); setIsDirty(false); }
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
    if (!res.error) setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), res.url] }));
  };

  const removeGalleryImage = (index) => setFormData(p => ({ ...p, gallery: p.gallery.filter((_, i) => i !== index) }));

  const moveItem = (type, index, direction) => {
    const key = type === 'project' ? 'projects' : 'posts';
    const list = [...(formData[key] || [])];
    const tgt = direction === 'up' ? index - 1 : index + 1;
    if (tgt < 0 || tgt >= list.length) return;
    [list[index], list[tgt]] = [list[tgt], list[index]];
    setFormData({ ...formData, [key]: list });
  };

  const deleteItem = (type, index) => {
    const key = type === 'project' ? 'projects' : 'posts';
    setFormData({ ...formData, [key]: (formData[key] || []).filter((_, i) => i !== index) });
  };

  const toggleStatus = (type, index, field) => {
    const key = type === 'project' ? 'projects' : 'posts';
    const list = [...(formData[key] || [])];
    list[index] = { ...list[index], [field]: !list[index][field] };
    setFormData({ ...formData, [key]: list });
  };

  const openProjectForm = (mode, index = null) => {
    if (mode === 'add') setProjectModalConfig({ open: true, mode: 'add', index: null, data: { id: Date.now(), title: '', slug: '', duration: '', demoUrl: '', description: '', isHidden: false, isPinned: false, technologies: [], sections: [], category: '', metric: '', client: '' } });
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
    const cats = formData.categories || ['Chung', 'Nghiệp vụ BA'];
    if (mode === 'add') setBlogModalConfig({ open: true, mode: 'add', index: null, data: { id: Date.now(), title: '', slug: '', category: cats[0], excerpt: '', content: '', date: new Date().toLocaleDateString('vi-VN'), isHidden: false, isPinned: false, isDraft: false, coverImage: '' } });
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
    const cats = formData.categories || ['Chung'];
    if (cats.includes(trimmed)) return;
    setFormData({ ...formData, categories: [...cats, trimmed] });
    setNewCategoryInput('');
  };
  const handleRemoveCategory = (cat) => setFormData({ ...formData, categories: (formData.categories || []).filter(c => c !== cat) });

  const addSkill = () => setFormData({ ...formData, skills: [...(formData.skills || []), { title: '', items: [], showOnHome: false, icon: 'tool', badgeColor: '#6366f1' }] });
  const updateSkill = (idx, field, value) => {
    const updated = [...(formData.skills || [])];
    updated[idx] = { ...updated[idx], [field]: field === 'items' ? value.split(',').map(s => s.trim()).filter(Boolean) : value };
    setFormData({ ...formData, skills: updated });
  };
  const removeSkill = (idx) => setFormData({ ...formData, skills: (formData.skills || []).filter((_, i) => i !== idx) });

  const togglePinnedProject = (projectId) => {
    const current = formData.pinnedProjectIds || [];
    const exists = current.includes(projectId);
    setFormData({ ...formData, pinnedProjectIds: exists ? current.filter(id => id !== projectId) : [...current, projectId] });
  };

  const addAchievement = () => setFormData({ ...formData, achievements: [...(formData.achievements || []), { title: '', desc: '', icon: 'award', color: '#eff6ff', iconColor: '#2563eb' }] });
  const updateAchievement = (idx, field, value) => {
    const arr = [...(formData.achievements || [])];
    arr[idx] = { ...arr[idx], [field]: value };
    setFormData({ ...formData, achievements: arr });
  };
  const removeAchievement = (idx) => setFormData({ ...formData, achievements: (formData.achievements || []).filter((_, i) => i !== idx) });

  /* ── Styles ── */
  const inputStyle = { width: '100%', padding: '0.75rem 0.875rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', backgroundColor: '#fff', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', fontFamily: 'inherit' };
  const labelStyle = { fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.4rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.4px' };
  const currentStatsCount = (formData.stats || []).length;

  /* ────────── ACTIVE TAB META ────────── */
  const activeTabMeta = NAV_TABS.find(t => t.id === activeTab) || NAV_TABS[0];

  /* ════════ LOGIN SCREEN ════════ */
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', backgroundColor: '#f1f5f9' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: '20px', backgroundColor: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '14px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <FiLock size={24} color="#6366f1" />
            </div>
            <h2 style={{ margin: 0, color: '#1e1b4b', fontSize: '1.4rem', fontWeight: 800 }}>Khu Vực Quản Trị</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem' }}>Đăng nhập để quản lý nội dung</p>
          </div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Email đăng nhập</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required placeholder="admin@example.com"
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <div>
              <label style={labelStyle}>Mật khẩu</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required placeholder="••••••••"
                onFocus={e => e.target.style.borderColor = '#6366f1'} onBlur={e => e.target.style.borderColor = '#e2e8f0'} />
            </div>
            <button type="submit" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              Đăng Nhập
            </button>
          </form>
        </div>
        <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
      </div>
    );
  }

  /* ════════ ADMIN LAYOUT ════════ */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'flex-start', backgroundColor: '#f1f5f9', position: 'relative' }}>
      <style>{`
        /* ── Sidebar ── */
        .adm-sidebar {
          width: 252px;
          flex-shrink: 0;
          background: linear-gradient(175deg, #1e1b4b 0%, #312e81 100%);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 200;
          transition: transform 0.3s cubic-bezier(0.16,1,0.3,1);
          position: sticky;
          top: 0;
          height: 100vh;
        }
        .adm-sidebar-inner {
          flex: 1;
          overflow-y: auto;
          padding: 0 0.875rem;
          scrollbar-width: none;
        }
        .adm-sidebar-inner::-webkit-scrollbar { display: none; }

        /* ── Main scroll area ── */
        .adm-main {
          flex: 1;
          min-width: 0;
        }

        /* ── Cards ── */
        .admin-card {
          padding: 1.75rem;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
        }
        .admin-card h3 {
          margin: 0 0 1.25rem 0;
          color: #1e1b4b;
          font-size: 1.1rem;
          font-weight: 800;
        }
        .admin-grid-auto {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
          gap: 1.25rem;
        }
        .admin-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.125rem 1.25rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #fff;
          gap: 1rem;
        }
        .admin-list-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .adm-nav-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 0.75rem 0.875rem;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-weight: 500;
          font-size: 0.9rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.18s;
          position: relative;
        }
        .adm-nav-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
        .adm-nav-btn.active { background: rgba(255,255,255,0.14); color: #fff; font-weight: 700; }
        .adm-nav-btn.active::before {
          content: '';
          position: absolute;
          left: 0; top: 25%; bottom: 25%;
          width: 3px;
          border-radius: 0 2px 2px 0;
          background: #818cf8;
        }
        .adm-save-btn {
          width: 100%;
          padding: 0.875rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: none;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .adm-input-focus:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .adm-overlay { display: none; }
        @media (max-width: 900px) {
          .adm-sidebar {
            position: fixed;
            top: 0; bottom: 0; left: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 24px rgba(0,0,0,0.18);
          }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-overlay.open { display: block; position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(2px); z-index: 199; }
          .admin-card { padding: 1.25rem; }
          .admin-list-item { flex-direction: column; align-items: flex-start; }
          .admin-list-actions { width: 100%; overflow-x: auto; padding-bottom: 4px; }
        }
        @media (max-width: 640px) {
          .admin-grid-auto { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* ── Overlay mobile ── */}
      <div className={`adm-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ══════════════════════════════════
          SIDEBAR — STICKY, KHÔNG CUỘN
      ══════════════════════════════════ */}
      <aside className={`adm-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ color: '#818cf8', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Portfolio CMS</div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1rem', marginTop: '2px' }}>Admin Panel</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'none' }} className="close-sidebar-btn">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav items */}
        <div className="adm-sidebar-inner" style={{ flex: 1 }}>
          <div style={{ fontSize: '0.68rem', color: '#4f46e5', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', padding: '0.75rem 0.5rem 0.5rem' }}>
            Nội dung
          </div>
          {NAV_TABS.map(tab => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} className={`adm-nav-btn ${isActive ? 'active' : ''}`} onClick={() => requestTabChange(tab.id)}>
                <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: isActive ? tab.color : 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                  <TabIcon size={15} color={isActive ? '#fff' : '#94a3b8'} />
                </div>
                <span style={{ flex: 1 }}>{tab.label}</span>
                {isActive && <FiChevronRight size={14} color="#818cf8" />}
              </button>
            );
          })}
        </div>

        {/* Bottom: Save + Logout */}
        <div style={{ padding: '1rem 0.875rem', borderTop: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
          {/* Unsaved indicator */}
          {isDirty && (
            <div style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700, textAlign: 'center', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#fbbf24', animation: 'pulse 1.5s infinite' }} />
              Có thay đổi chưa lưu
            </div>
          )}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>

          {/* Nút Lưu */}
          <button
            className="adm-save-btn"
            onClick={handleSaveContent}
            disabled={loading}
            style={{
              backgroundColor: isDirty ? '#10b981' : 'rgba(255,255,255,0.1)',
              color: isDirty ? '#fff' : '#64748b',
              boxShadow: isDirty ? '0 4px 14px rgba(16,185,129,0.35)' : 'none',
              marginBottom: '0.625rem',
            }}
          >
            <FiSave size={16} />
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>

          {/* Logout */}
          <button
            onClick={() => supabase.auth.signOut().then(() => setIsAuthenticated(false))}
            style={{ width: '100%', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            <FiLogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════ */}
      <div className="adm-main">
        {/* ── Top bar ── */}
        <div style={{ position: 'sticky', top: '70px', zIndex: 999, backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '0.875rem 1.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Mobile menu toggle */}
          <button onClick={() => setSidebarOpen(true)} style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: '#1e1b4b', padding: '4px' }} className="adm-menu-toggle">
            <FiMenu size={22} />
          </button>
          <style>{`.adm-menu-toggle { display: flex !important; } @media(min-width:901px){ .adm-menu-toggle { display: none !important; } } .close-sidebar-btn { display: none !important; } @media(max-width:900px){ .close-sidebar-btn { display: flex !important; } }`}</style>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: activeTabMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <activeTabMeta.icon size={16} color="#fff" />
            </div>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, color: '#1e1b4b', fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)', fontWeight: 800, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeTabMeta.label}
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', marginTop: '1px' }}>
                {isDirty ? <span style={{ color: '#f59e0b', fontWeight: 700 }}>● Chưa lưu</span> : <span style={{ color: '#10b981' }}>✓ Đã đồng bộ</span>}
              </p>
            </div>
          </div>

          {/* Quick save on topbar (visible on mobile) */}
          <button onClick={handleSaveContent} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.5rem 1rem', backgroundColor: isDirty ? '#10b981' : '#e2e8f0', color: isDirty ? '#fff' : '#94a3b8', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}>
            <FiSave size={14} /> {loading ? 'Lưu...' : 'Lưu'}
          </button>
        </div>

        {/* ── Tab content ── */}
        <div style={{ padding: 'clamp(1.25rem, 3vw, 2rem) clamp(1rem, 3vw, 1.75rem)', maxWidth: '1000px' }}>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', color: '#94a3b8', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              Đang tải dữ liệu...
            </div>
          )}

          {/* ════════════════════════════════
              TAB HOME
          ════════════════════════════════ */}
          {!loading && activeTab === 'home' && (
            <div>
              {/* 1. Banner chính */}
              <div className="admin-card">
                <h3>Nội Dung Banner Chính</h3>
                <div className="admin-grid-auto">
                  <div>
                    <label style={labelStyle}>Tiêu đề chính</label>
                    <input className="adm-input-focus" style={inputStyle} type="text" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="VD: Xin Chào! Tôi là Quyên" />
                  </div>
                  <div>
                    <label style={labelStyle}>Tagline nghề nghiệp</label>
                    <input className="adm-input-focus" style={inputStyle} type="text" value={formData.tagline || ''} onChange={e => setFormData({ ...formData, tagline: e.target.value })} placeholder="VD: Business Analyst · Web Developer" />
                  </div>
                  <div>
                    <label style={labelStyle}>Vị trí địa lý</label>
                    <input className="adm-input-focus" style={inputStyle} type="text" value={formData.location || ''} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="VD: Ho Chi Minh City, Vietnam" />
                  </div>
                  <div>
                    <label style={labelStyle}>Target Roles</label>
                    <input className="adm-input-focus" style={inputStyle} type="text" value={formData.targetRoles || ''} onChange={e => setFormData({ ...formData, targetRoles: e.target.value })} placeholder="VD: FINTECH & HEALTHCARE" />
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1.25rem', alignItems: 'center', padding: '1rem 1.25rem', backgroundColor: '#eef2ff', borderRadius: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.openToWork !== false} onChange={e => setFormData({ ...formData, openToWork: e.target.checked })} style={{ width: 18, height: 18, accentColor: '#6366f1', cursor: 'pointer' }} />
                    <span style={{ fontWeight: 700, color: '#4338ca', fontSize: '0.875rem' }}>Hiển thị badge "Open to Work"</span>
                  </label>
                  <input className="adm-input-focus" style={{ ...inputStyle, flex: 1, minWidth: '200px', backgroundColor: '#f5f3ff' }} type="text" value={formData.badgeText || ''} onChange={e => setFormData({ ...formData, badgeText: e.target.value })} placeholder="VD: Available for Remote Projects" />
                </div>
                <div style={{ marginTop: '1.25rem' }}>
                  <label style={labelStyle}>Đoạn giới thiệu ngắn</label>
                  <RichTextEditor value={formData.intro || ''} onChange={val => setFormData({ ...formData, intro: val })} />
                </div>
              </div>

              {/* 2. Hình ảnh */}
              <div className="admin-card">
                <h3>Tài Nguyên Hình Ảnh</h3>
                <div className="admin-grid-auto">
                  <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                    <label style={labelStyle}>Ảnh Nền Banner</label>
                    {formData.bannerUrl && <img src={formData.bannerUrl} alt="banner" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.875rem' }} />}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                      <FiUploadCloud size={16} color="#6366f1" /> Tải nền lên
                      <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'bannerUrl')} style={{ display: 'none' }} />
                    </label>
                  </div>
                  <div style={{ padding: '1.25rem', border: '2px dashed #818cf8', borderRadius: '12px', backgroundColor: '#eef2ff' }}>
                    <label style={labelStyle}>Ảnh Chân Dung PNG (không nền)</label>
                    <p style={{ fontSize: '0.78rem', color: '#6366f1', marginBottom: '0.75rem', lineHeight: 1.5 }}>PNG trong suốt — overflow ra ngoài banner trên desktop, thu nhỏ thành avatar tròn trên mobile.</p>
                    {formData.avatarUrl && <img src={formData.avatarUrl} alt="avatar" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', marginBottom: '0.75rem', display: 'block' }} />}
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>
                      <FiUploadCloud size={16} /> Tải ảnh PNG
                      <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'avatarUrl')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* 3. Stats */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Chỉ Số Nổi Bật (Stats)</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '3px 0 0' }}>Tối đa 4 chỉ số ({currentStatsCount}/4)</p>
                  </div>
                  <button disabled={currentStatsCount >= 4}
                    onClick={() => setFormData({ ...formData, stats: [...(formData.stats || []), { icon: 'briefcase', value: 10, suffix: '+', label: 'Dự án' }] })}
                    style={{ padding: '0.5rem 1rem', backgroundColor: currentStatsCount >= 4 ? '#e2e8f0' : '#6366f1', color: currentStatsCount >= 4 ? '#94a3b8' : '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: currentStatsCount >= 4 ? 'not-allowed' : 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(formData.stats || []).map((stat, idx) => (
                    <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Icon</label>
                        <IconPicker value={stat.icon || 'briefcase'} onChange={key => { const s = [...formData.stats]; s[idx] = { ...s[idx], icon: key }; setFormData({ ...formData, stats: s }); }} />
                      </div>
                      <div style={{ flex: '1 1 140px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Nhãn</label>
                        <input className="adm-input-focus" style={inputStyle} type="text" value={stat.label} onChange={e => { const s = [...formData.stats]; s[idx] = { ...s[idx], label: e.target.value }; setFormData({ ...formData, stats: s }); }} />
                      </div>
                      <div style={{ flex: '0 1 80px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Số</label>
                        <input className="adm-input-focus" style={inputStyle} type="number" value={stat.value} onChange={e => { const s = [...formData.stats]; s[idx] = { ...s[idx], value: Number(e.target.value) }; setFormData({ ...formData, stats: s }); }} />
                      </div>
                      <div style={{ flex: '0 1 70px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Hậu tố</label>
                        <input className="adm-input-focus" style={inputStyle} type="text" value={stat.suffix} onChange={e => { const s = [...formData.stats]; s[idx] = { ...s[idx], suffix: e.target.value }; setFormData({ ...formData, stats: s }); }} placeholder="+" />
                      </div>
                      <button onClick={() => setFormData({ ...formData, stats: formData.stats.filter((_, i) => i !== idx) })}
                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {(formData.stats || []).length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem' }}>Chưa có chỉ số. Nhấn "Thêm" để bắt đầu.</p>}
                </div>
              </div>

              {/* 4. Pinned Projects */}
              <div className="admin-card">
                <h3>Dự Án Ghim Lên Trang Chủ</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem', marginTop: '-0.75rem' }}>Chọn tối đa 3 dự án. Chưa chọn → hệ thống dùng dự án có cờ ⭐ từ tab Dự Án.</p>
                {allProjects.length === 0
                  ? <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Chưa có dự án — hãy thêm ở tab Hồ Sơ Dự Án trước.</p>
                  : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {allProjects.map(proj => {
                        const selected = (formData.pinnedProjectIds || []).includes(proj.id);
                        const disabled = !selected && (formData.pinnedProjectIds || []).length >= 3;
                        return (
                          <label key={proj.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.875rem 1rem', borderRadius: '10px', cursor: disabled ? 'not-allowed' : 'pointer', border: selected ? '1.5px solid #6366f1' : '1px solid #e2e8f0', background: selected ? '#eef2ff' : '#fff', opacity: disabled ? 0.5 : 1, transition: 'all 0.15s' }}>
                            <input type="checkbox" checked={selected} disabled={disabled} onChange={() => togglePinnedProject(proj.id)} style={{ width: 17, height: 17, cursor: disabled ? 'not-allowed' : 'pointer', accentColor: '#6366f1' }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{proj.title}</div>
                              {proj.category && <div style={{ fontSize: '0.75rem', color: '#6366f1', fontWeight: 600, marginTop: '1px' }}>{proj.category}</div>}
                            </div>
                            {proj.metric && <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700, backgroundColor: '#f0fdf4', padding: '0.2rem 0.6rem', borderRadius: '6px', flexShrink: 0 }}>{proj.metric}</span>}
                          </label>
                        );
                      })}
                    </div>
                  )
                }
              </div>

              {/* 5. Achievements */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Thành Tựu Nổi Bật (Trang Chủ)</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '3px 0 0' }}>4 thẻ thành tích ngắn. Khác với Chứng chỉ ở tab Giới Thiệu.</p>
                  </div>
                  <button onClick={addAchievement} style={{ padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(formData.achievements || []).map((ach, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', position: 'relative' }}>
                      <button onClick={() => removeAchievement(idx)} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', paddingRight: '2rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Icon</label>
                          <IconPicker value={ach.icon || 'award'} onChange={key => updateAchievement(idx, 'icon', key)} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Màu nền</label>
                          <input type="color" value={ach.color || '#eff6ff'} onChange={e => updateAchievement(idx, 'color', e.target.value)} style={{ width: 44, height: 44, border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', padding: '2px' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Màu icon</label>
                          <input type="color" value={ach.iconColor || '#2563eb'} onChange={e => updateAchievement(idx, 'iconColor', e.target.value)} style={{ width: 44, height: 44, border: '1px solid #e2e8f0', borderRadius: 10, cursor: 'pointer', padding: '2px' }} />
                        </div>
                        <div style={{ flex: '1 1 180px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Tiêu đề</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={ach.title} onChange={e => updateAchievement(idx, 'title', e.target.value)} placeholder="VD: Top Intern of the Quarter" />
                        </div>
                        <div style={{ flex: '2 1 250px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Mô tả ngắn</label>
                          <textarea rows={2} value={ach.desc} onChange={e => updateAchievement(idx, 'desc', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="VD: Recognition for delivering a project..." />
                        </div>
                      </div>
                    </div>
                  ))}
                  {(formData.achievements || []).length === 0 && <p style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.875rem', backgroundColor: '#fff', borderRadius: '10px', border: '1px dashed #e2e8f0' }}>Chưa có thành tựu. Nhấn "Thêm" để bắt đầu.</p>}
                </div>
              </div>

              {/* 6. BA Toolkit note */}
              <div className="admin-card" style={{ borderLeft: '4px solid #6366f1', backgroundColor: '#eef2ff' }}>
                <h3 style={{ color: '#4338ca' }}>BA Toolkit — Lấy từ Tab Giới Thiệu</h3>
                <p style={{ color: '#4338ca', fontSize: '0.875rem', lineHeight: 1.7, margin: 0 }}>
                  Section "The BA Toolkit" trên trang chủ tự động lấy từ <strong>Tab Giới Thiệu → Kỹ Năng</strong>. Vào tab đó và bật <strong>"Hiển thị trên Trang Chủ"</strong>.
                </p>
              </div>

              {/* 7. Highlighted skills fallback */}
              <div className="admin-card">
                <h3>Thẻ Kỹ Năng Nhanh (Fallback)</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>Chỉ hiển thị nếu chưa có nhóm kỹ năng nào bật "Hiển thị trên Trang Chủ". Phân cách bằng dấu phẩy.</p>
                <textarea rows={3} defaultValue={(formData.highlightedSkills || []).join(', ')} onBlur={e => setFormData({ ...formData, highlightedSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="VD: Requirements Elicitation, BPMN / UML, SQL..." style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>

              {/* 8. Gallery */}
              <div className="admin-card">
                <h3>Thư Viện Hình Ảnh (Gallery)</h3>
                <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '1.25rem', background: '#10b981', color: '#fff', padding: '0.6rem 1.125rem', borderRadius: '8px', fontWeight: 700, fontSize: '0.875rem' }}>
                  <FiPlus size={14} /> Thêm ảnh
                  <input type="file" accept="image/*" onChange={handleGalleryUpload} style={{ display: 'none' }} />
                </label>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {(formData.gallery || []).map((imgUrl, idx) => (
                    <div key={idx} style={{ position: 'relative', width: '100px', height: '100px' }}>
                      <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e2e8f0' }} />
                      <button onClick={() => removeGalleryImage(idx)} style={{ position: 'absolute', top: '-7px', right: '-7px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  {(formData.gallery || []).length === 0 && <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Chưa có ảnh.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              TAB ABOUT
          ════════════════════════════════ */}
          {!loading && activeTab === 'about' && (
            <div>
              {/* Banner */}
              <div className="admin-card">
                <h3>Banner Trang Giới Thiệu</h3>
                <div className="admin-grid-auto">
                  <div>
                    <label style={labelStyle}>Tiêu đề trang</label>
                    <input className="adm-input-focus" style={inputStyle} type="text" value={formData.pageTitle || ''} onChange={e => setFormData({ ...formData, pageTitle: e.target.value })} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tiêu đề phụ</label>
                    <input className="adm-input-focus" style={inputStyle} type="text" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginTop: '1.25rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <label style={labelStyle}>Ảnh Bìa</label>
                  {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.875rem' }} />}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                    <FiUploadCloud size={16} color="#6366f1" /> Tải nền lên
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Hero intro */}
              <div className="admin-card">
                <h3>Hero Intro (Split Layout)</h3>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Đoạn giới thiệu</label>
                  <RichTextEditor value={formData.bio || ''} onChange={val => setFormData({ ...formData, bio: val })} />
                </div>
                <div style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <label style={labelStyle}>Ảnh Chân Dung (About)</label>
                  {formData.aboutAvatarUrl && <img src={formData.aboutAvatarUrl} alt="about" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', marginBottom: '0.75rem', display: 'block' }} />}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.65rem 1rem', backgroundColor: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: '0.85rem', width: 'fit-content' }}>
                    <FiUploadCloud size={15} /> Tải ảnh lên
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'aboutAvatarUrl')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Experiences */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Kinh Nghiệm Làm Việc (Timeline)</h3>
                  <button onClick={() => setFormData({ ...formData, experiences: [...(formData.experiences || []), { title: '', company: '', date: '', description: '' }] })}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {(formData.experiences || []).map((exp, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '1.125rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <button onClick={() => setFormData({ ...formData, experiences: (formData.experiences || []).filter((_, i) => i !== idx) })}
                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                      <div className="admin-grid-auto" style={{ paddingRight: '2rem', marginBottom: '0.875rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Chức vụ</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={exp.title} onChange={e => { const arr = [...(formData.experiences || [])]; arr[idx] = { ...arr[idx], title: e.target.value }; setFormData({ ...formData, experiences: arr }); }} placeholder="VD: Business Analyst Intern" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Công ty</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={exp.company} onChange={e => { const arr = [...(formData.experiences || [])]; arr[idx] = { ...arr[idx], company: e.target.value }; setFormData({ ...formData, experiences: arr }); }} placeholder="Tên công ty" />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Thời gian</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={exp.date} onChange={e => { const arr = [...(formData.experiences || [])]; arr[idx] = { ...arr[idx], date: e.target.value }; setFormData({ ...formData, experiences: arr }); }} placeholder="VD: 2024 – Hiện tại" />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Mô tả công việc</label>
                        <RichTextEditor value={exp.description || ''} onChange={val => { const arr = [...(formData.experiences || [])]; arr[idx] = { ...arr[idx], description: val }; setFormData({ ...formData, experiences: arr }); }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ margin: 0 }}>Kỹ Năng &amp; Công Cụ</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.8rem', margin: '3px 0 0' }}>Bật "Hiển thị trên Trang Chủ" để show ở section BA Toolkit</p>
                  </div>
                  <button onClick={addSkill} style={{ padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm nhóm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {(formData.skills || []).map((skill, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <button onClick={() => removeSkill(idx)} style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', paddingRight: '2rem', marginBottom: '0.75rem' }}>
                        <div style={{ flex: '1 1 160px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Tên nhóm</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={skill.title} onChange={e => updateSkill(idx, 'title', e.target.value)} placeholder="VD: Công cụ BA" />
                        </div>
                        <div style={{ flex: '2 1 260px' }}>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Kỹ năng (phân cách bởi dấu phẩy)</label>
                          <textarea rows={1} defaultValue={Array.isArray(skill.items) ? skill.items.join(', ') : ''} onBlur={e => updateSkill(idx, 'items', e.target.value)} placeholder="Figma, BPMN, SQL..." style={{ ...inputStyle, resize: 'vertical' }} />
                        </div>
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: 'fit-content' }}>
                        <input type="checkbox" checked={skill.showOnHome || false} onChange={e => updateSkill(idx, 'showOnHome', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#6366f1', cursor: 'pointer' }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: skill.showOnHome ? '#4338ca' : '#94a3b8' }}>Hiển thị trên Trang Chủ</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certs */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Chứng Chỉ &amp; Thành Tích (About)</h3>
                  <button onClick={() => setFormData({ ...formData, achievements: [...(formData.achievements || []), { name: '', issuer: '', date: '', url: '', logo: '' }] })}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {(formData.achievements || []).map((ach, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative' }}>
                      <button onClick={() => setFormData({ ...formData, achievements: (formData.achievements || []).filter((_, i) => i !== idx) })}
                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                      <div style={{ flexShrink: 0 }}>
                        {ach.logo ? <img src={ach.logo} alt="logo" style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: '10px', border: '1px solid #e2e8f0' }} /> : <div style={{ width: 56, height: 56, borderRadius: '10px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiAward size={24} color="#6366f1" /></div>}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '6px', padding: '4px 8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                          <FiImage size={11} /> Logo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { if (e.target.files[0]) { const res = await uploadFileToStorage(e.target.files[0], 'assets'); if (!res.error) { const arr = [...(formData.achievements || [])]; arr[idx] = { ...arr[idx], logo: res.url }; setFormData({ ...formData, achievements: arr }); } } }} />
                        </label>
                      </div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.625rem', minWidth: '180px', paddingRight: '2rem' }}>
                        <input className="adm-input-focus" style={inputStyle} type="text" value={ach.name || ''} onChange={e => { const arr = [...(formData.achievements || [])]; arr[idx] = { ...arr[idx], name: e.target.value }; setFormData({ ...formData, achievements: arr }); }} placeholder="Tên chứng chỉ" />
                        <input className="adm-input-focus" style={inputStyle} type="text" value={ach.issuer || ''} onChange={e => { const arr = [...(formData.achievements || [])]; arr[idx] = { ...arr[idx], issuer: e.target.value }; setFormData({ ...formData, achievements: arr }); }} placeholder="Tổ chức cấp (VD: Google, Coursera...)" />
                        <input className="adm-input-focus" style={inputStyle} type="text" value={ach.date || ''} onChange={e => { const arr = [...(formData.achievements || [])]; arr[idx] = { ...arr[idx], date: e.target.value }; setFormData({ ...formData, achievements: arr }); }} placeholder="Thời gian cấp" />
                        <input className="adm-input-focus" style={inputStyle} type="text" value={ach.url || ''} onChange={e => { const arr = [...(formData.achievements || [])]; arr[idx] = { ...arr[idx], url: e.target.value }; setFormData({ ...formData, achievements: arr }); }} placeholder="Link xác thực chứng chỉ" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Học Vấn</h3>
                  <button onClick={() => setFormData({ ...formData, education: [...(formData.education || []), { title: '', company: '', date: '', description: '' }] })}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {(formData.education || []).map((edu, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <button onClick={() => setFormData({ ...formData, education: (formData.education || []).filter((_, i) => i !== idx) })}
                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                      <div className="admin-grid-auto" style={{ paddingRight: '2rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Chuyên ngành</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={edu.title || ''} onChange={e => { const arr = [...(formData.education || [])]; arr[idx] = { ...arr[idx], title: e.target.value }; setFormData({ ...formData, education: arr }); }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Trường / Tổ chức</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={edu.company || ''} onChange={e => { const arr = [...(formData.education || [])]; arr[idx] = { ...arr[idx], company: e.target.value }; setFormData({ ...formData, education: arr }); }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Niên khóa</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={edu.date || ''} onChange={e => { const arr = [...(formData.education || [])]; arr[idx] = { ...arr[idx], date: e.target.value }; setFormData({ ...formData, education: arr }); }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goals & Vision */}
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Mục Tiêu &amp; Định Hướng</h3>
                  <button onClick={() => setFormData({ ...formData, goals: [...(formData.goals || []), { type: 'Ngắn hạn', title: '', desc: '', image: '' }] })}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm mục tiêu
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {(formData.goals || []).map((goal, idx) => (
                    <div key={idx} style={{ background: '#fffbeb', padding: '1.125rem', borderRadius: '12px', border: '1px solid #fde68a', position: 'relative' }}>
                      <button onClick={() => setFormData({ ...formData, goals: (formData.goals || []).filter((_, i) => i !== idx) })}
                        style={{ position: 'absolute', top: '10px', right: '10px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><FiTrash2 size={16} /></button>
                      <div className="admin-grid-auto" style={{ marginBottom: '0.875rem', paddingRight: '2rem' }}>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '3px' }}>Loại mục tiêu</label>
                          <select value={goal.type || 'Ngắn hạn'} onChange={e => { const arr = [...(formData.goals || [])]; arr[idx] = { ...arr[idx], type: e.target.value }; setFormData({ ...formData, goals: arr }); }}
                            style={{ ...inputStyle, cursor: 'pointer', fontWeight: 700 }}>
                            <option>Ngắn hạn</option>
                            <option>Dài hạn</option>
                            <option>Định hướng</option>
                            <option>Giá trị cốt lõi</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '3px' }}>Tiêu đề</label>
                          <input className="adm-input-focus" style={inputStyle} type="text" value={goal.title || ''} onChange={e => { const arr = [...(formData.goals || [])]; arr[idx] = { ...arr[idx], title: e.target.value }; setFormData({ ...formData, goals: arr }); }} placeholder="VD: Trở thành Senior BA trong 2 năm" />
                        </div>
                      </div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', display: 'block', marginBottom: '3px' }}>Mô tả</label>
                        <textarea rows={2} value={goal.desc || ''} onChange={e => { const arr = [...(formData.goals || [])]; arr[idx] = { ...arr[idx], desc: e.target.value }; setFormData({ ...formData, goals: arr }); }} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Mô tả chi tiết..." />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        {goal.image && <img src={goal.image} alt="" style={{ width: '70px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #fde68a' }} />}
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.45rem 0.875rem', backgroundColor: '#fff', border: '1px solid #fde68a', borderRadius: '7px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, color: '#92400e' }}>
                          <FiImage size={13} /> Ảnh minh họa
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => { if (e.target.files[0]) { const res = await uploadFileToStorage(e.target.files[0], 'assets'); if (!res.error) { const arr = [...(formData.goals || [])]; arr[idx] = { ...arr[idx], image: res.url }; setFormData({ ...formData, goals: arr }); } } }} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resume displayMode */}
              <div className="admin-card" style={{ borderLeft: '4px solid #8b5cf6', backgroundColor: '#faf5ff' }}>
                <h3 style={{ color: '#7c3aed' }}>Chế Độ Hiển Thị Resume</h3>
                <select value={formData.displayMode || 'both'} onChange={e => setFormData({ ...formData, displayMode: e.target.value })}
                  style={{ ...inputStyle, fontWeight: 600, color: '#7c3aed', backgroundColor: '#ede9fe', border: 'none' }}>
                  <option value="both">Hiển thị cả Bản PDF và Hồ sơ Động</option>
                  <option value="dynamic_only">Chỉ hiển thị Hồ sơ Động (Ẩn PDF)</option>
                  <option value="pdf_only">Chỉ hiển thị PDF (Ẩn Hồ sơ Web)</option>
                </select>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              TAB PROJECTS
          ════════════════════════════════ */}
          {!loading && activeTab === 'projects' && (
            <div>
              <div className="admin-card">
                <h3>Banner Trang Dự Án</h3>
                <div className="admin-grid-auto">
                  <div><label style={labelStyle}>Tiêu đề trang</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.pageTitle || ''} onChange={e => setFormData({ ...formData, pageTitle: e.target.value })} /></div>
                  <div><label style={labelStyle}>Tiêu đề phụ</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} /></div>
                </div>
                <div style={{ marginTop: '1.25rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <label style={labelStyle}>Ảnh Bìa</label>
                  {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                    <FiUploadCloud size={16} color="#6366f1" /> Tải nền lên
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Quản Lý Dự Án ({(formData.projects || []).length})</h3>
                  <button onClick={() => openProjectForm('add')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.5rem 1.125rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <FiPlus size={14} /> Thêm Dự Án
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(formData.projects || []).map((proj, idx) => (
                    <div key={proj.id} className="admin-list-item" style={{ backgroundColor: proj.isHidden ? '#f8fafc' : '#fff', opacity: proj.isHidden ? 0.7 : 1 }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{proj.title}</span>
                        {proj.category && <span style={{ fontSize: '0.72rem', backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 700, flexShrink: 0 }}>{proj.category}</span>}
                        {proj.metric && <span style={{ fontSize: '0.72rem', backgroundColor: '#d1fae5', color: '#065f46', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 700, flexShrink: 0 }}>{proj.metric}</span>}
                        {proj.duration && <span style={{ fontSize: '0.72rem', color: '#94a3b8', flexShrink: 0 }}>{proj.duration}</span>}
                        {proj.isPinned && <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 700, flexShrink: 0 }}>⭐ Ghim</span>}
                      </div>
                      <div className="admin-list-actions">
                        <button onClick={() => moveItem('project', idx, 'up')} disabled={idx === 0} title="Lên" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', opacity: idx === 0 ? 0.3 : 1, padding: '5px' }}><FiArrowUp size={15} /></button>
                        <button onClick={() => moveItem('project', idx, 'down')} disabled={idx === (formData.projects || []).length - 1} title="Xuống" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', opacity: idx === (formData.projects || []).length - 1 ? 0.3 : 1, padding: '5px' }}><FiArrowDown size={15} /></button>
                        <button onClick={() => toggleStatus('project', idx, 'isPinned')} title="Ghim" style={{ background: 'none', border: 'none', cursor: 'pointer', color: proj.isPinned ? '#f59e0b' : '#cbd5e1', padding: '5px' }}><FiStar size={15} fill={proj.isPinned ? '#f59e0b' : 'none'} /></button>
                        <button onClick={() => toggleStatus('project', idx, 'isHidden')} title="Ẩn/Hiện" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '5px' }}>{proj.isHidden ? <FiEyeOff size={15} /> : <FiEye size={15} />}</button>
                        <button onClick={() => openProjectForm('edit', idx)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.4rem 0.875rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, color: '#374151' }}><FiEdit size={13} /> Sửa</button>
                        <button onClick={() => deleteItem('project', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '5px' }}><FiTrash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  {(formData.projects || []).length === 0 && <p style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>Chưa có dự án. Nhấn "Thêm Dự Án" để bắt đầu.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              TAB BLOG
          ════════════════════════════════ */}
          {!loading && activeTab === 'blog' && (
            <div>
              <div className="admin-card">
                <h3>Banner Trang Blog</h3>
                <div className="admin-grid-auto">
                  <div><label style={labelStyle}>Tiêu đề trang</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.pageTitle || ''} onChange={e => setFormData({ ...formData, pageTitle: e.target.value })} /></div>
                  <div><label style={labelStyle}>Tiêu đề phụ</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} /></div>
                </div>
                <div style={{ marginTop: '1.25rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <label style={labelStyle}>Ảnh Bìa</label>
                  {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                    <FiUploadCloud size={16} color="#6366f1" /> Tải nền lên
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="admin-card">
                <h3>Cấu Hình Danh Mục</h3>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <input className="adm-input-focus" style={{ ...inputStyle, flex: 1, minWidth: '180px' }} type="text" value={newCategoryInput} onChange={e => setNewCategoryInput(e.target.value)} placeholder="Nhập tên danh mục..." onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
                  <button onClick={handleAddCategory} style={{ padding: '0.75rem 1.25rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>Thêm</button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                  {(formData.categories || ['Chung']).map(cat => (
                    <span key={cat} style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '0.35rem 0.875rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      {cat}
                      <FiX style={{ cursor: 'pointer', color: '#ef4444' }} size={13} onClick={() => handleRemoveCategory(cat)} />
                    </span>
                  ))}
                </div>
              </div>
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Kho Bài Viết ({(formData.posts || []).length})</h3>
                  <button onClick={() => openBlogForm('add')} style={{ background: '#6366f1', color: '#fff', border: 'none', padding: '0.5rem 1.125rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>
                    <FiPlus size={14} /> Viết Bài Mới
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {(formData.posts || []).map((post, idx) => (
                    <div key={post.id} className="admin-list-item" style={{ backgroundColor: post.isHidden ? '#f8fafc' : '#fff', opacity: post.isHidden ? 0.7 : 1 }}>
                      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#1e1b4b', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{post.title}</span>
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 700, flexShrink: 0 }}>{post.category}</span>
                        {post.isPinned && <span style={{ backgroundColor: '#fef3c7', color: '#d97706', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 700, flexShrink: 0 }}>⭐ Nổi bật</span>}
                        {post.isDraft && <span style={{ backgroundColor: '#f1f5f9', color: '#94a3b8', fontSize: '0.72rem', padding: '0.2rem 0.55rem', borderRadius: '5px', fontWeight: 700, flexShrink: 0 }}>Nháp</span>}
                      </div>
                      <div className="admin-list-actions">
                        <button onClick={() => moveItem('blog', idx, 'up')} disabled={idx === 0} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', opacity: idx === 0 ? 0.3 : 1, padding: '5px' }}><FiArrowUp size={15} /></button>
                        <button onClick={() => moveItem('blog', idx, 'down')} disabled={idx === (formData.posts || []).length - 1} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', opacity: idx === (formData.posts || []).length - 1 ? 0.3 : 1, padding: '5px' }}><FiArrowDown size={15} /></button>
                        <button onClick={() => toggleStatus('blog', idx, 'isPinned')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: post.isPinned ? '#f59e0b' : '#cbd5e1', padding: '5px' }}><FiStar size={15} fill={post.isPinned ? '#f59e0b' : 'none'} /></button>
                        <button onClick={() => toggleStatus('blog', idx, 'isHidden')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '5px' }}>{post.isHidden ? <FiEyeOff size={15} /> : <FiEye size={15} />}</button>
                        <button onClick={() => openBlogForm('edit', idx)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '0.4rem 0.875rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px', borderRadius: '7px', cursor: 'pointer', fontWeight: 700, color: '#374151' }}><FiEdit size={13} /> Sửa</button>
                        <button onClick={() => deleteItem('blog', idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '5px' }}><FiTrash2 size={15} /></button>
                      </div>
                    </div>
                  ))}
                  {(formData.posts || []).length === 0 && <p style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>Chưa có bài viết.</p>}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              TAB RESUME
          ════════════════════════════════ */}
          {!loading && activeTab === 'resume' && (
            <div>
              <div className="admin-card">
                <h3>Chế Độ Hiển Thị</h3>
                <select value={formData.displayMode || 'both'} onChange={e => setFormData({ ...formData, displayMode: e.target.value })} style={{ ...inputStyle, fontWeight: 600, color: '#4338ca', backgroundColor: '#e0e7ff', border: 'none' }}>
                  <option value="both">Hiển thị cả Bản PDF và Hồ sơ Động</option>
                  <option value="dynamic_only">Chỉ Hồ sơ Động (Ẩn PDF)</option>
                  <option value="pdf_only">Chỉ PDF (Ẩn Hồ sơ Web)</option>
                </select>
              </div>
              <div className="admin-card">
                <h3>Banner Trang Resume</h3>
                <div className="admin-grid-auto">
                  <div><label style={labelStyle}>Tiêu đề trang</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.pageTitle || ''} onChange={e => setFormData({ ...formData, pageTitle: e.target.value })} /></div>
                  <div><label style={labelStyle}>Tiêu đề phụ</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.subtitle || ''} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} /></div>
                </div>
                <div style={{ marginTop: '1.25rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <label style={labelStyle}>Ảnh Bìa</label>
                  {formData.coverUrl && <img src={formData.coverUrl} alt="cover" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                    <FiUploadCloud size={16} color="#6366f1" /> Tải nền lên
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'coverUrl')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="admin-card">
                <h3>Thông Tin Cá Nhân</h3>
                <div className="admin-grid-auto" style={{ marginBottom: '1.25rem' }}>
                  <div><label style={labelStyle}>Họ và tên</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.header?.name || ''} onChange={e => setFormData({ ...formData, header: { ...formData.header, name: e.target.value } })} /></div>
                  <div><label style={labelStyle}>Liên hệ nhanh</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.header?.contact || ''} onChange={e => setFormData({ ...formData, header: { ...formData.header, contact: e.target.value } })} /></div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Tổng quan năng lực</label>
                  <RichTextEditor value={formData.overview || ''} onChange={val => setFormData({ ...formData, overview: val })} />
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: '#eef2ff', borderRadius: '10px', border: '1px dashed #818cf8' }}>
                  <h4 style={{ margin: '0 0 0.875rem 0', color: '#4338ca', fontSize: '0.9rem', fontWeight: 700 }}>Tập tin CV gốc (PDF)</h4>
                  <div style={{ display: 'flex', gap: '0.875rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input className="adm-input-focus" style={{ ...inputStyle, flex: 1, minWidth: '180px' }} type="text" value={formData.cvUrl || ''} readOnly placeholder="URL PDF sẽ hiện ở đây sau khi upload" />
                    <label style={{ background: '#6366f1', color: '#fff', padding: '0.7rem 1.5rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                      <FiUploadCloud size={15} /> Upload PDF
                      <input type="file" accept=".pdf" onChange={e => handleSingleFileUpload(e, 'cvUrl', 'documents')} style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
              <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <h3 style={{ margin: 0 }}>Bộ Kỹ Năng</h3>
                  <button onClick={addSkill} style={{ padding: '0.5rem 1rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', gap: '5px', fontSize: '0.85rem' }}>
                    <FiPlus size={14} /> Thêm nhóm
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  {(formData.skills || []).map((skill, idx) => (
                    <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid #e2e8f0', position: 'relative' }}>
                      <div style={{ flex: '1 1 160px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Tên nhóm</label>
                        <input className="adm-input-focus" style={inputStyle} type="text" value={skill.title} onChange={e => updateSkill(idx, 'title', e.target.value)} placeholder="VD: Công cụ" />
                      </div>
                      <div style={{ flex: '2 1 260px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '3px' }}>Danh sách kỹ năng (phân cách bởi dấu phẩy)</label>
                        <textarea rows={1} defaultValue={Array.isArray(skill.items) ? skill.items.join(', ') : ''} onBlur={e => updateSkill(idx, 'items', e.target.value)} placeholder="Figma, BPMN, SQL..." style={{ ...inputStyle, resize: 'vertical' }} />
                      </div>
                      <button onClick={() => removeSkill(idx)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', position: 'absolute', top: '10px', right: '10px' }}><FiTrash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════════════════
              TAB GLOBAL
          ════════════════════════════════ */}
          {!loading && activeTab === 'global' && (
            <div>
              <div className="admin-card">
                <h3>Banner Trang Liên Hệ</h3>
                <div className="admin-grid-auto">
                  <div><label style={labelStyle}>Tiêu đề trang</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.contactTitle || ''} onChange={e => setFormData({ ...formData, contactTitle: e.target.value })} placeholder="VD: Liên Hệ Trực Tiếp" /></div>
                  <div><label style={labelStyle}>Tiêu đề phụ</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.contactSubtitle || ''} onChange={e => setFormData({ ...formData, contactSubtitle: e.target.value })} placeholder="Để lại thông tin..." /></div>
                </div>
                <div style={{ marginTop: '1.25rem', padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <label style={labelStyle}>Ảnh Bìa Trang Liên Hệ</label>
                  {formData.contactCoverUrl && <img src={formData.contactCoverUrl} alt="cover" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.75rem' }} />}
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '0.7rem', backgroundColor: '#f8fafc', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.85rem' }}>
                    <FiUploadCloud size={16} color="#6366f1" /> Tải nền lên
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'contactCoverUrl')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div className="admin-card">
                <h3>Thông Tin Hệ Thống</h3>
                <div className="admin-grid-auto" style={{ marginBottom: '1.25rem' }}>
                  <div><label style={labelStyle}>Tên tác giả</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.authorName || ''} onChange={e => setFormData({ ...formData, authorName: e.target.value })} placeholder="VD: Quyên" /></div>
                  <div><label style={labelStyle}>Vai trò tác giả</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.authorRole || ''} onChange={e => setFormData({ ...formData, authorRole: e.target.value })} placeholder="VD: Business Analyst" /></div>
                  <div><label style={labelStyle}>Email liên hệ</label><input className="adm-input-focus" style={inputStyle} type="email" value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} /></div>
                  <div><label style={labelStyle}>Số điện thoại</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
                  <div><label style={labelStyle}>Địa chỉ</label><input className="adm-input-focus" style={inputStyle} type="text" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={labelStyle}>Footer Bio</label>
                  <RichTextEditor value={formData.footerBio || ''} onChange={val => setFormData({ ...formData, footerBio: val })} />
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '10px' }}>
                  <label style={{ ...labelStyle, marginBottom: '0.875rem' }}>Mạng xã hội</label>
                  <div className="admin-grid-auto">
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}><FiGithub size={13} /> GitHub URL</label>
                      <input className="adm-input-focus" style={inputStyle} type="url" value={formData.social?.github || ''} onChange={e => setFormData({ ...formData, social: { ...formData.social, github: e.target.value } })} placeholder="https://github.com/..." />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}><FiLinkedin size={13} /> LinkedIn URL</label>
                      <input className="adm-input-focus" style={inputStyle} type="url" value={formData.social?.linkedin || ''} onChange={e => setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                </div>
              </div>
              {/* Author avatar for blog */}
              <div className="admin-card">
                <h3>Ảnh Đại Diện Tác Giả (Blog)</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '-0.75rem', marginBottom: '1rem' }}>Hiển thị ở cuối bài viết Blog. Nếu chưa có, hệ thống hiển thị chữ cái đầu tên.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  {formData.authorAvatar
                    ? <img src={formData.authorAvatar} alt="author" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} />
                    : <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}>{(formData.authorName || 'A')[0]}</div>
                  }
                  <label style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '0.65rem 1.125rem', backgroundColor: '#6366f1', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, color: '#fff', fontSize: '0.875rem' }}>
                    <FiUploadCloud size={15} /> Tải ảnh đại diện
                    <input type="file" accept="image/*" onChange={e => handleSingleFileUpload(e, 'authorAvatar')} style={{ display: 'none' }} />
                  </label>
                  {formData.authorAvatar && <button onClick={() => setFormData({ ...formData, authorAvatar: '' })} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Xóa ảnh</button>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <ConfirmModal
        open={showConfirm}
        title="Dữ liệu chưa được lưu!"
        message="Bạn có thay đổi trên trang này chưa lưu. Nếu rời sang tab khác, các chỉnh sửa sẽ bị hủy bỏ."
        onConfirm={confirmTabChange}
        onCancel={() => setShowConfirm(false)}
        confirmText="Có, hủy bỏ"
        cancelText="Ở lại để lưu"
      />

      {projectModalConfig.open && (
        <ProjectModal
          mode={projectModalConfig.mode}
          initialData={projectModalConfig.data}
          onClose={() => setProjectModalConfig({ ...projectModalConfig, open: false })}
          onSave={handleSaveProjectFromModal}
          setNotification={setModal}
        />
      )}

      {blogModalConfig.open && (
        <BlogModal
          mode={blogModalConfig.mode}
          initialData={blogModalConfig.data}
          categories={formData.categories || ['Chung']}
          onClose={() => setBlogModalConfig({ ...blogModalConfig, open: false })}
          onSave={handleSaveBlogFromModal}
          setNotification={setModal}
        />
      )}

      <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
    </div>
  );
}