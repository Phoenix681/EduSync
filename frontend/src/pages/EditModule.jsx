import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const EditModule = () => {
  const { id } = useParams(); // Grab the module ID from the URL
  const { user } = useAuth();
  const navigate = useNavigate();

  // Basic Module Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: Track which specific slide is currently uploading
  const [uploadingIndex, setUploadingIndex] = useState(null);

  // Fetch the existing module data when the page loads
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchModule = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`/api/modules/${id}`, config);
        
        // Security Check: Only the original creator can edit this
        if (data.educator._id !== user._id) {
          toast.error('Not authorized to edit this module');
          navigate('/');
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setIsPublic(data.isPublic);
        
        // Ensure existing slides have an image property initialized so our UI doesn't break
        const fetchedSlides = data.slides.map(slide => ({
          ...slide,
          image: slide.image || '' // Default to empty string if no image exists
        }));
        
        setSlides(fetchedSlides);
      } catch{
        toast.error('Failed to load module details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
  }, [id, user, navigate]);

  // THE FIX: Our bulletproof functional state update from the Create page
  const handleSlideChange = (index, field, value) => {
    setSlides((prevSlides) => {
      return prevSlides.map((slide, i) => {
        if (i === index) {
          return { ...slide, [field]: value };
        }
        return slide;
      });
    });
  };

  const addSlide = () => {
    setSlides([...slides, { title: '', content: '', image: '' }]);
  };

  const removeSlide = (index) => {
    const updatedSlides = slides.filter((_, i) => i !== index);
    setSlides(updatedSlides);
  };

  // THE FIX: The perfectly working upload handler!
  const uploadFileHandler = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); 

    setUploadingIndex(index); 

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);

      // Save the Cloudinary URL (using secure_url since we fixed the backend!)
      handleSlideChange(index, 'image', data.secure_url || data.url); 
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
        ...slide,
        order: index + 1
      }));

      const moduleData = { title, description, isPublic, slides: formattedSlides };
      
      // Make sure we use PUT to update the existing module instead of creating a new one!
      await axios.put(`/api/modules/${id}`, moduleData, config);
      
      toast.success('Module updated successfully!');
      navigate(`/module/${id}`); // Send them to view the newly updated module
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update module');
    }
  };

  if (loading) return (
    <div className="flex h-screen items-start pt-32 justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading module editor...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold text-white">Edit Module</h1>
          <p className="mt-2 text-lg text-indigo-100">Refine and update your module's content and settings.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <form onSubmit={handleSubmit} className="space-y-8 pb-20">
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
                <div key={slide._id || index} className="p-6 bg-gray-50/80 rounded-xl border border-gray-200 relative">
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
              Update Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModule;