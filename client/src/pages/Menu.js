import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaStar, FaShoppingCart, FaArrowLeft, FaFilter } from 'react-icons/fa';

const Menu = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart: addToCartContext } = useCart();
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Check if user has correct role
    if (user.role !== 'user') {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Sample course data with thumbnail images
  const menuItems = [
    {
      id: 1, 
      name: 'Advanced React Development', 
      price: 1499.99, 
      description: 'Master React.js with hooks, state management, and modern development practices',
      category: 'Web Development',
      rating: 4.8,
      duration: 40,
      enrolled: 1250,
      thumbnail: 'https://th.bing.com/th/id/R.8561e4df338b0e8d53c339e3d8d779f2?rik=EZx2yrdpip0WXA&pid=ImgRaw&r=0'
    },
    {
      id: 2, 
      name: 'Computer Science Fundamentals', 
      price: 1299.99, 
      description: 'Learn core computer science concepts including algorithms, data structures, and programming principles',
      category: 'Computer Science',
      rating: 4.7,
      duration: 35,
      enrolled: 980,
      thumbnail: 'https://th.bing.com/th/id/R.c2c1b4ad82ed7d6ea9d6fb8f37c2b7bd?rik=YhEhwtNF7KWKig&pid=ImgRaw&r=0'
    },
    {
      id: 3, 
      name: 'UI/UX Design Principles', 
      price: 899.99, 
      description: 'Master user interface design, user experience principles, and modern design tools',
      category: 'Design',
      rating: 4.6,
      duration: 30,
      enrolled: 750,
      thumbnail: 'https://images.unsplash.com/photo-1559028006-6486c596f4d2?w=400&h=300&fit=crop'
    },
    {
      id: 4, 
      name: 'Digital Marketing Mastery', 
      price: 999.99, 
      description: 'Learn digital marketing strategies, SEO, social media marketing, and online business growth',
      category: 'Marketing',
      rating: 4.5,
      duration: 25,
      enrolled: 1100,
      thumbnail: 'https://images.unsplash.com/photo-1460945857-d0e1c7a5e6e?w=400&h=300&fit=crop'
    },
    {
      id: 5, 
      name: 'Data Science & Machine Learning', 
      price: 1799.99, 
      description: 'Master data analysis, machine learning algorithms, and AI implementation techniques',
      category: 'Data Science',
      rating: 4.9,
      duration: 45,
      enrolled: 1500,
      thumbnail: 'https://images.unsplash.com/photo-1555949965-aea9e54a86de?w=400&h=300&fit=crop'
    },
    {
      id: 6, 
      name: 'Photography Masterclass', 
      price: 799.99, 
      description: 'Professional photography techniques, composition, and post-processing skills',
      category: 'Photography',
      rating: 4.7,
      duration: 20,
      enrolled: 650,
      thumbnail: 'https://images.unsplash.com/photo-1542038784488-697a1ff3e6c8?w=400&h=300&fit=crop'
    },
    {
      id: 7, 
      name: 'Business Strategy', 
      price: 1199.99, 
      description: 'Strategic business planning, management principles, and entrepreneurial skills',
      category: 'Business',
      rating: 4.4,
      duration: 30,
      enrolled: 890,
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop'
    },
    {
      id: 8, 
      name: 'Mobile App Development', 
      price: 1599.99, 
      description: 'Build native mobile applications for iOS and Android with modern frameworks',
      category: 'Mobile Development',
      rating: 4.6,
      duration: 50,
      enrolled: 720,
      thumbnail: 'https://images.unsplash.com/photo-1512926886174-a9f9e8b8b6?w=400&h=300&fit=crop'
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const [showCart, setShowCart] = useState(false);
  const [localCart, setLocalCart] = useState([]);

  // Get unique categories
  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  // Filter items based on search and category
  useEffect(() => {
    let result = [...menuItems];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        item => item.name.toLowerCase().includes(term) || 
                item.description.toLowerCase().includes(term)
      );
    }
    
    // Filter by category
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    setFilteredItems(result);
  }, [searchTerm, selectedCategory]);

  // Add to cart function
  const addToCart = (item) => {
    console.log('addToCart called with item:', item);
    setLocalCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      let newCart;
      if (existingItem) {
        newCart = prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        newCart = [...prevCart, { ...item, quantity: 1 }];
      }
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      console.log('Cart updated:', newCart);
      return newCart;
    });
  };

  // Clear cart function
  const clearCart = () => {
    console.log('Clearing cart');
    setLocalCart([]);
    localStorage.removeItem('cart');
  };

  const removeFromCart = (itemId) => {
    setLocalCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === itemId);
      let newCart;
      if (existingItem.quantity > 1) {
        newCart = prevCart.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        newCart = prevCart.filter(item => item.id !== itemId);
      }
      // Save to localStorage
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setLocalCart(JSON.parse(savedCart));
    }
  }, []);

  // Calculate cart total
  const cartTotal = localCart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-fidel-500 to-fidel-600 text-white py-6 px-4 sticky top-0 z-10 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="flex items-center">
              <FaArrowLeft className="mr-2" />
              <h1 className="text-2xl font-bold">Ahadu Learning</h1>
            </Link>
            <button 
              onClick={() => {
                console.log('Cart button clicked, showCart:', showCart);
                setShowCart(true);
              }}
              className="relative p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <FaShoppingCart className="text-xl" />
              {localCart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-fidel-500 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {localCart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full px-4 py-3 pl-12 pr-4 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                console.log('Category clicked:', category);
                setSelectedCategory(category);
              }}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-fidel-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              variants={item}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
              whileHover={{ y: -5 }}
            >
              <Link to={`/courses/${item.id}`} className="block h-full">
                <div className="relative h-full flex flex-col">
                  {/* Course Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        console.error('Image failed to load:', item.thumbnail);
                        e.target.src = 'https://images.unsplash.com/photo-1524178232393-3dcfa7c3893d?w=400&h=300&fit=crop'; // Fallback course image
                      }}
                      loading="lazy"
                    />
                    
                    {/* Course Overlay Info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-medium bg-white/90 text-black px-2.5 py-1 rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs font-medium bg-white/90 text-black px-2.5 py-1 rounded-full">
                        {item.duration}h
                      </span>
                    </div>
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                        <FaStar className="mr-1" />
                        {item.rating}
                      </span>
                    </div>
                  </div>
                  
                  {/* Course Content */}
                  <div className="flex-1 p-5 flex flex-col">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2 text-gray-900 group-hover:text-fidel-500 transition-colors duration-200">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {item.description}
                      </p>
                      
                      {/* Course Stats */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center text-gray-500">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {item.rating}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">
                            ({item.enrolled} enrolled)
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <span className="text-sm">
                            {item.enrolled} students
                          </span>
                        </div>
                        <div className="flex items-center text-gray-500">
                          <span className="text-sm">
                            {item.duration}h
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Course Footer */}
                    <div className="pt-3 mt-auto flex items-center justify-between border-t border-gray-200">
                      <div className="text-sm text-gray-500">
                        <span className="inline mr-1">📚</span> {item.duration}h course
                      </div>
                      <div className="font-semibold text-gray-900">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaFilter className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </main>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowCart(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaArrowLeft />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {localCart.length === 0 ? (
                  <div className="text-center py-12">
                    <FaShoppingCart className="mx-auto text-4xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-700">Your cart is empty</h3>
                    <p className="text-gray-500 mt-1">Add some courses to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {localCart.map((item) => (
                      <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.thumbnail}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-800">{item.name}</h4>
                          <p className="text-fidel-500 font-bold">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center">
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-500 hover:text-fidel-500"
                          >
                            -
                          </button>
                          <span className="mx-2 w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item)}
                            className="p-1 text-gray-500 hover:text-fidel-500"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {localCart.length > 0 && (
                <div className="border-t border-gray-200 p-4">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold text-lg">${cartTotal}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        // Handle checkout
                        console.log('Proceeding to checkout', localCart);
                        navigate('/checkout', { state: { cart: localCart, total: cartTotal } });
                      }}
                      className="flex-1 bg-fidel-500 text-white py-3 rounded-full font-medium hover:bg-fidel-600 transition-colors"
                    >
                      Proceed to Checkout (${cartTotal})
                    </button>
                    <button
                      onClick={clearCart}
                      className="px-4 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </> 
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
