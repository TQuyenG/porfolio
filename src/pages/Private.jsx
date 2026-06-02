import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { FiLock, FiImage, FiEdit, FiLogOut, FiSave, FiSettings } from 'react-icons/fi';
import { getPrivateContent, upsertPrivateContent, getPageContent, upsertPageContent, uploadFileToStorage, insertAssetRecord, insertDocumentRecord, supabase } from '../utils/supabaseClient';
import { getAssets, deleteAsset, getDocuments, deleteDocument } from '../utils/supabaseClient';
import ConfirmModal from '../components/ConfirmModal';
import NotificationModal from '../components/NotificationModal';

function Private() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [gallery, setGallery] = useState([]);
  
  // Trạng thái cho Notification Modal
  const [notif, setNotif] = useState({ open: false, type: 'success', title: '', message: '' });

  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || '';

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        setIsAuthenticated(ADMIN_EMAIL ? (data.session.user.email === ADMIN_EMAIL) : true);
      }
    };
    init();
  }, [ADMIN_EMAIL]);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      setLoading(true);
      const data = await getPrivateContent(1);
      if (data) {
        setNotes(data.notes || '');
        try {
          setGallery(Array.isArray(data.gallery) ? data.gallery : (data.gallery ? JSON.parse(data.gallery) : []));
        } catch (e) { setGallery([]); }
      }
      setLoading(false);
    })();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const resp = await supabase.auth.signInWithPassword({ email, password });
    if (resp.error) {
      setNotif({ open: true, type: 'error', title: 'Đăng nhập thất bại', message: resp.error.message });
      return;
    }
    setIsAuthenticated(ADMIN_EMAIL ? (resp.data?.user?.email === ADMIN_EMAIL) : true);
  };

  const handleSave = async () => {
    setLoading(true);
    const content = { notes, gallery: JSON.stringify(gallery) };
    const { error } = await upsertPrivateContent(content, 1);
    setLoading(false);
    if (error) {
      setNotif({ open: true, type: 'error', title: 'Lỗi hệ thống', message: 'Không thể lưu cấu hình ghi chú.' });
    } else {
      setNotif({ open: true, type: 'success', title: 'Thành công', message: 'Dữ liệu hệ thống đã được cập nhật.' });
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="page private-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
        <div className="login-container" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}><FiLock /> Quản Trị Viên</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Đăng nhập để cập nhật thông tin Portfolio.</p>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <input type="email" placeholder="Email quản trị" value={email} onChange={(e) => setEmail(e.target.value)} className="password-input" required />
            </div>
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <input type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} className="password-input" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.8rem' }}>Đăng Nhập</button>
          </form>
        </div>
        <NotificationModal open={notif.open} type={notif.type} title={notif.title} message={notif.message} onClose={() => setNotif({ ...notif, open: false })} />
      </section>
    );
  }

  return (
    <section className="page private-page">
      <div className="page-header">
        <h1><FiSettings /> Hệ Thống Quản Trị Portfolio</h1>
        <p className="subtitle">Chỉnh sửa toàn bộ nội dung hiển thị trên giao diện công khai</p>
      </div>

      <div className="private-content grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <PageEditor setGlobalNotif={setNotif} />
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Trạng Thái Đăng Nhập</h3>
            <p className="note" style={{ margin: 0 }}>Hệ thống đang hoạt động với quyền Admin độc quyền.</p>
          </div>
          <button className="btn btn-secondary" onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); }}>
            <FiLogOut style={{ marginRight: 6, verticalAlign: 'middle' }}/> Đăng Xuất
          </button>
        </div>
      </div>
      <NotificationModal open={notif.open} type={notif.type} title={notif.title} message={notif.message} onClose={() => setNotif({ ...notif, open: false })} />
    </section>
  );
}

function PageEditor({ setGlobalNotif }) {
  const [pageKey, setPageKey] = useState('home');
  const [jsonText, setJsonText] = useState('');
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingPage(true);
      const content = await getPageContent(pageKey);
      setJsonText(content ? JSON.stringify(content, null, 2) : '');
      setLoadingPage(false);
    })();
  }, [pageKey]);

  const handleSave = async () => {
    try {
      const parsed = jsonText ? JSON.parse(jsonText) : {};
      const { error } = await upsertPageContent(pageKey, parsed);
      if (error) {
        setGlobalNotif({ open: true, type: 'error', title: 'Lưu thất bại', message: 'Lỗi đồng bộ dữ liệu với cơ sở dữ liệu.' });
      } else {
        setGlobalNotif({ open: true, type: 'success', title: 'Đã lưu cấu hình', message: `Nội dung của phân mục [${pageKey}] đã được cập nhật thành công.` });
      }
    } catch (e) {
      setGlobalNotif({ open: true, type: 'error', title: 'Sai định dạng cấu trúc', message: 'Chuỗi JSON nhập vào không hợp lệ. Vui lòng kiểm tra lại dấu đóng mở ngoặc hoặc dấu phẩy.' });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <span style={{ fontWeight: 600, color: '#374151' }}>Chọn Phân Trang Biên Tập:</span>
        <select value={pageKey} onChange={(e) => setPageKey(e.target.value)} style={{ padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #d1d5db', outline: 'none', minWidth: '180px' }}>
          <option value="home">Trang Chủ (Home)</option>
          <option value="about">Giới Thiệu (About)</option>
          <option value="projects">Dự Án (Projects)</option>
          <option value="resume">Sơ Yếu Lý Lịch (CV)</option>
          <option value="global">Cấu Hình Chung (Global)</option>
        </select>
        <button className="btn btn-primary" onClick={handleSave} style={{ padding: '0.6rem 2rem' }}><FiSave style={{ marginRight: 6 }}/> Lưu Thay Đổi</button>
      </div>

      <textarea
        className="notes-area"
        rows={16}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
        placeholder={loadingPage ? 'Đang tải cấu trúc dữ liệu...' : '{\n  "title": "..."\n}'}
        style={{ width: '100%', padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.95rem', backgroundColor: '#f9fafb' }}
      />
    </div>
  );
}

export default Private;