import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Users } from 'lucide-react';
import Calendar from './Calendar';

if (
  localStorage.theme === 'dark' || 
  (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
) {
  document.documentElement.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
}

function App() {
  const [currentPage, setCurrentPage] = useState('calendar');

  return (
    <div className="h-screen bg-gray-100">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">WeekendSync</h1>
            <div className="flex space-x-4">
            <button 
  onClick={() => setCurrentPage('calendar')}
  className={`p-2 rounded-lg ${currentPage === 'calendar' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
>
  <CalendarIcon size={24} className="text-gray-600" />
</button>

<button 
  onClick={() => setCurrentPage('friends')}
  className={`p-2 rounded-lg ${currentPage === 'friends' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
>
  <Users size={24} className="text-gray-600" />
</button>

<button 
  onClick={() => setCurrentPage('profile')}
  className={`p-2 rounded-lg ${currentPage === 'profile' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
>
  <User size={24} className="text-gray-600" />
</button>

            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt- p-4">
      {currentPage === 'calendar' && <Calendar />}

      {currentPage === 'friends' && (
  <div className="bg-gray-800 dark:bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-2xl font-bold text-white dark:text-gray-800 mb-4">Friends</h2>
    <div className="text-gray-300 dark:text-gray-600">Friends list coming soon...</div>
  </div>
)}

{currentPage === 'profile' && (
  <div className="bg-gray-800 dark:bg-white rounded-lg shadow-lg p-6">
    <h2 className="text-2xl font-bold text-white dark:text-gray-800 mb-4">My Profile</h2>
    <div className="text-gray-300 dark:text-gray-600">Profile settings coming soon...</div>
  </div>
)}
      </main>
    </div>
  );
}

export default App;