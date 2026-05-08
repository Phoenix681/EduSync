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

  const [moduleToDelete, setModuleToDelete] = useState(null);

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

  const confirmDelete = async () => {
    if (!moduleToDelete) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/modules/${moduleToDelete}`, config);
      
      // Remove it from the screen immediately without reloading the page
      setModules(modules.filter((module) => module._id !== moduleToDelete));
      toast.success('Module deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete module');
    } finally {
      setModuleToDelete(null);
    }
  };

  const handleDeleteClick = (id) => {
    // Open the confirmation modal instead of using window.confirm
    setModuleToDelete(id);
  };

  if (loading) return (
    <div className="flex h-screen items-start pt-32 justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-indigo-600 font-medium">Loading your modules...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white pt-12 pb-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-white">My Modules</h1>
            <p className="mt-2 text-lg text-indigo-100">Manage and update the modules you have created.</p>
          </div>
          <Link 
            to="/create-module" 
            className="flex-shrink-0 flex items-center px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Module
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        {modules.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-lg">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No modules created yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">You haven't created any learning modules. Click the button above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((module) => (
              <div 
                key={module._id} 
                className="group bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${module.isPublic ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                      {module.isPublic ? 'Public' : 'Draft'}
                    </span>
                    <div className="flex space-x-2 shrink-0">
                      <Link 
                        to={`/edit-module/${module._id}`}
                        className="p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </Link>
                      <button 
                        onClick={() => handleDeleteClick(module._id)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 bg-gray-50 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </h2>
                  <p className="text-sm text-gray-500 line-clamp-3 mb-6 flex-grow leading-relaxed">
                    {module.description}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-auto">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {module.slides?.length || 0} Slides
                    </span>
                    <Link 
                      to={`/module/${module._id}`}
                      className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      {moduleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl">
            <h2 className="mb-4 text-xl font-bold text-gray-800">Confirm Deletion</h2>
            <p className="mb-8 text-gray-600">
              Are you absolutely sure you want to delete this module? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setModuleToDelete(null)}
                className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 text-sm font-medium text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyModules;