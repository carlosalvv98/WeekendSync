import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Search, ChevronDown } from 'lucide-react';

const MultiSelect = ({ options, value, onChange, placeholder }) => {
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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
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

const AvailabilityComparisonChart = () => {
  const [filters, setFilters] = useState({
    friends: [],
    groups: [],
    eventTypes: [],
    compare: []
  });

  const EVENT_COLORS = {
    traveling: '#93C5FD',  // blue-300
    dinner: '#FCA5A5',    // pink-300
    lunch: '#FCD34D',     // yellow-300
    event: '#A5B4FC',     // indigo-300
    party: '#D8B4FE',     // purple-300
    wedding: '#FDBA74',   // orange-300
    family: '#FCA5A5',    // red-300
  };

  // Sample data
  const data = [
    { 
      name: 'dinner',
      label: 'Dinners',
      you: 24, 
      average: 18, 
      friends: 22 
    },
    { 
      name: 'lunch',
      label: 'Lunch',
      you: 13, 
      average: 15, 
      friends: 18 
    },
    { 
      name: 'traveling',
      label: 'Travel',
      you: 8, 
      average: 6, 
      friends: 7 
    },
    { 
      name: 'event',
      label: 'Events',
      you: 15, 
      average: 12, 
      friends: 14 
    },
    { 
      name: 'party',
      label: 'Parties',
      you: 10, 
      average: 8, 
      friends: 12 
    }
  ];

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

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Activity Comparison</h3>

      <div className="flex gap-1 mb-4">
        <MultiSelect
          options={[
            { value: 'friend1', label: 'Sarah Smith' },
            { value: 'friend2', label: 'Mike Johnson' }
          ]}
          value={filters.friends}
          onChange={(val) => setFilters(prev => ({ ...prev, friends: val }))}
          placeholder="Friends"
        />
        <MultiSelect
          options={[
            { value: 'group1', label: 'Family' },
            { value: 'group2', label: 'College Friends' }
          ]}
          value={filters.groups}
          onChange={(val) => setFilters(prev => ({ ...prev, groups: val }))}
          placeholder="Groups"
        />
        <MultiSelect
          options={Object.keys(EVENT_COLORS).map(key => ({
            value: key,
            label: data.find(d => d.name === key)?.label || key
          }))}
          value={filters.eventTypes}
          onChange={(val) => setFilters(prev => ({ ...prev, eventTypes: val }))}
          placeholder="Event Types"
        />
        <MultiSelect
          options={[
            { value: 'friends', label: 'Friends' },
            { value: 'average', label: 'Average' }
          ]}
          value={filters.compare}
          onChange={(val) => setFilters(prev => ({ ...prev, compare: val }))}
          placeholder="Compare"
        />
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#6B7280' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280' }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Legend />
            <Bar 
              dataKey="you" 
              name="You"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={EVENT_COLORS[entry.name]} />
              ))}
            </Bar>
            {filters.compare.includes('average') && (
              <Bar dataKey="average" fill="#9CA3AF" name="Average" />
            )}
            {filters.compare.includes('friends') && (
              <Bar dataKey="friends" fill="#60A5FA" name="Friends" />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AvailabilityComparisonChart;