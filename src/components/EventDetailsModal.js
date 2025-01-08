import React from 'react';
import { X, MapPin, Users, ClipboardList } from 'lucide-react';

const EventDetailsModal = ({
  isOpen, 
  onClose, 
  onEdit,
  existingAvailability,
  eventTypes
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              Event Details
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {Object.entries(existingAvailability || {}).map(([slot, data]) => (
            <div key={slot} className={`p-4 rounded-lg ${
              data.status === 'available'
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className="font-medium text-gray-800">
                {data.status === 'available' 
                  ? 'Available' 
                  : eventTypes.find(e => e.id === data.eventType)?.label}
                {` @ ${slot.charAt(0).toUpperCase() + slot.slice(1)}`}
              </p>
              
              <div className="mt-3 space-y-2">
                {data.travel_destination && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{data.travel_destination}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  <span>
                    {data.partners?.length > 0 
                      ? data.partners.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')
                      : 'No attendees specified'}
                  </span>
                </div>
                <div className="flex items-start text-gray-600">
                  <ClipboardList className="w-4 h-4 mr-2 mt-1" />
                  <span className="flex-1">{data.notes || 'No additional details'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-100"
            >
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Edit Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;