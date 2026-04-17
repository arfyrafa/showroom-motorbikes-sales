import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug logging
console.log('🔧 Supabase Config:');
console.log('  URL:', supabaseUrl ? `✅ ${supabaseUrl}` : '❌ Missing');
console.log('  Key:', supabaseAnonKey ? `✅ ${supabaseAnonKey?.substring(0, 20)}...` : '❌ Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase env is missing. Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});

// Test connection saat client dibuat
async function testConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    const { data, error } = await supabase
      .from('motorcycles')
      .select('count', { count: 'exact' });
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
    } else {
      console.log('✅ Connection successful! Tables accessible');
    }
  } catch (err) {
    console.error('❌ Connection test error:', err instanceof Error ? err.message : String(err));
  }
}

// Test after a short delay
setTimeout(testConnection, 1000);
