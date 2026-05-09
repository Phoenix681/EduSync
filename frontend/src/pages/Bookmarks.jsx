import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

const Bookmarks = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, setUser } = useAuth();

  useEffect(() => {
    // 1. THE GUARD: Wait until the user and token are fully loaded from context
    if (!user || !user.token) {
      return;
    }

    // 2. THE RACE CONDITION KILLER
    let isMounted = true;

    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/users/bookmarks', config);
        
        // 3. Only update state if this is the most recent request
        if (isMounted) {
          setModules(data);
        }
      } catch {
        if (isMounted) {
          toast.error('Failed to load bookmarks');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchBookmarks();

    // 4. CLEANUP: Cancels stale requests if the component unmounts or user changes rapidly
    return () => {
      isMounted = false;
    };
  }, [user]); // Re-runs automatically when the user token finally arrives

  const removeBookmark = async (moduleId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/users/bookmarks/${moduleId}`, {}, config);
      
      // Instantly remove from UI
      setModules(modules.filter(mod => mod._id !== moduleId));
      
      // Update local storage and context to keep everything in sync
      const updatedUser = { ...user, bookmarkedModules: data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Removed from bookmarks');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) return (
    <div className="flex items-start justify-center h-screen pt-32 bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 rounded-full border-indigo-200 border-t-indigo-600 animate-spin"></div>
        <p className="mt-4 font-medium text-indigo-600">Loading saved modules...</p>
      </div>
    </div>
  );

  return (
    // Applied the min-h-[calc(100vh-64px)] fix to ensure perfect layout stretching
    <div className="flex flex-col min-h-[calc(100vh-64px)] bg-gray-50 pb-8">
      
      {/* Gradient Header - Now matching the beautiful Indigo theme */}
      <div className="px-4 pt-12 pb-24 text-white shadow-inner shrink-0 bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-800 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold">My Bookmarks</h1>
          <p className="mt-2 text-lg text-indigo-100">The learning modules you have saved for later.</p>
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl px-4 mx-auto -mt-16 sm:px-6 lg:px-8">
        {modules.length === 0 ? (
          <div className="p-16 text-center bg-white border border-gray-100 shadow-lg rounded-2xl">
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-800">No bookmarks yet</h3>
            <p className="max-w-md mx-auto mb-6 text-gray-500">You haven't saved any modules. Explore the dashboard to find something interesting!</p>
            <Link 
              to="/" 
              className="inline-flex items-center px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all"
            >
              Explore Modules
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <div key={module._id} className="flex flex-col transition-all transform bg-white border border-gray-100 shadow-lg rounded-2xl hover:-translate-y-1 hover:shadow-2xl">
                <div className="grow p-6">
                  <div className="flex items-start justify-between">
                    <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {module.slides?.length || 0} Slides
                    </span>
                    <button 
                      onClick={() => removeBookmark(module._id)}
                      className="transition-colors text-rose-500 hover:text-rose-700"
                      title="Remove from bookmarks"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path></svg>
                    </button>
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-gray-900">{module.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{module.description}</p>
                </div>
                <div className="flex items-center justify-end px-6 py-4 bg-gray-50/70 rounded-b-2xl">
                  <Link 
                    to={`/module/${module._id}`}
                    className="flex items-center px-4 py-2 text-sm font-semibold transition-all rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                  >
                    View Module
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;