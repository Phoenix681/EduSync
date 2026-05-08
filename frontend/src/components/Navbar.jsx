import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
  const { user, logout, unreadCount } = useAuth(); // 1. Pull user state and logout function
  const navigate = useNavigate();

  // 2. Handle the logout click
  const handleLogout = () => {
    logout(); // Clears localStorage and React state
    navigate('/login'); // Sends them back to the login screen
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <Link to="/" className="text-2xl font-bold text-indigo-600">
            EduSync
          </Link>

          {/* Navigation Links */}
          <ul className="flex items-center space-x-6">
            {/* 3. Conditional Rendering: If logged in, show Name & Logout. If not, show Login/Register */}
            {user ? (
              <>
                {/* NEW: Navigation Links */}
                <li className='relative'>
                  <Link to="/inbox" className="text-gray-600 hover:text-blue-600">Messages</Link>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-3 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </li>
                
                {/* Only show 'Create Module' if the user is an Educator */}
                {user.role === 'Educator' && (
                  <li>
                    <Link to="/my-modules" className="text-gray-600 hover:text-blue-600 font-medium">
                      My Modules
                    </Link>
                  </li>
                )}

                <li>
                  <Link to="/bookmarks" className="text-gray-600 hover:text-blue-600">
                    Saved Modules
                  </Link>
                </li>

                {/* Existing Profile & Logout */}
                <li className="hidden md:block text-sm font-medium text-gray-700 ml-4 border-l pl-4">
                  Hi, {user.name.split(' ')[0]}
                </li>
                <li>
                  <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 transition-colors border border-red-600 rounded-md hover:bg-red-50">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="text-gray-600 transition-colors hover:text-blue-600">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;