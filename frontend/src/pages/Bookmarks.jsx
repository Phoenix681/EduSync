import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Bookmarks = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookmarks = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Hit our new backend route!
        const { data } = await axios.get('/api/users/bookmarks', config);
        setModules(data);
      } catch{
        toast.error('Failed to load bookmarks');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user, navigate]);

  const removeBookmark = async (moduleId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/users/bookmarks/${moduleId}`, {}, config);
      
      // Remove it from the screen instantly
      setModules(modules.filter(mod => mod._id !== moduleId));
      
      // Update global state
      const updatedUser = { ...user, bookmarkedModules: data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Removed from bookmarks');
    } catch{
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) return <div className="mt-20 text-center text-gray-500">Loading saved modules...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Bookmarks</h1>

      {modules.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">You haven't saved any modules yet.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            Explore Modules
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div key={module._id} className="p-6 relative transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md flex flex-col h-full">
              
              {/* Un-bookmark Button */}
              <button 
                onClick={() => removeBookmark(module._id)}
                className="absolute top-4 right-4 text-2xl transition-transform hover:scale-110"
                title="Remove from bookmarks"
              >
                ❤️
              </button>

              <div className="grow pr-8">
                <h2 className="text-xl font-bold text-gray-800">{module.title}</h2>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{module.description}</p>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  {module.slides?.length || 0} Slides
                </span>
                <Link 
                  to={`/module/${module._id}`}
                  className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  View Module
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;