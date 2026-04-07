import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        {/* Navigation Bar will go here later */}
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<h1 className="text-4xl font-bold text-blue-600">SlidesManager is Live!</h1>} />
            {/* We will add routes for /login, /dashboard, and /module/:id soon */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;