import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ServerError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <motion.h1 
          className="text-9xl font-bold text-[#011627]"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          500
        </motion.h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-2xl font-semibold text-gray-600 mt-4">Server Error</p>
          <p className="text-gray-500 mt-2">Oops! Something went wrong on our end.</p>
        </motion.div>
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <motion.button
            onClick={() => window.location.reload()}
            className="mr-4 px-4 py-2 border border-[#2EC4B6] text-[#2EC4B6] rounded-lg hover:bg-[#2EC4B6] hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Try Again
          </motion.button>
          <motion.button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-[#2EC4B6] text-white rounded-lg hover:bg-[#28b0a3] transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Go to Dashboard
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
} 