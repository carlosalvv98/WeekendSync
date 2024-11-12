import React from 'react';
import { Calendar, CalendarDays, List } from 'lucide-react';
import DarkModeSwitch from './DarkModeSwitch';

const ViewSwitcher = ({ currentView, onViewChange, darkMode, setDarkMode }) => {
  const views = [
    { id: 'month', icon: Calendar, label: 'Month' },
    { id: 'week', icon: CalendarDays, label: 'Week' },
    { id: 'list', icon: List, label: 'List' }
  ];

  return (
    <div className="flex justify-between items-center">
      <div className="inline-flex rounded-lg border border-gray-200 p-1 space-x-1">
        {views.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`
              flex items-center px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors duration-200 ease-in-out
              ${currentView === id 
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'}
            `}
          >
            <Icon size={16} className="mr-1.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ViewSwitcher;