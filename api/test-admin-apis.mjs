import axios from 'axios';

async function testAdminAPIs() {
  try {
    // Step 1: Login
    console.log('🔍 Step 1: Logging in as admin...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'birukwagnew13@gmail.com',
      password: 'BirukAdmin123!@#'
    });
    
    console.log('✅ Login successful!');
    console.log('📋 Login response:', loginResponse.data);
    
    const token = loginResponse.data.token;
    if (!token) {
      console.log('❌ No token in login response');
      return;
    }
    
    console.log('🔑 Token:', token.substring(0, 50) + '...');
    
    // Step 2: Test analytics API
    console.log('\n🔍 Step 2: Testing analytics API...');
    try {
      const analyticsResponse = await axios.get('http://localhost:5000/api/admin/graphs/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Analytics API response:', analyticsResponse.data);
    } catch (error) {
      console.log('❌ Analytics API error:', error.response?.data || error.message);
    }
    
    // Step 3: Test users API
    console.log('\n🔍 Step 3: Testing users API...');
    try {
      const usersResponse = await axios.get('http://localhost:5000/api/admin/all-users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Users API response:', usersResponse.data);
    } catch (error) {
      console.log('❌ Users API error:', error.response?.data || error.message);
    }
    
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
  }
}

testAdminAPIs();
