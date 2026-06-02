/**
Create a Supabase Storage bucket via REST Admin API.

Usage:
  node ./scripts/create-bucket.js "https://xyz.supabase.co" "service-role-key" bucket-name public(true|false)

Or set env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
*/

const SUPABASE_URL = process.argv[2] || process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = process.argv[4] || process.env.BUCKET_NAME || 'assets';
const PUBLIC = (process.argv[5] || process.env.BUCKET_PUBLIC || 'true') === 'true';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('Usage: node ./scripts/create-bucket.js <SUPABASE_URL> <SERVICE_ROLE_KEY> [bucket-name] [public]');
  process.exit(1);
}

const endpoint = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/buckets`;

(async ()=>{
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: BUCKET_NAME, public: PUBLIC })
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('Error creating bucket:', json);
      process.exit(2);
    }
    console.log('Bucket created:', json);
  } catch (e) {
    console.error('Request failed:', e.message || e);
    process.exit(3);
  }
})();
