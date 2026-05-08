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
    return <div className="mt-20 text-xl text-center text-red-600">Access Denied. Educators only.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Create New Module</h1>
      
      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Module Metadata */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700">Module Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows="2"
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500" />
          </div>
          <div className="flex items-center">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label className="block ml-2 text-sm text-gray-900">Make this module public immediately</label>
          </div>
        </div>

        <hr className="mb-8" />

        {/* Dynamic Slides Section */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Slides</h2>
          <button type="button" onClick={addSlide} className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200">
            + Add Slide
          </button>
        </div>

        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg relative">
              {slides.length > 1 && (
                <button type="button" onClick={() => removeSlide(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                  Delete
                </button>
              )}
              <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase">Slide {index + 1}</h3>
              
              <div className="space-y-4">
                <input type="text" placeholder="Slide Title" required value={slide.title}
                  onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                
                <textarea placeholder="Slide Content..." required value={slide.content} rows="4"
                  onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md" />

                {/* NEW: Upload UI is now inside the Slide! */}
                <div className="p-4 mt-2 bg-white border border-gray-200 rounded-md">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Slide Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadFileHandler(e, index)} // Pass the index here!
                    disabled={uploadingIndex === index}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingIndex === index && <p className="mt-2 text-sm text-blue-600">Uploading to cloud...</p>}
                  
                  {slide.image && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-gray-500">Preview:</p>
                      <img src={slide.image} alt={`Slide ${index + 1} preview`} className="w-full max-w-sm rounded-lg shadow-sm" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full px-4 py-3 mt-8 text-white bg-green-600 rounded-md hover:bg-green-700">
          Publish Module
        </button>
      </form>
    </div>
  );
};

export default CreateModule;