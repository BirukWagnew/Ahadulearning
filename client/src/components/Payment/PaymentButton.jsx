import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const PaymentButton = ({ courseId, amount, email, firstName, lastName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      const response = await axios.post(
        `${API_BASE_URL}/api/payment/initiate`,
        {
          amount,
          courseId,
          email,
          fullName,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        setError(response.data?.message || response.data?.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Payment error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'Processing...' : 'Pay with Chapa'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default PaymentButton;