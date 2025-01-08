import React, { useState } from 'react';
import { X, UserPlus, ArrowUpRight, Users, Bell } from 'lucide-react';
import { supabase } from '../supabaseClient';

const NotificationsModal = ({ isOpen, onClose, notifications, onNotificationRead, session }) => {
  if (!isOpen) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-5 h-5 text-blue-500" />;
      case 'tier_request':
        return <ArrowUpRight className="w-5 h-5 text-green-500" />;
      case 'group_invite':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    };
  };

  const getNotificationContent = (notification) => {
    const content = notification.content || {};
    
    switch (notification.type) {
      case 'friend_request':
        return {
          title: 'Friend Request',
          message: `${content.from_username} sent you a friend request`,
          action: (
            <div className="flex gap-2">
              <button 
                onClick={() => handleFriendRequest(notification, 'accept')}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Accept
              </button>
              <button 
                onClick={() => handleFriendRequest(notification, 'decline')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Decline
              </button>
            </div>
          )
        };
      
      case 'tier_request':
        return {
          title: 'Tier Upgrade Request',
          message: `${content.from_username} requested to be upgraded to ${content.tier_name}`,
          action: (
            <div className="flex gap-2">
              <button 
                onClick={() => handleTierRequest(notification, 'accept')}
                className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Approve
              </button>
              <button 
                onClick={() => handleTierRequest(notification, 'decline')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Decline
              </button>
            </div>
          )
        };

      case 'group_invite':
        return {
          title: 'Group Invitation',
          message: `${content.from_username} invited you to join ${content.group_name}`,
          action: (
            <div className="flex gap-2">
              <button 
                onClick={() => handleGroupInvite(notification, 'accept')}
                className="px-3 py-1 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              >
                Join
              </button>
              <button 
                onClick={() => handleGroupInvite(notification, 'decline')}
                className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Decline
              </button>
            </div>
          )
        };

      default:
        return {
          title: 'Notification',
          message: content.message || 'You have a new notification',
          action: null
        };
    }
  };

  const handleFriendRequest = async (notification, action) => {
    try {
      if (action === 'accept') {
        await supabase
          .from('friendships')
          .update({ status: 'accepted' })
          .eq('id', notification.content.friendship_id);
      }
      
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error handling friend request:', error);
    }
  };

  const handleTierRequest = async (notification, action) => {
    try {
      if (action === 'accept') {
        await supabase
          .from('friendships')
          .update({ user_tier_id: notification.content.requested_tier_id })
          .eq('id', notification.content.friendship_id);
      }
      
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error handling tier request:', error);
    }
  };

  const handleGroupInvite = async (notification, action) => {
    try {
      if (action === 'accept') {
        await supabase
          .from('group_members')
          .insert({
            group_id: notification.content.group_id,
            user_id: session.user.id,
            role: 'member'
          });
      }
      
      await markNotificationAsRead(notification.id);
    } catch (error) {
      console.error('Error handling group invite:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      onNotificationRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Notifications</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No new notifications
            </div>
          ) : (
            notifications.map(notification => {
              const { title, message, action } = getNotificationContent(notification);
              return (
                <div 
                  key={notification.id} 
                  className="p-4 border-b hover:bg-gray-50"
                >
                  <div className="flex gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{message}</p>
                      {action && (
                        <div className="mt-3">
                          {action}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal;