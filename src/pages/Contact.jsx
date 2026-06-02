import React, { useState } from 'react';
import { insertContactMessage } from '../utils/supabaseClient';
import '../styles/pages.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await insertContactMessage(formData);

      if (supabaseError) {
        setError('❌ Lỗi khi gửi tin nhắn. Vui lòng thử lại.');
        console.error('Supabase error:', supabaseError);
      } else {
        console.log('Message sent successfully:', data);
        alert('✅ Cảm ơn! Tin nhắn của bạn đã được gửi. Tôi sẽ liên hệ lại với bạn sớm.');
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTimeout(() => {
          setSubmitted(false);
        }, 2000);
      }
    } catch (err) {
      setError('❌ Lỗi khi gửi tin nhắn: ' + err.message);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page contact-page">
      <div className="page-header">
        <h1>Liên Lạc</h1>
        <p className="subtitle">Gửi tin nhắn cho tôi</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Thông Tin Liên Lạc</h2>
          <div className="info-items">
            <div className="info-item">
              <span className="icon">📧</span>
              <div>
                <strong>Email</strong>
                <p>your.email@example.com</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📱</span>
              <div>
                <strong>Điện Thoại</strong>
                <p>+84 xxx xxx xxx</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📍</span>
              <div>
                <strong>Địa Chỉ</strong>
                <p>Thành phố của bạn, Vietnam</p>
              </div>
            </div>
          </div>

          <div className="social-info">
            <h3>Kết Nối Với Tôi</h3>
            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                🐙 GitHub
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                💼 LinkedIn
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                🐦 Twitter
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                👥 Facebook
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="contact-form">
          <h2>Gửi Tin Nhắn</h2>
          
          <div className="form-group">
            <label htmlFor="name">Tên của bạn</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nhập tên"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Chủ Đề</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              placeholder="Chủ đề tin nhắn"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Tin Nhắn</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              placeholder="Nhập tin nhắn của bạn..."
              rows="6"
            />
          </div>

          {error && <p style={{ color: 'var(--error)', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className="btn btn-primary" disabled={loading || submitted}>
            {loading ? '⏳ Đang gửi...' : submitted ? '✅ Đã Gửi!' : '📤 Gửi Tin Nhắn'}
          </button>
        </form>
      </div>

      <div className="contact-note">
        <p>
          ✅ <strong>Lưu ý:</strong> Tin nhắn của bạn sẽ được lưu vào Supabase database.
          Để nhận email notification, vui lòng setup <strong>SendGrid</strong> hoặc <strong>Resend</strong>.
        </p>
      </div>
    </section>
  );
}

export default Contact;
