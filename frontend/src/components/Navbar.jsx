import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo / Brand */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          EduSync
        </Link>

        {/* Navigation Links */}
        <ul className="flex space-x-6 items-center">
          <li>
            <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
          </li>
          <li>
            <Link to="/register" className="text-gray-600 hover:text-blue-600 transition-colors">
              Register
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;