import React, { useState, useEffect } from 'react';
import { Plus, Users, User, Calendar, ChevronRight, Search, UserPlus } from 'lucide-react';
import { supabase } from '../../../supabaseClient';
import TierSelector from './TierSelector';

const GroupView = ({ session, currentView, onGroupSelect, onFriendsSelect }) => {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  useEffect(() => {
    if (session?.user) {
      if (currentView === 'groups') {
        fetchGroups();
      } else if (currentView === 'friends') {
        fetchFriends();
      }
    }
  }, [session, currentView]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner (
            user_id,
            role
          ),
          events:availability(
            count
          )
        `)
        .eq('group_members.user_id', session.user.id);

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setGroups([]);
    }
  };

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select(`
          *,
          friend:profiles!friend_id(
            id,
            username,
            hometown,
            avatar_url
          ),
          tier:friend_tiers(*)
        `)
        .eq('user_id', session.user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data || []);
    } catch (error) {
      console.error('Error fetching friends:', error);
      setFriends([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    setSelectedGroup(group.id);
    onGroupSelect?.(group);
  };

  const handleCreateGroup = () => {
    // To be implemented
    console.log('Create group clicked');
  };

  const handleAddFriend = () => {
    // To be implemented
    console.log('Add friend clicked');
  };

  const handleTierChange = async (friendId, tierId) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ user_tier_id: tierId })
        .eq('friend_id', friendId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      fetchFriends(); // Refresh friend list
    } catch (error) {
      console.error('Error updating tier:', error);
    }
  };

  const handleCustomPermissionsChange = async (friendId, permissions) => {
    try {
      const { error } = await supabase
        .from('friendships')
        .update({ user_custom_permissions: permissions })
        .eq('friend_id', friendId)
        .eq('user_id', session.user.id);

      if (error) throw error;
      fetchFriends(); // Refresh friend list
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Search and Add/Create Button */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={`Search ${currentView === 'friends' ? 'friends' : 'groups'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {currentView === 'groups' && (
          <button 
            onClick={handleCreateGroup}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
          >
            <Plus size={14} />
            Create Group
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading {currentView}...</p>
        </div>
      ) : currentView === 'groups' ? (
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Groups Yet</h3>
              <p className="text-gray-500 mb-4">Create your first group to start planning together!</p>
              <button
                onClick={handleCreateGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Create First Group
              </button>
            </div>
          ) : (
            groups
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
                        <p className="text-sm text-gray-500">
                          {group.group_members?.length || 0} members
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))
          )}
        </div>
      ) : currentView === 'friends' ? (
        <div className="space-y-4">
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Friends Yet</h3>
              <p className="text-gray-500 mb-4">Add friends to start planning together!</p>
              <button
                onClick={handleAddFriend}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
              >
                <UserPlus size={16} />
                Add Friends
              </button>
            </div>
          ) : (
            friends
              .filter(friendship => 
                friendship.friend.username.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(friendship => (
                <div key={friendship.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {friendship.friend.avatar_url ? (
                          <img 
                            src={friendship.friend.avatar_url} 
                            alt={friendship.friend.username} 
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-blue-600 font-medium">
                            {friendship.friend.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{friendship.friend.username}</h3>
                        <p className="text-sm text-gray-500">{friendship.friend.hometown || 'No location set'}</p>
                      </div>
                    </div>

                    <TierSelector 
                      friend={friendship.friend}
                      currentTier={friendship.tier}
                      customPermissions={friendship.user_custom_permissions}
                      onTierChange={(tierId) => handleTierChange(friendship.friend.id, tierId)}
                      onCustomPermissionsChange={(permissions) => 
                        handleCustomPermissionsChange(friendship.friend.id, permissions)
                      }
                    />
                  </div>
                </div>
              ))
          )}
        </div>
      ) : null}
    </div>
  );
};

export default GroupView;