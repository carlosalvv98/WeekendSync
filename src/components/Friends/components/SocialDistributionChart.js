import React, { useState, useRef, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
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

const SocialDistributionChart = () => {
  const [filters, setFilters] = useState({
    timeRange: [],
    friends: [],
    groups: []
  });

  const EVENT_COLORS = {
    Traveling: '#93C5FD',  // blue-300
    Dinner: '#FCA5A5',    // pink-300
    Lunch: '#FCD34D',     // yellow-300
    Event: '#A5B4FC',     // indigo-300
    Party: '#D8B4FE',     // purple-300
    Wedding: '#FDBA74',   // orange-300
    Family: '#FCA5A5',    // red-300
  };

  // Sample data showing event types distribution
  const data = [
    { name: 'Dinner', value: 30, label: 'Dinners', count: '30 plans' },
    { name: 'Lunch', value: 25, label: 'Lunch', count: '25 plans' },
    { name: 'Traveling', value: 15, label: 'Travel', count: '15 plans' },
    { name: 'Event', value: 12, label: 'Events', count: '12 plans' },
    { name: 'Party', value: 10, label: 'Parties', count: '10 plans' },
    { name: 'Wedding', value: 5, label: 'Weddings', count: '5 plans' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { label, count } = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow text-xs">
          <p className="font-medium">{label}</p>
          <p className="text-gray-600">{count}</p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 text-xs">
        {payload.map((entry, index) => (
          <li key={`item-${index}`} className="flex items-center">
            <span 
              className="w-3 h-3 rounded-full mr-2"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Activity Mix Mastery</h3>
      
      <div className="flex gap-2 mb-4">
        <MultiSelect
          options={[
            { value: 'year', label: 'This Year' },
            { value: '6months', label: 'Last 6 Months' },
            { value: '3months', label: 'Last 3 Months' },
            { value: 'month', label: 'This Month' }
          ]}
          value={filters.timeRange}
          onChange={(val) => setFilters(prev => ({ ...prev, timeRange: val }))}
          placeholder="Time Range"
        />
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
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry) => (
                <Cell 
                  key={`cell-${entry.name}`} 
                  fill={EVENT_COLORS[entry.name]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              content={<CustomLegend />}
              verticalAlign="bottom" 
              align="center"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SocialDistributionChart;