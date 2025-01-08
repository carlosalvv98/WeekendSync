import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, User, Users, Shield, Bell } from 'lucide-react';
import Calendar from './Calendar';
import AuthPage from './AuthPage';
import { supabase } from './supabaseClient';
import Profile from './components/Profile';
import AdminDashboard from './components/Admin/AdminDashboard';
import Friends from './components/Friends';
import NotificationsModal from './components/NotificationsModal';



function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('calendar');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkIfAdmin(session.user.id);
        checkSubscription(session.user.id);
        fetchNotifications(session.user.id);
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

  const checkSubscription = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();
  
      if (error) throw error;
      setUserSubscription(data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const fetchNotifications = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
      setNotificationCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
                onClick={() => setShowNotifications(true)}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <Bell size={24} className="text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

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

      {showNotifications && (
  <NotificationsModal
    isOpen={showNotifications}
    onClose={() => setShowNotifications(false)}
    notifications={notifications}
    onNotificationRead={(notificationId) => {
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setNotificationCount(prev => prev - 1);
    }}
    session={session}
  />
)}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto mt-4 p-4">
        {currentPage === 'calendar' && 
          <Calendar session={session} subscription={userSubscription} />}
        {currentPage === 'friends' && 
          <Friends session={session} subscription={userSubscription} />}
        {currentPage === 'profile' && 
          <Profile session={session} subscription={userSubscription} />}
        {currentPage === 'admin' && isAdmin && 
          <AdminDashboard session={session} />}
      </main>
    </div>
    
  );
}

export default App;