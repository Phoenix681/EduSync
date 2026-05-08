import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Import Components and Pages
import Layout from './components/Layout'; // Import the new Layout component
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ViewModule from './pages/ViewModule';
import Chat from './pages/Chat';
import Inbox from './pages/Inbox';
import CreateModule from './pages/CreateModule';
import MyModules from './pages/MyModules';
import EditModule from './pages/EditModule';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Bookmarks from './pages/Bookmarks';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Toaster position="top-center" reverseOrder={false} />
        
        <Layout>
          <Routes>
            {/* The root URL '/' will show the Dashboard */}
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/module/:id" element={<ViewModule />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/chat/:targetUserId" element={<Chat />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/create-module" element={<CreateModule />} />
            <Route path="/my-modules" element={<MyModules />} />
            <Route path="/edit-module/:id" element={<EditModule />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
          </Routes>
        </Layout>
      </div>
    </BrowserRouter>
  );
}

export default App;