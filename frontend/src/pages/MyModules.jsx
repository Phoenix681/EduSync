import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const MyModules = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Security check: Only Educators belong here
    if (!user || user.role !== 'Educator') {
      navigate('/');
      return;
    }

    const fetchMyModules = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Assuming you have a route that gets ALL modules, or a specific /me route. 
        // We will filter on the frontend just to be safe!
        const response = await axios.get('/api/modules', config);
        
        const myContent = response.data.filter(m => m.educator._id === user._id);
        setModules(myContent);
        setLoading(false);
      } catch{
        toast.error('Failed to load your modules');
        setLoading(false);
      }
    };

    fetchMyModules();
  }, [user, navigate]);

  const handleDelete = async (id) => {
    // Always double-check before deleting data!
    if (window.confirm('Are you absolutely sure you want to delete this module? This cannot be undone.')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`/api/modules/${id}`, config);
        
        // Remove it from the screen immediately without reloading the page
        setModules(modules.filter((module) => module._id !== id));
        toast.success('Module deleted successfully');
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete module');
      }
    }
  };

  if (loading) return <div className="mt-20 text-center text-gray-500">Loading your content...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Modules</h1>
        <Link to="/create-module" className="px-4 py-2 font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
          + New Module
        </Link>
      </div>

      {modules.length === 0 ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500">You haven't created any modules yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {modules.map((module) => (
            <div key={module._id} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{module.title}</h2>
                  <span className={`inline-block px-2 py-1 mt-2 text-xs font-medium rounded-full ${module.isPublic ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {module.isPublic ? 'Public' : 'Draft / Private'}
                  </span>
                </div>
                <div className="flex space-x-3">
                  <Link 
                    to={`/edit-module/${module._id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(module._id)}
                    className="text-sm font-medium text-red-600 hover:text-red-800 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-600 line-clamp-2">{module.description}</p>
              <p className="mt-4 text-xs font-medium text-gray-400 uppercase">
                {module.slides?.length || 0} Slides
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyModules;