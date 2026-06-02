/*
Seeder that runs with Service Role key (has full privileges) for RLS-protected projects.
Usage:
  node ./scripts/seed-service.js "https://<project>.supabase.co" "SERVICE_ROLE_KEY"
This will upsert 'home' and 'resume' content using admin privileges.
*/

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.argv[2] || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

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
    intro: 'Tôi xây dựng ứng dụng web đẹp, hiệu quả và có khả năng mở rộng.',
    ctas: [ { text: 'Xem Dự Án', href: '/projects', variant: 'primary' }, { text: 'Liên Lạc', href: '/contact', variant: 'secondary' } ],
    cards: [ { title: 'Dự Án Mới', text: 'Khám phá các dự án mới nhất của tôi', href: '/projects' } ]
  };

  const resume = {
    header: { name: 'QUYEN - Web Developer', contact: 'quyen@example.com | +84 90x xxx xxx', location: 'Hanoi, Vietnam' },
    overview: 'Web developer chuyên về React và thiết kế giao diện người dùng.',
    experiences: [ { title: 'Senior Web Developer', company: 'Công ty ABC', date: '2022 - Hiện tại', bullets: ['Xây dựng SPA với React'] } ],
    skills: [ { title: 'Frontend', items: ['React', 'JavaScript'] } ],
    education: [ { title: 'Cử nhân Công nghệ Thông tin', company: 'Đại học XYZ', date: '2018 - 2022' } ],
    cvUrl: '/documents/CV-Quyen.pdf'
  };

  try {
    await upsertPage('home', home);
    await upsertPage('resume', resume);
    console.log('Service seeding completed.');
  } catch (e) {
    console.error('Seeder error', e.message || e);
    process.exit(2);
  }
  process.exit(0);
})();
