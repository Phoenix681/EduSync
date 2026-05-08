import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  // Search and Sort State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // NEW: Bookmarks State (Initialize with user's saved data if it exists)
  const [bookmarks, setBookmarks] = useState(user?.bookmarkedModules || []);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchModules = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };
        const response = await axios.get('/api/modules', config);
        setModules(response.data);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [user, navigate]);

  // ==========================================
  // NEW: HANDLE BOOKMARK TOGGLE
  // ==========================================
  const handleBookmark = async (moduleId) => {
    if (!user) {
      toast.error("Please log in to save modules");
      return;
    }

    // 1. Optimistic UI Update (Change the heart instantly before the server responds)
    const isBookmarked = bookmarks.includes(moduleId);
    if (isBookmarked) {
      setBookmarks(bookmarks.filter(id => id !== moduleId));
    } else {
      setBookmarks([...bookmarks, moduleId]);
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      // 2. Hit the backend toggle route
      const { data } = await axios.put(`/api/users/bookmarks/${moduleId}`, {}, config);
      
      // 3. Sync exactly with the database response
      setBookmarks(data); 
      const updatedUser = { ...user, bookmarkedModules: data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch{
      toast.error('Failed to update bookmark');
      // If the server fails, revert the optimistic update to the real user state
      setBookmarks(user?.bookmarkedModules || []); 
    }
  };

  // FILTER & SORT LOGIC
  const processedModules = modules
    .filter((mod) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        mod.title.toLowerCase().includes(searchLower) ||
        mod.description.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'a-z') return a.title.localeCompare(b.title);
      return 0;
    });

  if (loading) return <div className="mt-20 text-center text-gray-500">Loading modules...</div>;

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">Explore Modules</h1>
        
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <input
            type="text"
            placeholder="Search by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-40 px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="a-z">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {processedModules.length === 0 ? (
        <div className="p-12 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500 text-lg">No modules found matching your search.</p>
          <button 
            onClick={() => setSearchTerm('')} 
            className="mt-4 text-blue-600 hover:underline"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {processedModules.map((module) => {
            
            // NEW: Check if this module is in our local bookmarks array
            const isSaved = bookmarks.includes(module._id);

            return (
              // Added "relative" here so the absolute-positioned heart button stays inside the card
              <div key={module._id} className="p-6 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md flex flex-col h-full relative">
                
                {/* NEW: The Bookmark Toggle Button */}
                <button 
                  onClick={() => handleBookmark(module._id)}
                  className="absolute top-4 right-4 text-2xl transition-transform hover:scale-110 focus:outline-none"
                  title={isSaved ? "Remove from bookmarks" : "Save for later"}
                >
                  {isSaved ? '❤️' : '🤍'}
                </button>

                {/* Adjusted top margin slightly so text doesn't overlap the heart icon */}
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;