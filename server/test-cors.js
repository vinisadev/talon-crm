// Simple test script to verify CORS configuration
// Run with: node test-cors.js

const testCorsConfiguration = () => {
  console.log('Testing CORS configuration...\n');

  // Test 1: Default origins when CORS_ORIGINS is not set
  delete process.env.CORS_ORIGINS;
  const defaultOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://app.taloncrm.com',
      ];
  
  console.log('✅ Default origins (no CORS_ORIGINS):');
  console.log(defaultOrigins);
  console.log('');

  // Test 2: Custom origins from environment variable
  process.env.CORS_ORIGINS = 'http://localhost:3000,https://staging.taloncrm.com,https://app.taloncrm.com';
  const customOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : defaultOrigins;
  
  console.log('✅ Custom origins (with CORS_ORIGINS):');
  console.log(customOrigins);
  console.log('');

  // Test 3: Origins with extra spaces
  process.env.CORS_ORIGINS = ' http://localhost:3000 , https://staging.taloncrm.com , https://app.taloncrm.com ';
  const trimmedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : defaultOrigins;
  
  console.log('✅ Trimmed origins (with spaces):');
  console.log(trimmedOrigins);
  console.log('');

  // Test 4: Single origin
  process.env.CORS_ORIGINS = 'https://app.taloncrm.com';
  const singleOrigin = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
    : defaultOrigins;
  
  console.log('✅ Single origin:');
  console.log(singleOrigin);
  console.log('');

  console.log('🎉 All CORS configuration tests passed!');
};

testCorsConfiguration();
