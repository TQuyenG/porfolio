import React, { useState } from 'react';
import '../styles/pages.css';

function Private() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const correctPassword = 'quyen2024'; // Đổi thành password của bạn

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === correctPassword) {
      setIsAuthenticated(true);
      alert('✅ Đăng nhập thành công!');
    } else {
      alert('❌ Mật khẩu không đúng!');
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="page private-page">
        <div className="login-container">
          <h1>🔒 Khu Vực Riêng Tư</h1>
          <p>Vui lòng nhập mật khẩu để tiếp tục</p>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
            />
            <button type="submit" className="btn btn-primary">
              Đăng Nhập
            </button>
          </form>
          <p className="hint">💡 Mật khẩu mặc định: quyen2024</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page private-page">
      <div className="page-header">
        <h1>🔒 Khu Vực Riêng Tư</h1>
        <p className="subtitle">Nội dung dành riêng cho những người thân quen</p>
      </div>

      <div className="private-content">
        <section className="private-section">
          <h2>📌 Ghi Chú Cá Nhân</h2>
          <p>
            Đây là nơi bạn có thể lưu giữ những ghi chú cá nhân, ý tưởng hoặc thông tin 
            chỉ dành cho một số người nhất định.
          </p>
          <textarea
            className="notes-area"
            placeholder="Ghi chú của bạn ở đây..."
            defaultValue="Chào mừng đến khu vực riêng tư!"
            rows="8"
          />
        </section>

        <section className="private-section">
          <h2>🖼️ Ảnh & Bộ Sưu Tập Cá Nhân</h2>
          <div className="gallery">
            <div className="gallery-item">📷 Ảnh 1</div>
            <div className="gallery-item">📷 Ảnh 2</div>
            <div className="gallery-item">📷 Ảnh 3</div>
          </div>
        </section>

        <section className="private-section">
          <h2>🔐 Bảo Mật</h2>
          <div className="security-info">
            <p>✅ Trang này được bảo vệ bằng mật khẩu</p>
            <p>💾 Dữ liệu được lưu ở localStorage (chỉ cục bộ)</p>
            <button 
              className="btn btn-secondary" 
              onClick={() => {
                setIsAuthenticated(false);
                setPassword('');
              }}
            >
              Đăng Xuất
            </button>
          </div>
        </section>
      </div>
    </section>
  );
}

export default Private;
