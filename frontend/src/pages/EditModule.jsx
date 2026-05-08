import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const EditModule = () => {
  const { id } = useParams(); // Grab the module ID from the URL
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch the existing module data to pre-fill the form
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await axios.get(`/api/modules/${id}`, config);
        
        const mod = response.data;
        setTitle(mod.title);
        setDescription(mod.description);
        setIsPublic(mod.isPublic);
        setSlides(mod.slides || []);
        setLoading(false);
      } catch {
        toast.error('Failed to load module data');
        navigate('/my-modules');
      }
    };

    fetchModule();
  }, [id, user, navigate]);

  // Handlers for dynamic slides
  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[index][field] = value;
    setSlides(updatedSlides);
  };

  const addSlide = () => setSlides([...slides, { title: '', content: '' }]);
  
  const removeSlide = (index) => setSlides(slides.filter((_, i) => i !== index));

  // 2. Submit the UPDATE request to the Node Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const formattedSlides = slides.map((slide, index) => ({
        ...slide,
        order: index + 1
      }));

      const moduleData = { title, description, isPublic, slides: formattedSlides };
      
      // Notice we are using PUT here instead of POST!
      await axios.put(`/api/modules/${id}`, moduleData, config);
      
      toast.success('Module updated successfully!');
      navigate('/my-modules');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update module');
    }
  };

  if (loading) return <div className="mt-20 text-center text-gray-500">Loading editor...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <h1 className="mb-6 text-3xl font-bold text-gray-800">Edit Module</h1>
      
      <form onSubmit={handleSubmit} className="p-8 bg-white border border-gray-200 rounded-lg shadow-sm">
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
            <label className="block ml-2 text-sm text-gray-900">Make this module public</label>
          </div>
        </div>

        <hr className="mb-8" />

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Slides</h2>
          <button type="button" onClick={addSlide} className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded hover:bg-blue-200">
            + Add Slide
          </button>
        </div>

        <div className="space-y-6">
          {slides.map((slide, index) => (
            <div key={index} className="p-4 bg-gray-50 border border-gray-200 rounded-lg relative">
              <button type="button" onClick={() => removeSlide(index)} className="absolute top-4 right-4 text-red-500 hover:text-red-700">
                Delete
              </button>
              <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase">Slide {index + 1}</h3>
              <div className="space-y-4">
                <input type="text" placeholder="Slide Title" required value={slide.title}
                  onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md" />
                <textarea placeholder="Slide Content..." required value={slide.content} rows="4"
                  onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="w-full px-4 py-3 mt-8 text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditModule;