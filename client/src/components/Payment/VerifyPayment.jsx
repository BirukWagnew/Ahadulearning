import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const VerifyPayment = () => {
  const { tx_ref } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [payment, setPayment] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const token = localStorage.getItem('token');
        const courseId = searchParams.get('course') || searchParams.get('course_id') || '';

        const res = await axios.get(`${API_BASE_URL}/api/payment/verify-payment/${tx_ref}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          params: courseId ? { course_id: courseId } : {},
        });
        setPayment(res.data);
        setStatus('success');
      } catch (error) {
        setStatus('failed');
      }
    };

    fetchPayment();
  }, [tx_ref, searchParams]);

  if (status === 'loading') return <div className="text-center mt-10 text-lg">Verifying payment...</div>;
  if (status === 'failed') return <div className="text-center mt-10 text-red-600 text-lg">Payment not found or failed to verify.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold text-center text-green-600 mb-4">✅ Payment Verified</h1>
      <div className="text-gray-700">
        <p><strong>Transaction ID:</strong> {payment.tx_ref}</p>
        <p><strong>Amount:</strong> {payment.amount} ETB</p>
        <p><strong>Status:</strong> <span className="text-green-600">{payment.status}</span></p>
        <p><strong>Student:</strong> {payment.studentId?.name}</p>
        <p><strong>Email:</strong> {payment.studentId?.email}</p>
        <p><strong>Course:</strong> {payment.courseId?.title}</p>
      </div>
    </div>
  );
};

export default VerifyPayment;
