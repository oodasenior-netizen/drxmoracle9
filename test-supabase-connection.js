// Test Supabase Connection
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
  console.log('\n🔍 Testing Supabase Connection...\n');
  
  // Check environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  console.log('📋 Configuration:');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT SET'}`);
  console.log('');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test 1: Check connection by querying a simple table
    console.log('🧪 Test 1: Checking database connection...');
    const { data, error } = await supabase
      .from('character_gallery')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n💡 Tip: The character_gallery table does not exist yet.');
        console.log('   Run the SQL provisioning script in your Supabase dashboard:');
        console.log('   scripts/007_oracle8_supabase_provisioning.sql\n');
      }
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('');
    
    // Test 2: Check if tables exist
    console.log('🧪 Test 2: Checking if tables exist...');
    const { data: galleryData, error: galleryError } = await supabase
      .from('character_gallery')
      .select('id')
      .limit(1);
    
    if (galleryError) {
      console.error('❌ character_gallery table not found');
      console.log('   Please run: scripts/007_oracle8_supabase_provisioning.sql');
    } else {
      console.log('✅ character_gallery table exists');
    }
    
    // Test 3: Check RLS policies
    console.log('');
    console.log('🧪 Test 3: Testing read access...');
    const { data: testData, error: testError } = await supabase
      .from('character_gallery')
      .select('*')
      .limit(1);
    
    if (testError) {
      console.warn('⚠️  RLS policies may be restricting access:', testError.message);
      console.log('   This is normal if no user is authenticated.');
    } else {
      console.log(`✅ Read access successful (found ${testData?.length || 0} items)`);
    }
    
    console.log('');
    console.log('🎉 Supabase connection test complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Start dev server: npm run dev');
    console.log('   2. Log in with Firebase authentication');
    console.log('   3. Navigate to: /characters/[id]/edit');
    console.log('   4. Test the character gallery feature');
    console.log('');
    
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

testConnection()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
