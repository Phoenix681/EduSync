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
      } catch (error) {
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

  if (loading) return <div className="mt-20 text-xl text-center text-gray-500">Loading module editor...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Edit Module</h1>
      
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
            <label className="block ml-2 text-sm text-gray-900">Module is Public</label>
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

                {/* THE FIX: The Image Upload UI ported over from CreateModule */}
                <div className="p-4 mt-2 bg-white border border-gray-200 rounded-md">
                  <label className="block mb-2 text-sm font-medium text-gray-700">Slide Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => uploadFileHandler(e, index)}
                    disabled={uploadingIndex === index}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {uploadingIndex === index && <p className="mt-2 text-sm text-blue-600">Uploading to cloud...</p>}
                  
                  {/* Show the existing image or the newly uploaded preview */}
                  {slide.image && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm text-gray-500">Current Image:</p>
                      <img src={slide.image} alt={`Slide ${index + 1} preview`} className="w-full max-w-sm rounded-lg shadow-sm" />
                      
                      {/* Optional: Add a quick button to clear/remove the image from the slide entirely */}
                      <button 
                        type="button" 
                        onClick={() => handleSlideChange(index, 'image', '')}
                        className="mt-2 text-sm text-red-500 hover:underline"
                      >
                        Remove Image
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full px-4 py-3 mt-8 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Update Module
        </button>
      </form>
    </div>
  );
};

export default EditModule;