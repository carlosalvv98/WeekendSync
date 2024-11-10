import React, { useState } from 'react';
import { Calendar as CalendarIcon, User, Users } from 'lucide-react';
import Calendar from './Calendar';

function App() {
  const [currentPage, setCurrentPage] = useState('calendar');

  return (
    <div className="h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">WeekendSync</h1>
          <div className="flex space-x-4">
            <button 
              onClick={() => setCurrentPage('calendar')}
              className={`p-2 rounded-lg ${currentPage === 'calendar' ? 'bg-blue-100' : ''}`}
            >
              <CalendarIcon size={24} />
            </button>
            <button 
              onClick={() => setCurrentPage('friends')}
              className={`p-2 rounded-lg ${currentPage === 'friends' ? 'bg-blue-100' : ''}`}
            >
              <Users size={24} />
            </button>
            <button 
              onClick={() => setCurrentPage('profile')}
              className={`p-2 rounded-lg ${currentPage === 'profile' ? 'bg-blue-100' : ''}`}
            >
              <User size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-8 p-4">
        {currentPage === 'calendar' && <Calendar />}

        {currentPage === 'friends' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Friends</h2>
            <div className="text-gray-500">Friends list coming soon...</div>
          </div>
        )}

        {currentPage === 'profile' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">My Profile</h2>
            <div className="text-gray-500">Profile settings coming soon...</div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;