import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/payment`;

export const initializePayment = async (paymentData, token) => {
  try {
    const response = await axios.post(`${API_URL}/initiate`, paymentData, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return response.data;
  } catch (error) {
    console.error('Payment initialization error:', error);
    throw error;
  }
};

export const verifyPayment = async (txRef, courseId, token) => {
  try {
    const response = await axios.get(`${API_URL}/verify-payment/${txRef}`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { course_id: courseId },
    });
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};