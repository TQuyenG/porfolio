/*
Seeder for sample page content. Usage:

PowerShell:
$env:SUPABASE_URL="https://xyz.supabase.co"; $env:SUPABASE_ANON_KEY="public-anon-key"; npm run seed

Or:
node ./scripts/seed-sample.js "https://xyz.supabase.co" "public-anon-key"
*/

const { createClient } = require('@supabase/supabase-js');

const argUrl = process.argv[2];
const argKey = process.argv[3];
const SUPABASE_URL = argUrl || process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_ANON_KEY = argKey || process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase URL or ANON key not provided. Set SUPABASE_URL and SUPABASE_ANON_KEY env vars or pass as args.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function upsertPage(page, content) {
  const { data, error } = await supabase.from('pages_content').upsert([{ page, content }]);
  if (error) {
    console.error('Error upserting', page, error.message || error);
    return false;
  }
  console.log(`Upserted page: ${page}`);
  return true;
}

(async () => {
  const home = {
    bannerUrl: 'https://images.unsplash.com/photo-1503264116251-35a269479413?q=80&w=1400&auto=format&fit=crop&ixlib=rb-4.0.3&s=7e6c0f7a8f6b2d9f7f1a1c3e0a2b1c4d',
    title: 'Xin Chào! Tôi là Quyen',
    tagline: 'Web Developer | Designer | Thinker',
    intro: 'Tôi xây dựng ứng dụng web đẹp, hiệu quả và có khả năng mở rộng. Khám phá các dự án và kinh nghiệm của tôi.',
    ctas: [
      { text: 'Xem Dự Án', href: '/projects', variant: 'primary' },
      { text: 'Liên Lạc', href: '/contact', variant: 'secondary' }
    ],
    cards: [
      { title: 'Dự Án Mới', text: 'Khám phá các dự án mới nhất của tôi', href: '/projects' },
      { title: 'Bài Viết', text: 'Những bài học và thủ thuật tôi viết', href: '/blog' },
      { title: 'Giới Thiệu', text: 'Tìm hiểu về hành trình nghề nghiệp của tôi', href: '/about' }
    ]
  };

  const resume = {
    header: { name: 'QUYEN - Web Developer', contact: 'quyen@example.com | +84 90x xxx xxx', location: 'Hanoi, Vietnam' },
    overview: 'Web developer chuyên về React và thiết kế giao diện người dùng. Kinh nghiệm xây dựng các sản phẩm từ concept đến production.',
    experiences: [
      { title: 'Senior Web Developer', company: 'Công ty ABC', date: '2022 - Hiện tại', bullets: ['Xây dựng SPA với React', 'Thiết kế hệ thống component reusable', 'Triển khai CI/CD'] },
      { title: 'Frontend Engineer', company: 'Startup XYZ', date: '2020 - 2022', bullets: ['Tối ưu hóa tốc độ tải trang', 'Thiết kế UX cho mobile-first'] }
    ],
    skills: [
      { title: 'Frontend', items: ['React', 'JavaScript', 'TypeScript', 'CSS'] },
      { title: 'Backend', items: ['Node.js', 'Express', 'Postgres'] }
    ],
    education: [
      { title: 'Cử nhân Công nghệ Thông tin', company: 'Đại học XYZ', date: '2018 - 2022' }
    ],
    cvUrl: '/documents/CV-Quyen.pdf'
  };

  try {
    await upsertPage('home', home);
    await upsertPage('resume', resume);
    console.log('Seeding completed.');
  } catch (e) {
    console.error('Seeder error', e.message || e);
    process.exit(2);
  }
  process.exit(0);
})();
