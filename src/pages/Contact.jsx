import React, { useState } from 'react';
import '../styles/pages.css';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Hiện tại chỉ hiển thị thông báo. Bạn có thể connect với backend hoặc email service
    console.log('Form submitted:', formData);
    alert('✅ Cảm ơn! Tôi sẽ liên hệ lại với bạn sớm.\n(💡 Hiện tại demo, bạn cần setup email service)');
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 2000);
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

          <button type="submit" className="btn btn-primary" disabled={submitted}>
            {submitted ? '✅ Đã Gửi!' : '📤 Gửi Tin Nhắn'}
          </button>
        </form>
      </div>

      <div className="contact-note">
        <p>
          💡 <strong>Lưu ý:</strong> Hiện tại form này chỉ demo. Để nhận email thực sự, 
          bạn cần setup <strong>EmailJS</strong>, <strong>Formspree</strong>, hoặc backend server.
        </p>
      </div>
    </section>
  );
}

export default Contact;
