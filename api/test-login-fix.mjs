import axios from 'axios';

async function testLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    // Test login with the same credentials
    const response = await axios.post(
      'http://localhost:5000/api/auth/login',
      { 
        email: 'birukwagnew13@gmail.com', 
        password: 'BirukAdmin123!@#' 
      },
      { withCredentials: true }
    );
    
    console.log('✅ Login successful!');
    console.log('📋 Full response:', response.data);
    console.log('🔑 Token:', response.data.token);
    console.log('👤 User:', response.data.user);
    
    // Test if token is stored in localStorage after login
    const storedToken = localStorage.getItem('token');
    console.log('📦 Token in localStorage:', storedToken);
    
    // Test if we can make an API call with the stored token
    if (storedToken) {
      try {
        const testResponse = await axios.get(
          'http://localhost:5000/api/admin/all-users',
          {
            headers: { Authorization: `Bearer ${storedToken}` }
          }
        );
        console.log('✅ API call successful:', testResponse.data);
      } catch (error) {
        console.log('❌ API call failed:', error.response?.data);
      }
    }
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
  }
}

testLogin();
