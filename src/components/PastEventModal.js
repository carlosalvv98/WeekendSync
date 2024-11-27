import React from 'react';
import { X, MapPin, Users, Calendar, ClipboardList } from 'lucide-react';

const PastEventModal = ({ 
  isOpen, 
  onClose, 
  onClear,
  dayData,
  date,
  timeSlots = ['morning', 'afternoon', 'night']
}) => {
  if (!isOpen) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const capitalizeText = (text) => {
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatTimeSlotAvailability = (slotData, slotName) => {
    if (!slotData) return null;
    return {
      status: slotData.status,
      text: slotData.status === 'available' 
        ? `Available @ ${capitalizeText(slotName)}`
        : `${capitalizeText(slotData.eventType)} @ ${capitalizeText(slotName)}`,
      details: {
        location: slotData.location || '',
        withWho: slotData.withWho || '',
        notes: slotData.notes || ''
      }
    };
  };

  const getAvailabilitySummary = () => {
    if (Object.keys(dayData).length === 3 && 
        timeSlots.every(slot => dayData[slot]?.status === dayData.morning?.status)) {
      // Full day event
      return [{
        status: dayData.morning.status,
        text: dayData.morning.status === 'available' 
          ? "Available All Day"
          : `${capitalizeText(dayData.morning.eventType)} All Day`,
        details: {
          location: dayData.morning.location || '',
          withWho: dayData.morning.withWho || '',
          notes: dayData.morning.notes || ''
        }
      }];
    }

    // Individual time slots
    return timeSlots
      .map(slot => formatTimeSlotAvailability(dayData[slot], slot))
      .filter(Boolean);
  };

  const availabilitySummary = getAvailabilitySummary();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Past Event Details</h2>
              <p className="text-gray-500 mt-0.5 text-sm">
                <Calendar className="inline-block w-4 h-4 mr-1" />
                {formatDate(date)}
              </p>
            </div>
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
          {/* Availability Timeline */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">On this day you were...</h3>
            <div className="space-y-3">
              {availabilitySummary.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg ${
                    item.status === 'available' 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <p className={`font-medium ${
                    item.status === 'available' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {item.text}
                  </p>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{item.details.location || 'No location specified'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="w-4 h-4 mr-2" />
                      <span>{item.details.withWho || 'No attendees specified'}</span>
                    </div>
                    <div className="flex items-start text-gray-600">
                      <ClipboardList className="w-4 h-4 mr-2 mt-1" />
                      <span className="flex-1">{item.details.notes || 'No additional details'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Close
            </button>
            <button
              onClick={onClear}
              className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Clear This Day
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PastEventModal;