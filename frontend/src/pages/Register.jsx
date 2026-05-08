import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student', // Default role
  });

  const { name, email, password, role } = formData;

  const navigate = useNavigate(); 
  const { register } = useAuth();

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    
    const result = await register({ name, email, password, role });

    if (result.success) {
      toast.success('Registration Successful');
      navigate('/'); 
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-600">Create Account</h1>
          <p className="mt-2 text-gray-600">Join EduSync today</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={onChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              min="6"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">I am a...</label>
            <select
              name="role"
              value={role}
              onChange={onChange}
              className="w-full px-4 py-2 mt-1 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Student">Student</option>
              <option value="Educator">Educator</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{' '}
          <span className="font-medium text-blue-600 cursor-pointer hover:underline">
            Sign in here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;