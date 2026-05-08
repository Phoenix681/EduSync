import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ViewModule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [module, setModule] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
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
        navigate('/');
      }
    };

    fetchModule();
  }, [id, user, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-start pt-32 justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-indigo-600 font-medium">Loading presentation...</p>
        </div>
      </div>
    );
  }

  const nextSlide = () => {
    if (activeSlide < module.slides.length - 1) setActiveSlide(activeSlide + 1);
  };
  const prevSlide = () => {
    if (activeSlide > 0) setActiveSlide(activeSlide - 1);
  };

  const isFirstSlide = activeSlide === 0;
  const isLastSlide = activeSlide === module.slides.length - 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-2">
            <Link to="/" className="flex items-center text-sm font-medium text-indigo-200 hover:text-white transition-colors">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              Back to Dashboard
            </Link>
            {user._id === module.educator._id && (
              <Link 
                to={`/edit-module/${module._id}`}
                className="flex items-center px-4 py-2 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                Edit Module
              </Link>
            )}
          </div>
          <h1 className="text-4xl font-extrabold text-white truncate">{module.title}</h1>
          <p className="mt-2 text-lg text-indigo-100">
            A presentation by <span className="font-semibold">{module.educator.name}</span>
          </p>
        </div>
      </div>

      {/* The Slide Viewer */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        {module.slides && module.slides.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-2xl flex flex-col min-h-[60vh]">
            
            {/* Slide Content */}
            <div className="flex-grow p-8 md:p-12 flex flex-col">
              <div className="flex-grow">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {module.slides[activeSlide].title}
                </h2>
                <div className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap">
                  {module.slides[activeSlide].content}
                </div>

                {module.slides[activeSlide].image && (
                  <div className="mt-8 flex justify-center">
                    <img 
                      src={module.slides[activeSlide].image} 
                      alt={module.slides[activeSlide].title} 
                      className="max-w-full max-h-[400px] object-contain rounded-lg shadow-md border border-gray-100"
                    />
                  </div>
                )}
              </div>
              
              {user._id !== module.educator._id && (
                <div className="mt-12 pt-6 border-t border-gray-100 flex items-center justify-end">
                  <Link 
                    to={`/chat/${module.educator._id}`}
                    className="flex items-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                    Message Educator
                  </Link>
                </div>
              )}
            </div>

            {/* Slide Navigation & Progress */}
            <div className="bg-gray-50/70 px-6 py-4 border-t border-gray-200 rounded-b-2xl flex items-center justify-between">
              <button 
                onClick={prevSlide} 
                disabled={isFirstSlide}
                className="flex items-center px-4 py-2 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                Prev
              </button>
              
              <div className="flex-grow mx-4">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((activeSlide + 1) / module.slides.length) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-500 text-center block mt-1">
                  Slide {activeSlide + 1} of {module.slides.length}
                </span>
              </div>

              <button 
                onClick={nextSlide} 
                disabled={isLastSlide}
                className="flex items-center px-4 py-2 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-2">This module has no slides yet.</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewModule;