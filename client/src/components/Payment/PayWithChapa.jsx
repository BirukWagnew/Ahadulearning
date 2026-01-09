// components/PayWithChapa.jsx
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const PayWithChapa = ({ course, user }) => {
  const handlePayment = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${API_BASE_URL}/api/payment/initiate`,
      {
        amount: course.price,
        email: user.email,
        fullName: user.name,
        courseId: course._id,
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );

    window.location.href = res.data.checkoutUrl;
  };

  return (
    <button onClick={handlePayment} className="bg-green-600 text-white px-4 py-2 rounded-lg">
      Enroll with Chapa
    </button>
  );
};

export default PayWithChapa;
