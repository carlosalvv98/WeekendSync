import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Users, Shield } from 'lucide-react';
import Calendar from './Calendar';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import Profile from './components/Profile';
import AdminDashboard from './components/Admin/AdminDashboard';


function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('calendar');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkIfAdmin(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkIfAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkIfAdmin = async (userId) => {
    try {
      console.log('Checking admin status for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
          
      if (error) {
        console.error('Admin check error:', error);
        throw error;
      }
      console.log('Admin check result:', data);
      setIsAdmin(data.is_admin);
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

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

  {isAdmin && (
    <button 
      onClick={() => setCurrentPage('admin')}
      className={`p-2 rounded-lg ${currentPage === 'admin' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
    >
      <Shield size={24} className="text-gray-600" />
    </button>
  )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-4 p-4">
        {currentPage === 'calendar' && <Calendar />}
        {currentPage === 'friends' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Friends</h2>
            <div className="text-gray-600">Friends list coming soon...</div>
          </div>
        )}
        {currentPage === 'profile' && <Profile session={session} />}
        {currentPage === 'admin' && isAdmin && <AdminDashboard session={session} />}
        </main>
    </div>
  );
}

export default App;