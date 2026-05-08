import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Define paths where the Navbar should be hidden
  const noNavPaths = ['/login', '/register', '/forgot-password'];
  
  // Check if the current path starts with any of the noNavPaths
  // This handles dynamic routes like /reset-password/:token
  const hideNavbar = noNavPaths.some(path => location.pathname.startsWith(path.replace('/:token', '')));

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
    </>
  );
};

export default Layout;
