import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  Search, 
  Trash2, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Mail,
  Filter,
  Download,
  Calendar
} from 'lucide-react';

const AdminDashboard = ({ session }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [selectedUsers, setSelectedUsers] = useState([]);

  const fetchAvailabilityStats = async (userId) => {
    try {
      // Get yearly stats
      const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const yearEnd = new Date(new Date().getFullYear(), 11, 31).toISOString();
      
      const { data: yearlyData, error: yearError } = await supabase
        .from('availability')
        .select('date, status')
        .eq('user_id', userId)
        .gte('date', yearStart)
        .lte('date', yearEnd);

      if (yearError) throw yearError;

      // Get monthly stats
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString();

      const { data: monthlyData, error: monthError } = await supabase
        .from('availability')
        .select('date, status')
        .eq('user_id', userId)
        .gte('date', monthStart)
        .lte('date', monthEnd);

      if (monthError) throw monthError;

      const yearlyUnavailable = yearlyData?.filter(d => d.status === 'busy').length || 0;
      const monthlyUnavailable = monthlyData?.filter(d => d.status === 'busy').length || 0;

      return {
        yearly: `${yearlyUnavailable}/365`,
        monthly: `${monthlyUnavailable}/${new Date(monthEnd).getDate()}`
      };
    } catch (error) {
      console.error('Error fetching availability:', error);
      return { yearly: '-', monthly: '-' };
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Starting to fetch users...');
  
      // First check if you're admin
      const { data: adminCheck, error: adminError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session?.user?.id)
        .single();
  
      console.log('Admin check:', { adminCheck, adminError });
  
      if (!adminCheck?.is_admin) {
        throw new Error('Not authorized as admin');
      }
  
      // Fetch all users
      let query = supabase
        .from('profiles')
        .select('*');
  
      const { data, error } = await query;
      console.log('Raw users data:', data);
      console.log('Query error if any:', error);
  
      if (error) {
        console.error('Query error details:', error);
        throw error;
      }
  
      try {
        const usersWithStats = await Promise.all((data || []).map(async (user) => {
          console.log('Processing user:', user.id);
          const stats = await fetchAvailabilityStats(user.id);
          console.log('User stats:', stats);
          return {
            ...user,
            monthlyAvailability: stats.monthly,
            yearlyAvailability: stats.yearly
          };
        }));
  
        console.log('Final processed users:', usersWithStats);
        setUsers(usersWithStats);
      } catch (statsError) {
        console.error('Stats calculation error:', statsError);
        // Still set users even if stats fail
        setUsers(data || []);
      }
  
    } catch (error) {
      console.error('Detailed fetch error:', error);
      alert(`Error loading users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        if (error) throw error;
        fetchUsers(); // Refresh list
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Error deleting user');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
      try {
        await Promise.all(selectedUsers.map(userId => 
          supabase.auth.admin.deleteUser(userId)
        ));
        setSelectedUsers([]);
        fetchUsers();
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Error deleting users');
      }
    }
  };

  const handleExportUsers = () => {
    const csvData = users.map(user => ({
      username: user.username,
      email: user.email,
      hometown: user.hometown,
      created_at: user.created_at,
      last_login: user.last_sign_in_at
    }));

    const csvString = [
      ['Username', 'Email', 'Hometown', 'Created At', 'Last Login'],
      ...csvData.map(row => Object.values(row))
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.auth_user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.hometown?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600">Manage your platform's users</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="active">Active Users</option>
            <option value="inactive">Inactive Users</option>
          </select>

          {/* Action Buttons */}
          <button
            onClick={handleExportUsers}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={16} />
            Export CSV
          </button>

          {selectedUsers.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <Trash2 size={16} />
              Delete Selected ({selectedUsers.length})
            </button>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Joined</th>
                <th className="px-4 py-3 text-left">Last Active</th>
                <th className="px-4 py-3 text-left">Monthly Unavailable</th>
                <th className="px-4 py-3 text-left">Yearly Unavailable</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4">Loading...</td>
                </tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        {user.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.auth_user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.auth_user?.confirmed_at ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                        <CheckCircle size={14} />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                        <XCircle size={14} />
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {user.hometown || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(user.auth_user?.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.auth_user?.last_sign_in_at 
                      ? new Date(user.auth_user.last_sign_in_at).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.monthlyAvailability || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.yearlyAvailability || '-'}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.location.href = `mailto:${user.auth_user?.email}`}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Send Email"
                      >
                        <Mail size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;