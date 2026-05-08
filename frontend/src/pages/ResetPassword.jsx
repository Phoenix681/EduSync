import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/users/resetpassword/${token}`, { password });
      toast.success('Password reset successful! You can now log in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner"></div>
      
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-2xl z-10">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create a New Password</h1>
          <p className="mt-2 text-gray-600">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              placeholder="••••••••"
              minLength="6"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex justify-center items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Remembered your password?{' '}
          <Link to="/login" className="font-medium text-indigo-600 cursor-pointer hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;