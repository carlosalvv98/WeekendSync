import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Search, ChevronDown, Filter } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

const MultiSelect = ({ options, value, onChange, placeholder, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
      >
        <span className="truncate">
          {value.length ? `${value.length} selected` : placeholder}
        </span>
        <ChevronDown size={12} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-48 mt-1 bg-white border rounded-md shadow-lg">
          <div className="p-1">
            <div className="flex items-center px-2 py-1 border rounded">
              <Search size={12} className="text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-0.5 text-xs focus:outline-none"
                placeholder="Search..."
              />
            </div>
          </div>
          <div className="max-h-48 overflow-auto">
            {filteredOptions.map(option => (
              <label
                key={option.value}
                className="flex items-center px-2 py-1 text-xs hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => {
                    const newValue = value.includes(option.value)
                      ? value.filter(v => v !== option.value)
                      : [...value, option.value];
                    onChange(newValue);
                  }}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AvailabilityComparisonChart = ({ session }) => {
  const [filters, setFilters] = useState({
    friends: [],
    groups: [],
    eventTypes: [],
    compare: []
  });
  const [showFilters, setShowFilters] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [friends, setFriends] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const EVENT_COLORS = {
    traveling: '#93C5FD',
    dinner: '#FCA5A5',
    lunch: '#FCD34D',
    event: '#A5B4FC',
    party: '#D8B4FE',
    wedding: '#FDBA74',
    family: '#FCA5A5',
  };

  useEffect(() => {
    if (session?.user) {
      fetchFriends();
      fetchGroups();
      fetchActivityData();
    }
  }, [session]);

  useEffect(() => {
    if (session?.user) {
      fetchActivityData();
    }
  }, [filters]);

  const fetchFriends = async () => {
    try {
      const { data, error } = await supabase
        .from('friendships')
        .select('friend:profiles!friend_id(*)')
        .eq('user_id', session.user.id)
        .eq('status', 'accepted');

      if (error) throw error;
      setFriends(data.map(f => ({
        value: f.friend.id,
        label: f.friend.username
      })));
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select('group:groups(*)')
        .eq('user_id', session.user.id);

      if (error) throw error;
      setGroups(data.map(g => ({
        value: g.group.id,
        label: g.group.name
      })));
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('availability')
        .select('event_type, status, user_id')
        .eq('status', 'busy');

      // Apply filters
      if (filters.eventTypes.length > 0) {
        query = query.in('event_type', filters.eventTypes);
      }

      // First get user's data
      const userQuery = query.eq('user_id', session.user.id);
      const { data: userData, error: userError } = await userQuery;
      if (userError) throw userError;

      // Get friends' data if selected
      let friendsData = [];
      if (filters.friends.length > 0) {
        const { data: friendsActivityData, error: friendsError } = await query
          .in('user_id', filters.friends);
        if (friendsError) throw friendsError;
        friendsData = friendsActivityData;
      }

      // Process data for chart
      const processData = (data) => {
        return data.reduce((acc, event) => {
          if (event.event_type) {
            acc[event.event_type] = (acc[event.event_type] || 0) + 1;
          }
          return acc;
        }, {});
      };

      const userCounts = processData(userData);
      const friendsCounts = processData(friendsData);

      const processedData = Object.keys(EVENT_COLORS).map(type => {
        const entry = {
          name: type,
          label: type.charAt(0).toUpperCase() + type.slice(1),
          you: userCounts[type] || 0
        };

        if (filters.compare.includes('friends') && filters.friends.length > 0) {
          entry.friends = Math.round((friendsCounts[type] || 0) / filters.friends.length);
        }

        if (filters.compare.includes('average')) {
          // You could fetch this from your backend or calculate it
          entry.average = Math.round(entry.you * 0.8); // Placeholder calculation
        }

        return entry;
      }).filter(entry => 
        filters.eventTypes.length === 0 || filters.eventTypes.includes(entry.name)
      );

      setChartData(processedData);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p className="font-medium">{payload[0].payload.label}</p>
          {payload.map(item => (
            <p key={item.dataKey} className="text-gray-600">
              {item.name}: {item.value} plans
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Social Power Rankings</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-2 py-1 text-xs border rounded"
        >
          <Filter size={16} className="text-gray-600" />
        </button>
      </div>

      <div className={`${showFilters ? 'block' : 'hidden md:block'} mb-4`}>
      <div className="flex items-center gap-2 mb-4">
          <MultiSelect
            options={friends}
            value={filters.friends}
            onChange={(val) => setFilters(prev => ({ ...prev, friends: val }))}
            placeholder="Friends"
            className="w-full"
          />
          <MultiSelect
            options={groups}
            value={filters.groups}
            onChange={(val) => setFilters(prev => ({ ...prev, groups: val }))}
            placeholder="Groups"
            className="w-full"
          />
          <MultiSelect
            options={Object.keys(EVENT_COLORS).map(key => ({
              value: key,
              label: key.charAt(0).toUpperCase() + key.slice(1)
            }))}
            value={filters.eventTypes}
            onChange={(val) => setFilters(prev => ({ ...prev, eventTypes: val }))}
            placeholder="Event Types"
            className="w-full"
          />
          <MultiSelect
            options={[
              { value: 'friends', label: 'Friends' },
              { value: 'average', label: 'Average' }
            ]}
            value={filters.compare}
            onChange={(val) => setFilters(prev => ({ ...prev, compare: val }))}
            placeholder="Compare"
            className="w-full"
          />
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="label" 
              tick={{ fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
              tickSize={8}
              fontSize={11}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Legend 
            iconType="circle"
            formatter={(value) => <span style={{ color: '#000000' }}>{value}</span>}
            iconSize={10}
            wrapperStyle={{
            paddingTop: '20px'
            }}
            />
            <Bar 
              dataKey="you" 
              name="You"
              legendType="circle"
              fill="black"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={EVENT_COLORS[entry.name]} />
              ))}
            </Bar>
            {filters.compare.includes('average') && (
              <Bar dataKey="average" fill="grey" name="Average" />
            )}
            {filters.compare.includes('friends') && (
              <Bar dataKey="friends" fill="blue" name="Friends" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AvailabilityComparisonChart;