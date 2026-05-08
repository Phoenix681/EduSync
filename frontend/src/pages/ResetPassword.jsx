import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Grab the token that we sent in the email link!
  const { token } = useParams(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Hit the PUT route, passing the token in the URL and the new password in the body
      await axios.put(`/api/users/resetpassword/${token}`, { password });
      toast.success('Password reset successful! You can now log in.');
      navigate('/login'); // Send them to login with their new password
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">Create New Password</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500" 
              placeholder="Enter your new password"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;