import React, { useState, useEffect } from 'react';
import { insertContactMessage, getPageContent } from '../utils/supabaseClient';
import '../styles/pages.css';
import NotificationModal from '../components/NotificationModal';

function Contact() {
  const [globalContent, setGlobalContent] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  
  // Trạng thái điều khiển Modal thông báo thay thế alert
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
  const socialLinks = globalContent?.social || { github: 'https://github.com/TQuyenG', linkedin: 'https://linkedin.com' };

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
        setModal({
          open: true, type: 'error',
          title: 'Gửi tin nhắn lỗi',
          message: 'Hệ thống kết nối cơ sở dữ liệu gặp gián đoạn. Vui lòng thử lại sau.'
        });
      } else {
        setModal({
          open: true, type: 'success',
          title: 'Gửi tin nhắn thành công',
          message: 'Thông tin của bạn đã được lưu lại trong hệ thống. Tôi sẽ phản hồi sớm nhất qua email.'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      setModal({ open: true, type: 'error', title: 'Lỗi không xác định', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page contact-page">
      <div className="page-header">
        <h1>Liên Hệ Trực Tiếp</h1>
        <p className="subtitle">Để lại thông tin kết nối công việc hoặc dự án hợp tác</p>
      </div>

      <div className="contact-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '3rem' }}>
        <div className="contact-info" style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#111827' }}>Thông Tin Tiếp Nhận</h2>
          <div className="info-items" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="info-item">
              <div>
                <strong style={{ color: '#1f2937' }}>Địa chỉ Thư điện tử</strong>
                <p style={{ color: '#4b5563', margin: '0.2rem 0' }}>{emailInfo}</p>
              </div>
            </div>
            <div className="info-item">
              <div>
                <strong style={{ color: '#1f2937' }}>Đường dây kết nối</strong>
                <p style={{ color: '#4b5563', margin: '0.2rem 0' }}>{phoneInfo}</p>
              </div>
            </div>
            <div className="info-item">
              <div>
                <strong style={{ color: '#1f2937' }}>Địa điểm làm việc</strong>
                <p style={{ color: '#4b5563', margin: '0.2rem 0' }}>{addressInfo}</p>
              </div>
            </div>
          </div>

          <div className="social-info" style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Mạng Xã Hội Chuyên Môn</h3>
            <div className="social-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>GitHub Profile</a>}
              {socialLinks.linkedin && <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', textDecoration: 'none' }}>LinkedIn Network</a>}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-form" style={{ backgroundColor: '#ffffff', padding: '2.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#111827' }}>Để Lại Lời Nhắn</h2>
          
          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Họ và tên người liên hệ</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập tên của bạn" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Địa chỉ email phản hồi</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Tiêu đề nội dung</label>
            <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Chủ đề cuộc trao đổi" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db' }} />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.4rem' }}>Nội dung chi tiết văn bản</label>
            <textarea id="message" name="message" value={formData.message} onChange={handleChange} required placeholder="Nội dung lời nhắn của bạn gửi đến hệ thống..." rows="5" style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #d1d5db', resize: 'vertical' }} />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '6px' }} disabled={loading}>
            {loading ? 'Đang xử lý dữ liệu...' : 'Gửi Yêu Cầu Kết Nối'}
          </button>
        </form>
      </div>

      {/* Thay thế hoàn toàn alert() mặc định */}
      <NotificationModal 
        open={modal.open} 
        type={modal.type} 
        title={modal.title} 
        message={modal.message} 
        onClose={() => setModal({ ...modal, open: false })} 
      />
    </section>
  );
}

export default Contact;