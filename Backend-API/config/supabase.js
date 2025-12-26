const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
  console.error('ERROR: SUPABASE_URL is not set in .env file');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_KEY is not set in .env file');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_KEY.trim()
);

console.log('✅ Supabase connected:', process.env.SUPABASE_URL);

module.exports = supabase;