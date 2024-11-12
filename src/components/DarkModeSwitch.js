import React from 'react';
import { Sun, Moon } from 'lucide-react';

const DarkModeSwitch = ({ darkMode, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <Moon size={16} className="text-gray-500" />
      <button
        role="switch"
        aria-checked={darkMode}
        onClick={() => onChange(!darkMode)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors focus:outline-none
          ${darkMode ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${darkMode ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
      <Sun size={16} className="text-gray-00" />
    </div>
  );
};

export default DarkModeSwitch;