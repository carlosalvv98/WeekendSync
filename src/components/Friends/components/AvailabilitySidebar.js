import React, { useState } from 'react';
import { ChevronDown, MapPin, Calendar as CalendarIcon, Users } from 'lucide-react';

const AvailabilitySidebar = ({ session, selectedGroup, selectedFriends }) => {
  const [timeFilter, setTimeFilter] = useState('weekend');
  const [locationFilter, setLocationFilter] = useState('all');

  // Mock data - will replace with real data later
  const availableFriends = [
    {
      id: 1,
      name: 'Sarah Smith',
      availability: 'All day',
      location: 'Miami, FL'
    },
    {
      id: 2,
      name: 'Mike Johnson',
      availability: 'Saturday morning',
      location: 'New York, NY'
    },
    // Add more mock data as needed
  ];

  const upcomingEvents = [
    {
      id: 1,
      name: "Alex's Wedding",
      date: '2024-12-15',
      attendees: 5
    },
    {
      id: 2,
      name: 'Miami Trip',
      date: '2024-12-20',
      attendees: 3
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-6">
      {/* Filters */}
      <div className="space-y-2">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm"
        >
          <option value="weekend">This Weekend</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>

        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="w-full p-2 border rounded-lg text-sm"
        >
          <option value="all">All Locations</option>
          <option value="local">Local Only</option>
          <option value="away">Away</option>
        </select>
      </div>

      {/* Available Friends Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Available Friends</h3>
        <div className="space-y-2">
          {availableFriends.map(friend => (
            <div key={friend.id} className="p-2 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{friend.name}</p>
                  <p className="text-sm text-gray-500">{friend.availability}</p>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin size={12} className="mr-1" />
                  {friend.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Events Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Upcoming Events</h3>
        <div className="space-y-2">
          {upcomingEvents.map(event => (
            <div key={event.id} className="p-2 border rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">{event.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <Users size={12} className="mr-1" />
                  {event.attendees} attending
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compare Schedules Section */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Compare Schedules</h3>
        <button className="w-full p-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
          Select friends to compare
        </button>
      </div>
    </div>
  );
};

export default AvailabilitySidebar;