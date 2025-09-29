import React from 'react';
import Navbar from './components/layout/Navbar';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Navbar />
      <main className="container mx-auto p-4 md:p-6">
        <AppRoutes />
      </main>
    </div>
  );
}

export default App;