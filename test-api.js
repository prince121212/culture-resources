const fetch = require('node-fetch');

async function testResourceAPI() {
  try {
    console.log('Testing resource API...');
    
    // 测试获取资源详情
    const response = await fetch('http://localhost:5001/api/resources/6833323e2a961787311c5847');
    
    if (!response.ok) {
      console.error('API request failed:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('Resource data received:');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\nCategory information:');
    console.log('Category type:', typeof data.category);
    console.log('Category value:', data.category);
    
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testResourceAPI();
