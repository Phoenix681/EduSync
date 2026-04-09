import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth(); // 1. Pull user state and logout function
  const navigate = useNavigate();

  // 2. Handle the logout click
  const handleLogout = () => {
    logout(); // Clears localStorage and React state
    navigate('/login'); // Sends them back to the login screen
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="container flex items-center justify-between px-4 py-4 mx-auto">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          EduSync
        </Link>

        {/* Navigation Links */}
        <ul className="flex items-center space-x-6">
          {/* 3. Conditional Rendering: If logged in, show Name & Logout. If not, show Login/Register */}
          {user ? (
            <>
              {/* NEW: Navigation Links */}
              <li>
                <Link to="/inbox" className="text-gray-600 hover:text-blue-600">Messages</Link>
              </li>
              
              {/* Only show 'Create Module' if the user is an Educator */}
              {user.role === 'Educator' && (
                <li>
                  <Link to="/my-modules" className="text-gray-600 hover:text-blue-600 font-medium">
                    My Modules
                  </Link>
                </li>
              )}

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
                <Link to="/register" className="text-gray-600 transition-colors hover:text-blue-600">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;