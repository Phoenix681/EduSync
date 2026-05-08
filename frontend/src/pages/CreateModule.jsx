import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const CreateModule = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic Module Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // NEW: Added 'image' to the initial slide object
  const [slides, setSlides] = useState([{ title: '', content: '', image: '' }]);
  
  // NEW: Track which specific slide is currently uploading
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[index][field] = value;
    setSlides(updatedSlides);
  };

  const addSlide = () => {
    setSlides([...slides, { title: '', content: '', image: '' }]);
  };

  const removeSlide = (index) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
  };

  // NEW: Updated to accept the specific slide 'index'
  const uploadFileHandler = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); 

    setUploadingIndex(index); // Show loading spinner only for THIS slide

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);

      // Save the Cloudinary URL directly into this specific slide's object!
      handleSlideChange(index, 'image', data.url);
      toast.success('Slide image uploaded!');
      
    } catch (error) {
      console.error(error);
      toast.error('Image upload failed');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const formattedSlides = slides.map((slide, index) => ({
        ...slide, // This now automatically includes the slide.image URL!
        order: index + 1
      }));

      const moduleData = { title, description, isPublic, slides: formattedSlides };
      
      await axios.post('/api/modules', moduleData, config);
      
      toast.success('Module created successfully!');
      navigate('/'); 
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create module');
    }
  };

  if (user?.role !== 'Educator') {
    // This can be a more elaborate "Access Denied" component later
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-12 bg-white rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
          <p className="mt-2 text-gray-600">Only users with the 'Educator' role can create modules.</p>
          <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white">Create New Module</h1>
          <p className="mt-2 text-lg text-indigo-100">Build a new learning module by adding a title, description, and slides.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Module Metadata Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Module Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                <input 
                  type="text" 
                  id="title"
                  required 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="e.g., Introduction to React"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  id="description"
                  rows="4"
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 text-gray-800 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  placeholder="A brief summary of what this module covers."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibility</label>
                <div className="flex items-center space-x-4 bg-gray-50 border border-gray-200 rounded-xl p-2">
                  <button type="button" onClick={() => setIsPublic(true)} className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isPublic ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
                    Public
                  </button>
                  <button type="button" onClick={() => setIsPublic(false)} className={`flex-1 text-center px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!isPublic ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}>
                    Draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Slides Editor Card */}
          <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <h2 className="text-xl font-bold text-gray-800">Slides</h2>
              <button 
                type="button" 
                onClick={addSlide} 
                className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-100 transition-all text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                Add Slide
              </button>
            </div>
            
            <div className="space-y-8">
              {slides.map((slide, index) => (
                <div key={index} className="p-6 bg-gray-50/80 rounded-xl border border-gray-200 relative">
                  <span className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white text-sm font-bold flex items-center justify-center rounded-full shadow-md">{index + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => removeSlide(index)}
                    className="absolute -top-3 -right-3 w-8 h-8 bg-rose-500 text-white flex items-center justify-center rounded-full shadow-md hover:bg-rose-600 transition-all"
                    title="Remove Slide"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slide Title</label>
                      <input type="text" placeholder="Slide Title" value={slide.title} onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <textarea placeholder="Slide Content" rows="5" value={slide.content} onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image (Optional)</label>
                      <div className="flex items-center space-x-4">
                        <input type="text" placeholder="Image URL will appear here" readOnly value={slide.image}
                          className="flex-grow px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                        <input type="file" id={`image-upload-${index}`} onChange={(e) => uploadFileHandler(e, index)} className="hidden" />
                        <label htmlFor={`image-upload-${index}`} className="cursor-pointer px-4 py-2 bg-white text-gray-600 font-semibold rounded-xl border border-gray-200 hover:bg-gray-100 transition-all">
                          {uploadingIndex === index ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                          ) : 'Upload'}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Submission */}
          <div className="flex justify-end pt-6">
            <button 
              type="submit"
              className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              Create Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModule;