import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth(); // 1. Grab the logged-in user from Context
  const navigate = useNavigate();

  useEffect(() => {
    // 2. Protect the route: If no user is found, redirect to login immediately
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchModules = async () => {
      try {
        // 3. Attach the JWT token to the Axios request headers
        const config = {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        };

        const response = await axios.get('/api/modules', config);
        setModules(response.data);
        setLoading(false);
      } catch {
        setError('Failed to load modules from the server.');
        setLoading(false);
      }
    };

    fetchModules();
  }, [user, navigate]); // Re-run this effect if the user changes

  // Display a loading message while we wait for the Node backend
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-xl text-gray-500">Loading your modules...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, <span className="font-semibold text-blue-600">{user.name}</span>! Here are the available study modules.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-6 text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      {/* 4. Display the grid of modules */}
      {modules.length === 0 ? (
        <div className="p-8 text-center bg-white border border-gray-200 rounded-lg shadow-sm">
          <p className="text-gray-500">No modules are available right now. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div 
              key={module._id} 
              className="flex flex-col justify-between p-6 bg-white border border-gray-100 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div>
                <h2 className="mb-2 text-xl font-bold text-gray-800">{module.title}</h2>
                <p className="mb-4 text-sm text-gray-500">
                  By: {module.educator?.name || 'Unknown Educator'}
                </p>
                <p className="mb-4 text-gray-600 line-clamp-3">
                  {module.description}
                </p>
              </div>
              <Link 
                to={`/module/${module._id}`}
                className="block w-full px-4 py-2 mt-4 text-sm font-medium text-center text-blue-600 transition-colors border border-blue-600 rounded-md hover:bg-blue-50"
              >
                View Module
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;