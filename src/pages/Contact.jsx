import React, { useState, useEffect } from 'react';
import { insertContactMessage, getPageContent } from '../utils/supabaseClient';
import '../styles/pages.css';
import NotificationModal from '../components/NotificationModal';

function Contact() {
  const [globalContent, setGlobalContent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    (async () => {
      const data = await getPageContent('global');
      if (data) setGlobalContent(data);
    })();
  }, []);

  const emailInfo = globalContent?.email || 'quyen.contact@example.com';
  const phoneInfo = globalContent?.phone || '+84 901 234 567';
  const addressInfo = globalContent?.address || 'TP. Hồ Chí Minh, Việt Nam';
  const socialLinks = globalContent?.social || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error: supabaseError } = await insertContactMessage(formData);
      if (supabaseError) {
        setModal({ open: true, type: 'error', title: 'Gửi thất bại', message: 'Hệ thống gián đoạn. Vui lòng thử lại sau.' });
      } else {
        setModal({ open: true, type: 'success', title: 'Thành công', message: 'Lời nhắn của bạn đã được ghi nhận.' });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setModal({ open: true, type: 'error', title: 'Lỗi', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page contact-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: 'var(--font-h1)', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>Liên Hệ Trực Tiếp</h1>
        <p style={{ fontSize: 'var(--font-body)', color: 'var(--text-sub)' }}>Để lại thông tin kết nối công việc hoặc dự án hợp tác</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem' }}>
        
        {/* Thông tin liên hệ tĩnh */}
        <div style={{ backgroundColor: 'var(--bg-white)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 'var(--font-h3)', marginBottom: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>Thông Tin Tiếp Nhận</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <strong style={{ color: 'var(--primary-color)', fontSize: 'var(--font-small)', textTransform: 'uppercase', letterSpacing: '1px' }}>Thư điện tử</strong>
              <p style={{ color: 'var(--text-main)', fontSize: 'var(--font-body)', fontWeight: 600, margin: '0.4rem 0' }}>{emailInfo}</p>
            </div>
            <div>
              <strong style={{ color: 'var(--primary-color)', fontSize: 'var(--font-small)', textTransform: 'uppercase', letterSpacing: '1px' }}>Điện thoại</strong>
              <p style={{ color: 'var(--text-main)', fontSize: 'var(--font-body)', fontWeight: 600, margin: '0.4rem 0' }}>{phoneInfo}</p>
            </div>
            <div>
              <strong style={{ color: 'var(--primary-color)', fontSize: 'var(--font-small)', textTransform: 'uppercase', letterSpacing: '1px' }}>Địa điểm</strong>
              <p style={{ color: 'var(--text-main)', fontSize: 'var(--font-body)', fontWeight: 600, margin: '0.4rem 0' }}>{addressInfo}</p>
            </div>
          </div>

          <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: 'var(--font-h4)', marginBottom: '1.5rem', fontWeight: 700 }}>Mạng Xã Hội</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-sub)', fontWeight: 600, textDecoration: 'none' }}>GitHub Profile →</a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-sub)', fontWeight: 600, textDecoration: 'none' }}>LinkedIn Network →</a>}
            </div>
          </div>
        </div>

        {/* Form nhập liệu */}
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-white)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: 'var(--font-h3)', marginBottom: '2rem', color: 'var(--text-main)', fontWeight: 800 }}>Gửi Lời Nhắn</h2>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-small)' }}>Họ và tên</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập tên của bạn" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-small)' }}>Địa chỉ Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-small)' }}>Chủ đề</label>
            <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Nội dung trao đổi" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)' }} />
          </div>

          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block', marginBottom: '0.5rem', fontSize: 'var(--font-small)' }}>Nội dung chi tiết</label>
            <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="Lời nhắn của bạn..." rows="5" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--bg-surface)', resize: 'vertical', fontFamily: 'inherit' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi Lời Nhắn'}
          </button>
        </form>
      </div>

      <NotificationModal open={modal.open} type={modal.type} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false })} />
    </section>
  );
}

export default Contact;