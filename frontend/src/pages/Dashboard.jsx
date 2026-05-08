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

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium tracking-wide">Loading your workspace...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Hero / Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl font-light">
            Discover new modules, continue where you left off, and manage your learning journey all in one place.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        {/* Search & Sort Panel */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border border-gray-100">
          <div className="relative w-full md:w-1/2 lg:w-1/3">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search topics, titles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium text-gray-800 placeholder-gray-400"
            />
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-48 appearance-none pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium text-gray-700 cursor-pointer transition-all"
              >
                <option value="newest">Latest Updates</option>
                <option value="oldest">Oldest First</option>
                <option value="a-z">Alphabetical (A-Z)</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            
            <Link to="/create-module" className="hidden lg:flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 hover:shadow-md transition-all">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              New Module
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Available Modules</h2>
          <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-3 py-1 rounded-full">
            {processedModules.length} found
          </span>
        </div>

        {processedModules.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200 mt-6 shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No modules found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">We couldn't find anything matching your search criteria. Try adjusting your filters or browse all topics.</p>
            <button 
              onClick={() => setSearchTerm('')} 
              className="px-6 py-2.5 bg-indigo-50 text-indigo-700 font-medium rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 hover:cursor-default">
            {processedModules.map((module) => {
              const isSaved = bookmarks.includes(module._id);

              return (
                <div 
                  key={module._id} 
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col overflow-hidden relative transform hover:-translate-y-1"
                >
                  <div className="absolute top-4 right-4 z-10">
                    <button 
                      onClick={(e) => { e.preventDefault(); handleBookmark(module._id); }}
                      className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 transition-transform focus:outline-none ring-1 ring-black/5"
                      title={isSaved ? "Remove from bookmarks" : "Save for later"}
                    >
                      {isSaved ? (
                        <svg className="w-5 h-5 text-rose-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 hover:text-rose-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                      )}
                    </button>
                  </div>
                  
                  {/* Card top colorful accent */}
                  <div className={`h-2 w-full ${isSaved ? 'bg-rose-500' : 'bg-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity'}`}></div>

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {module.slides?.length || 0} Slides
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        Module
                      </span>
                    </div>
                  
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                      {module.title}
                    </h2>
                    
                    <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-grow leading-relaxed">
                      {module.description || "No description provided for this module."}
                    </p>
                    
                    <Link 
                      to={`/module/${module._id}`}
                      className="mt-auto w-full inline-flex justify-center items-center px-4 py-2.5 border border-indigo-100 text-sm font-medium rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      Study Now
                      <svg className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;