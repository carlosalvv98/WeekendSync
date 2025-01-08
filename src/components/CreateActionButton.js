import React, { useState } from 'react';
import { Plus, Calendar, Plane, Utensils, PartyPopper, Heart } from 'lucide-react';

const CreateActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'event', icon: Calendar, label: 'Event' },
    { id: 'trip', icon: Plane, label: 'Trip' },
    { id: 'dining', icon: Utensils, label: 'Dining' },
    { id: 'party', icon: PartyPopper, label: 'Party' },
    { id: 'wedding', icon: Heart, label: 'Wedding' },
  ];

  const handleSelect = (actionId) => {
    setIsOpen(false);
    // For now, just show a console message
    console.log(`Selected action: ${actionId} - Coming soon!`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 px-4 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus size={16} />
        <span>Create</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 mt-2 w-48 rounded-lg shadow-lg bg-white border-2 border-gray-100 overflow-hidden z-50">
            <div className="py-1">
              {actions.map((action, index) => (
                <React.Fragment key={action.id}>
                  <button
                    onClick={() => handleSelect(action.id)}
                    className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-gray-50 transition-colors"
                  >
                    <action.icon size={18} className="text-gray-600" />
                    {action.label}
                  </button>
                  {index < actions.length - 1 && (
                    <div className="h-[1px] bg-gray-100" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateActionButton;