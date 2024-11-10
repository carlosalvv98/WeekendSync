import React from 'react';
import { Keyboard, X } from 'lucide-react';

const ShortcutsModal = ({ isOpen, onClose, shortcuts, darkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative max-w-2xl w-full mx-4 rounded-lg shadow-lg p-6
        ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Keyboard className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full transition-colors
              ${darkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}
            `}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className={`text-sm font-medium mb-2
                ${darkMode ? 'text-gray-300' : 'text-gray-500'}
              `}>
                {section.category}
              </h3>
              <div className={`
                grid grid-cols-1 sm:grid-cols-2 gap-y-2
                ${darkMode ? 'text-gray-100' : 'text-gray-900'}
              `}>
                {section.items.map((item) => (
                  <div key={item.key} className="flex items-center">
                    <kbd className={`
                      px-2 py-1 text-xs font-semibold rounded
                      ${darkMode 
                        ? 'bg-gray-700 text-gray-200 border-gray-600' 
                        : 'bg-gray-100 text-gray-500 border-gray-200'}
                      border min-w-[2.5rem] text-center mr-2
                    `}>
                      {item.key}
                    </kbd>
                    <span className="text-sm">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;