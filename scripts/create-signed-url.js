/*
Create a signed download URL for a storage object using Service Role key.
Usage:
  node ./scripts/create-signed-url.js "https://<project>.supabase.co" "SERVICE_ROLE_KEY" "bucket" "object_path" [expires-in-seconds]
Example:
  node ./scripts/create-signed-url.js https://rpibzkmpqbbsoqrbzati.supabase.co SERVICE_ROLE_KEY assets "1623456-foo.jpg" 60
*/

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.argv[2] || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.argv[4];
const OBJECT = process.argv[5];
const EXPIRES = parseInt(process.argv[6] || '60', 10);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !BUCKET || !OBJECT) {
  console.error('Usage: node create-signed-url.js <SUPABASE_URL> <SERVICE_ROLE_KEY> <bucket> <object_path> [expires]');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

(async ()=>{
  try {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(OBJECT, EXPIRES);
    if (error) {
      console.error('Error creating signed url', error);
      process.exit(2);
    }
    console.log('Signed URL:', data.signedUrl);
  } catch (e) {
    console.error('Failed:', e.message || e);
    process.exit(3);
  }
})();
