import React, { useState } from 'react';
import { Filter, Users, User, Calendar } from 'lucide-react';
import AvailabilityComparisonChart from './components/AvailabilityComparisonChart';
import TravelStatsChart from './components/SocialDistributionChart';
import GroupView from './components/GroupView';
import FriendsCalendar from './components/FriendsCalendar';
import AvailabilitySidebar from './components/AvailabilitySidebar';

const Friends = ({ session }) => {
  const [currentView, setCurrentView] = useState('friends');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  
  const [timeFilter, setTimeFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Activity Stats</h2>
          <div className="flex gap-2">
            <select 
              className="px-3 py-1.5 border rounded-lg text-sm"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="year">This Year</option>
              <option value="month">This Month</option>
            </select>
            <select 
              className="px-3 py-1.5 border rounded-lg text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="social">Social</option>
              <option value="travel">Travel</option>
            </select>
            <select 
              className="px-3 py-1.5 border rounded-lg text-sm"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            >
              <option value="all">All Locations</option>
              <option value="local">Local</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <AvailabilityComparisonChart 
              session={session}
              timeFilter={timeFilter}
              typeFilter={typeFilter}
              locationFilter={locationFilter}
            />
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <TravelStatsChart 
              session={session}
              timeFilter={timeFilter}
              typeFilter={typeFilter}
              locationFilter={locationFilter}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-2">
            <button
                onClick={() => setCurrentView('friends')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentView === 'friends' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <User size={16} />
                Friends
              </button>
              <button
                onClick={() => setCurrentView('groups')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentView === 'groups' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users size={16} />
                Groups
              </button>
              <button
                onClick={() => setCurrentView('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  currentView === 'calendar' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar size={16} />
                Calendar
              </button>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Filter size={16} />
              Filters
            </button>
          </div>

          {/* Content */}
          <div className="bg-white rounded-lg shadow">
            {currentView === 'calendar' ? (
              <FriendsCalendar 
                session={session}
                selectedFriends={selectedFriends}
              />
            ) : (
              <GroupView 
                session={session}
                currentView={currentView}
                onGroupSelect={setSelectedGroup}
                onFriendsSelect={setSelectedFriends}
              />
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
        <AvailabilitySidebar 
            session={session}
            selectedGroup={selectedGroup}
            selectedFriends={selectedFriends}
          />
        </div>
      </div>
    </div>
  );
};

export default Friends;