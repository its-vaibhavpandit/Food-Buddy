import { getFoodImageFromUnsplash } from '../utils/unsplash.js';

async function testUnsplashIntegration() {
  console.log('🖼️ Testing Unsplash API Integration Live...\n');

  const testQueries = ['burger', 'pizza', 'biryani'];

  for (const query of testQueries) {
    console.log(`🔍 Querying Unsplash for: "${query}"...`);
    const imageUrl = await getFoodImageFromUnsplash(query);
    console.log(`   --> Returned Image URL: ${imageUrl}\n`);
  }

  console.log('🎉 Unsplash API Test Complete!');
}

testUnsplashIntegration().catch((err) => {
  console.error('❌ Unsplash test failed:', err);
  process.exit(1);
});
