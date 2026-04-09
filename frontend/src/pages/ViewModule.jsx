import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ViewModule = () => {
  const { id } = useParams(); // 1. Grab the module ID from the URL (e.g., /module/12345)
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0); // 2. Track which slide we are looking at
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchModule = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.get(`/api/modules/${id}`, config);
        setModule(response.data);
        setLoading(false);
      } catch {
        toast.error('Failed to load module');
        navigate('/'); // Send them back if it fails
      }
    };

    fetchModule();
  }, [id, user, navigate]);

  if (loading) {
    return <div className="mt-20 text-xl text-center text-gray-500">Loading presentation...</div>;
  }

  // Helper functions for the Next/Prev buttons
  const nextSlide = () => {
    if (activeSlide < module.slides.length - 1) setActiveSlide(activeSlide + 1);
  };
  const prevSlide = () => {
    if (activeSlide > 0) setActiveSlide(activeSlide - 1);
  };

  return (
    <div className="max-w-4xl mx-auto mt-4">
      {/* Top Header */}
      <div className="mb-6">
        <Link to="/" className="text-sm text-blue-600 hover:underline">&larr; Back to Dashboard</Link>
        <div className="flex items-center justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{module.title}</h1>
            <p className="text-gray-600">By {module.educator.name}</p>
          </div>
          
          {/* NEW: Chat Button. Only show it if the logged-in user IS NOT the educator */}
          {user._id !== module.educator._id && (
            <Link 
              to={`/chat/${module.educator._id}`}
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Message Educator
            </Link>
          )}
        </div>
      </div>

      {/* The Slide Viewer */}
      {module.slides && module.slides.length > 0 ? (
        <div className="flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg min-h-400">
          
          {/* Slide Progress Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <span className="text-sm font-medium text-gray-600">
              Slide {activeSlide + 1} of {module.slides.length}
            </span>
          </div>

          {/* Slide Content */}
          <div className="grow p-8 md:p-12">
            <h2 className="mb-6 text-2xl font-bold text-blue-700">
              {module.slides[activeSlide].title}
            </h2>
            <p className="text-lg leading-relaxed text-gray-700 whitespace-pre-wrap">
              {module.slides[activeSlide].content}
            </p>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 rounded-b-lg bg-gray-50">
            <button
              onClick={prevSlide}
              disabled={activeSlide === 0}
              className={`px-4 py-2 font-medium rounded-md ${
                activeSlide === 0 ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <button
              onClick={nextSlide}
              disabled={activeSlide === module.slides.length - 1}
              className={`px-4 py-2 font-medium rounded-md ${
                activeSlide === module.slides.length - 1 ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-white bg-blue-600 hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>

        </div>
      ) : (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg">
          <p className="text-gray-500">This module has no slides yet.</p>
        </div>
      )}
    </div>
  );
};

export default ViewModule;