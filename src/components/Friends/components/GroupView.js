import React, { useState, useEffect } from 'react';
import { Plus, Users, Calendar, ChevronRight, Search } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

const GroupView = ({ session, onGroupSelect, onFriendsSelect }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchGroups();
  }, [session]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      // This is where we'll fetch groups from Supabase
      // For now, using mock data
      const mockGroups = [
        {
          id: 1,
          name: 'Family',
          memberCount: 8,
          lastActive: '2 days ago',
          commonFreeTime: 'Weekends',
          upcomingEvents: 2
        },
        {
          id: 2,
          name: 'College Friends',
          memberCount: 12,
          lastActive: '5 hours ago',
          commonFreeTime: 'Friday nights',
          upcomingEvents: 1
        },
        // Add more mock groups as needed
      ];

      setGroups(mockGroups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group.id);
    onGroupSelect?.(group);
  };

  return (
    <div className="p-6">
      {/* Header with search and create */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus size={16} />
          Create Group
        </button>
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="text-center py-8">Loading groups...</div>
      ) : (
        <div className="space-y-4">
          {groups
            .filter(group => 
              group.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(group => (
              <div
                key={group.id}
                className={`p-4 border rounded-lg hover:border-blue-200 cursor-pointer transition-colors ${
                  selectedGroup === group.id ? 'border-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleGroupClick(group)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.memberCount} members</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    {/* Quick Stats */}
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {group.commonFreeTime}
                      </div>
                      <div className="text-blue-600">
                        {group.upcomingEvents} upcoming events
                      </div>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default GroupView;