# Portfolio Website

Một trang web portfolio hiện đại, responsive, và đầy đủ tính năng được xây dựng với **React** + **Supabase** + **GitHub Pages**.

## ✨ Tính Năng

- 📱 **Responsive Design** - Hoạt động tốt trên mọi thiết bị
- 🎨 **Modern UI** - Giao diện đẹp và chuyên nghiệp
- 📝 **Blog System** - Quản lý bài viết từ Supabase
- 💬 **Contact Form** - Nhận tin nhắn thực sự
- 🔐 **Private Area** - Khu vực riêng tư được bảo vệ
- 🚀 **Easy Deploy** - Deploy lên GitHub Pages chỉ bằng 1 lệnh
- ⚡ **Fast & SEO** - Tối ưu hóa cho performance và SEO

## 📁 Cấu Trúc Dự Án

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── styles/          # CSS files
├── data/            # Static data
└── utils/           # Utility functions & Supabase config
```

## 🚀 Setup & Installation

### 1. Clone hoặc Download project

```bash
git clone https://github.com/TQuyenG/portfolio.git
cd portfolio
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Supabase

Xem file `SUPABASE_SETUP.md` để hướng dẫn chi tiết.

### 4. Tạo `.env.local` file

Sao chép từ `.env.example` và điền thông tin Supabase của bạn:

```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Chạy development server

```bash
npm start
```

Mở http://localhost:3000 trong trình duyệt.

## 📝 Chỉnh Sửa Nội Dung

### Thêm Dự Án Mới

1. Đặt ảnh vào `public/images/`
2. Chỉnh sửa `src/data/projects.js`:

```javascript
{
  id: 4,
  title: 'Your Project Title',
  description: 'Project description',
  technologies: ['Tech1', 'Tech2'],
  link: 'https://your-link.com',
  image: '/images/project4.png',
}
```

### Viết Bài Blog

1. Chỉnh sửa `src/data/blog-posts.js`:

```javascript
{
  id: 4,
  title: 'Your Blog Title',
  date: '2024-01-20',
  excerpt: 'Brief excerpt...',
  category: 'Category',
}
```

### Cập Nhật Thông Tin Cá Nhân

- **Home**: Chỉnh sửa `src/pages/Home.jsx`
- **About**: Chỉnh sửa `src/pages/About.jsx`
- **Contact**: Chỉnh sửa `src/pages/Contact.jsx`
- **CV**: Đặt file vào `public/documents/`

## 🎨 Tùy Chỉnh Giao Diện

Chỉnh sửa màu sắc trong `src/styles/index.css`:

```css
:root {
  --primary-color: #2563eb;      /* Màu chính */
  --secondary-color: #1e40af;    /* Màu phụ */
  /* ... */
}
```

## 🚀 Deploy lên GitHub Pages

```bash
npm run deploy
```

Cập nhật `package.json` với đúng `homepage` URL:

```json
"homepage": "https://yourusername.github.io/portfolio"
```

## 📚 Công Nghệ Sử Dụng

- **Frontend**: React 18, React Router
- **Backend**: Supabase (PostgreSQL)
- **Hosting**: GitHub Pages
- **Styling**: CSS3 + Responsive Design

## 📖 Hướng Dẫn Thêm Chi Tiết

- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Setup Supabase
- [DIRECTORY_TREE.md](./DIRECTORY_TREE.md) - Cấu trúc thư mục

## 💡 Tips

- Thay đổi mật khẩu Private Page trong `src/utils/constants.js`
- Cập nhật link mạng xã hội trong `src/utils/constants.js`
- Thay đổi branding/logo trong `src/components/Navigation.jsx`

## 🤝 Support

Nếu có câu hỏi, vui lòng mở issue hoặc liên hệ tôi qua:
- Email: your.email@example.com
- GitHub: https://github.com/TQuyenG

---

Made with ❤️ by Quyen
