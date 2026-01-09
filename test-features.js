const axios = require('axios');

const API_BASE = 'http://localhost:5000';

// Test configuration
const testUsers = {
  student: {
    name: 'Test Student',
    email: 'teststudent@example.com',
    phone: '+251912345678',
    role: 'student',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#'
  },
  instructor: {
    name: 'Test Instructor',
    email: 'testinstructor@example.com',
    phone: '+251912345679',
    role: 'instructor',
    expertise: 'Web Development',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#'
  },
  admin: {
    name: 'Test Admin',
    email: 'testadmin@example.com',
    phone: '+251912345680',
    role: 'admin',
    password: 'Test123!@#',
    confirmPassword: 'Test123!@#'
  }
};

let tokens = {};
let userIds = {};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test 1: User Registration
async function testUserRegistration() {
  console.log('\n🧪 Testing User Registration...');
  
  for (const [role, userData] of Object.entries(testUsers)) {
    console.log(`\n📝 Registering ${role}...`);
    
    // For instructor, we'd need to add CV file, but for testing we'll skip that
    const data = { ...userData };
    if (role === 'instructor') {
      console.log('⚠️  Skipping instructor registration (requires CV file)');
      continue;
    }
    
    const result = await apiCall('POST', '/api/auth/register', data);
    
    if (result.success) {
      console.log(`✅ ${role} registration successful`);
      console.log(`   Message: ${result.data.message}`);
    } else {
      console.log(`❌ ${role} registration failed`);
      console.log(`   Error: ${result.error.message || result.error}`);
      
      // If user already exists, try to login
      if (result.error.message?.includes('already exists')) {
        console.log(`🔄 Attempting login for existing ${role}...`);
        const loginResult = await apiCall('POST', '/api/auth/login', {
          email: userData.email,
          password: userData.password
        });
        
        if (loginResult.success) {
          console.log(`✅ ${role} login successful`);
          tokens[role] = loginResult.data.token;
          userIds[role] = loginResult.data.user._id;
        } else {
          console.log(`❌ ${role} login failed: ${loginResult.error.message || loginResult.error}`);
        }
      }
    }
  }
}

// Test 2: Course Management
async function testCourseManagement() {
  console.log('\n🧪 Testing Course Management...');
  
  if (!tokens.instructor) {
    console.log('❌ No instructor token available, skipping course management tests');
    return;
  }
  
  // Test creating a course
  const courseData = {
    title: 'Test Course for Testing',
    description: 'This is a test course created during automated testing',
    price: 1000,
    category: 'Web Development',
    level: 'beginner',
    duration: '10 hours',
    language: 'English',
    thumbnail: {
      url: 'https://example.com/thumbnail.jpg',
      publicId: 'test_thumbnail'
    },
    modules: [
      {
        title: 'Module 1: Introduction',
        description: 'Introduction to the course',
        duration: '2 hours',
        lessons: [
          {
            title: 'Lesson 1: Getting Started',
            type: 'video',
            duration: '30 minutes',
            video: {
              url: 'https://example.com/video1.mp4',
              thumbnailUrl: 'https://example.com/thumb1.jpg'
            },
            free: true
          }
        ]
      }
    ]
  };
  
  console.log('\n📝 Creating test course...');
  const createResult = await apiCall('POST', '/api/courses', courseData, tokens.instructor);
  
  if (createResult.success) {
    console.log('✅ Course creation successful');
    console.log(`   Course ID: ${createResult.data._id}`);
    
    // Test updating the course
    const updateData = {
      title: 'Updated Test Course',
      description: 'This course has been updated during testing'
    };
    
    console.log('\n📝 Updating test course...');
    const updateResult = await apiCall('PUT', `/api/courses/${createResult.data._id}`, updateData, tokens.instructor);
    
    if (updateResult.success) {
      console.log('✅ Course update successful');
    } else {
      console.log('❌ Course update failed');
      console.log(`   Error: ${updateResult.error.message || updateResult.error}`);
    }
  } else {
    console.log('❌ Course creation failed');
    console.log(`   Error: ${createResult.error.message || createResult.error}`);
  }
}

// Test 3: Course Enrollment
async function testCourseEnrollment() {
  console.log('\n🧪 Testing Course Enrollment...');
  
  if (!tokens.student) {
    console.log('❌ No student token available, skipping enrollment tests');
    return;
  }
  
  // Get available courses
  console.log('\n📋 Fetching available courses...');
  const coursesResult = await apiCall('GET', '/api/courses/active');
  
  if (coursesResult.success && coursesResult.data.length > 0) {
    const course = coursesResult.data[0];
    console.log(`✅ Found course: ${course.title}`);
    
    // Test enrollment
    console.log('\n📝 Testing course enrollment...');
    const enrollData = {
      courseId: course._id,
      amount: course.price || 0,
      email: testUsers.student.email,
      fullName: testUsers.student.name
    };
    
    const enrollResult = await apiCall('POST', '/api/payment/initiate', enrollData, tokens.student);
    
    if (enrollResult.success) {
      console.log('✅ Enrollment initiation successful');
      console.log(`   Checkout URL: ${enrollResult.data.checkoutUrl}`);
    } else {
      console.log('❌ Enrollment initiation failed');
      console.log(`   Error: ${enrollResult.error.message || enrollResult.error}`);
    }
  } else {
    console.log('❌ No courses available for enrollment testing');
  }
}

// Test 4: Password Reset
async function testPasswordReset() {
  console.log('\n🧪 Testing Password Reset...');
  
  // Test password reset request
  console.log('\n📝 Requesting password reset...');
  const resetRequestResult = await apiCall('POST', '/api/otp/request-password-reset', {
    email: testUsers.student.email
  });
  
  if (resetRequestResult.success) {
    console.log('✅ Password reset request successful');
    console.log(`   Message: ${resetRequestResult.message}`);
  } else {
    console.log('❌ Password reset request failed');
    console.log(`   Error: ${resetRequestResult.error.message || resetRequestResult.error}`);
  }
}

// Test 5: Search Functionality
async function testSearchFunctionality() {
  console.log('\n🧪 Testing Search Functionality...');
  
  // Test course search
  console.log('\n🔍 Testing course search...');
  const searchResult = await apiCall('GET', '/api/courses/search?q=web');
  
  if (searchResult.success) {
    console.log(`✅ Course search successful - found ${searchResult.data.length} courses`);
  } else {
    console.log('❌ Course search failed');
    console.log(`   Error: ${searchResult.error.message || searchResult.error}`);
  }
}

// Test 6: Content Access Restriction
async function testContentAccessRestriction() {
  console.log('\n🧪 Testing Content Access Restriction...');
  
  // Get available courses
  const coursesResult = await apiCall('GET', '/api/courses/active');
  
  if (coursesResult.success && coursesResult.data.length > 0) {
    const course = coursesResult.data[0];
    
    // Test access without authentication
    console.log('\n🔒 Testing access without authentication...');
    const unauthorizedResult = await apiCall('GET', `/api/courses/${course._id}`);
    
    if (unauthorizedResult.success) {
      console.log('✅ Course details accessible (public content)');
    } else {
      console.log('❌ Course details access failed');
    }
    
    // Test access with student authentication
    if (tokens.student) {
      console.log('\n🔓 Testing access with student authentication...');
      const authorizedResult = await apiCall('GET', `/api/courses/${course._id}`, null, tokens.student);
      
      if (authorizedResult.success) {
        console.log('✅ Course details accessible with authentication');
      } else {
        console.log('❌ Course details access failed with authentication');
      }
    }
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive Feature Tests...\n');
  
  try {
    await testUserRegistration();
    await testCourseManagement();
    await testCourseEnrollment();
    await testPasswordReset();
    await testSearchFunctionality();
    await testContentAccessRestriction();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📊 Test Summary:');
    console.log(`✅ Tokens obtained: ${Object.keys(tokens).length}`);
    console.log(`✅ User IDs obtained: ${Object.keys(userIds).length}`);
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run the tests
runAllTests();
