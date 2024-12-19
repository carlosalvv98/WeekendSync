import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Plane, Settings, Globe,
  MapPin, Users, Link as LinkIcon, 
  ClipboardList, Lock, Undo
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import { AnimatePresence, motion } from 'framer-motion';
import "react-datepicker/dist/react-datepicker.css";
import './calendarStyles.css';

const AvailabilityModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  onClear,
  isBulkSelect, 
  dateRange, 
  setDateRange, 
  getDayClassName,
  selectedDay,
  currentDate,
  setSelectedDay, 
  existingAvailability = null,
  friends = []
}) => {
  // Core state
  const [activeTab, setActiveTab] = useState('when');
  const [selectedEventType, setSelectedEventType] = useState(
    existingAvailability?.eventType || null
  );
  const [timeSlot, setTimeSlot] = useState(selectedDay?.timeSlot || 'all');
  const [privacyLevel, setPrivacyLevel] = useState(
    existingAvailability?.privacy_level || 'public'
  );
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [previousEventType, setPreviousEventType] = useState(null);

  // Event details state
  const [eventDetails, setEventDetails] = useState({
    travel_destination: existingAvailability?.travel_destination || '',
    partners: existingAvailability?.partners || [],
    event_url: existingAvailability?.event_url || '',
    private_notes: existingAvailability?.private_notes || '',
    notes: existingAvailability?.notes || '',
    restaurant_name: existingAvailability?.restaurant_name || '',
    restaurant_location: existingAvailability?.restaurant_location || '',
    event_name: existingAvailability?.event_name || '',
    event_location: existingAvailability?.event_location || '',
    wedding_location: existingAvailability?.wedding_location || '',
    is_linked_event: existingAvailability?.is_linked_event || false,
    linked_event_id: existingAvailability?.linked_event_id || null,
    attendee_count: existingAvailability?.attendee_count || 0
  });

  // Time slots with "All Day" option
  const timeSlots = [
    { id: 'all', label: 'All Day' },
    { id: 'morning', label: 'Morning' },
    { id: 'afternoon', label: 'Afternoon' },
    { id: 'night', label: 'Night' }
  ];

  // Event types with proper styling
  const eventTypes = [
    { id: 'available', label: 'Available', baseColor: 'bg-green-50', selectedColor: 'bg-green-100 border-green-500' },
    { id: 'traveling', label: 'Traveling', baseColor: 'bg-blue-50', selectedColor: 'bg-blue-100 border-blue-500' },
    { id: 'lunch', label: 'Lunch', baseColor: 'bg-orange-50', selectedColor: 'bg-orange-100 border-orange-500' },
    { id: 'dinner', label: 'Dinner', baseColor: 'bg-yellow-50', selectedColor: 'bg-yellow-100 border-yellow-500' },
    { id: 'event', label: 'Event', baseColor: 'bg-indigo-50', selectedColor: 'bg-indigo-100 border-indigo-500' },
    { id: 'wedding', label: 'Wedding', baseColor: 'bg-pink-50', selectedColor: 'bg-pink-100 border-pink-500' },
    { id: 'party', label: 'Party', baseColor: 'bg-purple-50', selectedColor: 'bg-purple-100 border-purple-500' },
    { id: 'family', label: 'Family Time', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'work', label: 'Work', baseColor: 'bg-gray-50', selectedColor: 'bg-gray-100 border-gray-500' },
    { id: 'other', label: 'Other', baseColor: 'bg-gray-50', selectedColor: 'bg-gray-100 border-gray-500' }
  ];

  // Date formatting
  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const getTimeDisplay = () => {
    if (isBulkSelect) {
      if (dateRange[0] && dateRange[1]) {
        return `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}`;
      }
      return 'Select date range';
    }
    
    if (!selectedDay) return '';
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day);
    return `${formatDate(date)}${timeSlot !== 'all' ? ` - ${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}` : ''}`;
  };

  // Dynamic form fields based on event type
  const getEventFields = () => {
    if (!selectedEventType || selectedEventType === 'available') return null;

    const commonFields = (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <ClipboardList className="w-4 h-4 inline mr-2" />
            Additional Details
          </label>
          <textarea
            value={eventDetails.notes}
            onChange={(e) => setEventDetails(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            className="w-full p-2 text-sm border rounded-md"
            placeholder="Add any notes..."
            rows={3}
          />
        </div>
      </div>
    );

    switch (selectedEventType) {
      case 'traveling':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-2" />
                Where to?
              </label>
              <input
                type="text"
                value={eventDetails.travel_destination}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  travel_destination: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md"
                placeholder="Enter destination"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Users className="w-4 h-4 inline mr-2" />
                With who?
              </label>
              <select
                value={eventDetails.partners[0] || ''}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  partners: e.target.value ? [e.target.value] : []
                }))}
                className="w-full p-2 text-sm border rounded-md"
              >
                <option value="">Choose...</option>
                <option value="create">Create Trip</option>
                <option value="suggest">Suggest Partner</option>
                <option value="alone">Alone</option>
                {friends.map(friend => (
                  <option key={friend.id} value={friend.id}>
                    {friend.username}
                  </option>
                ))}
              </select>
            </div>
            {commonFields}
          </div>
        );

      // Add other cases for different event types
      // ... (keeping the same structure from your existing modal)

      default:
        return commonFields;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold">Set Availability</h2>
              <p className="text-blue-600 mt-1 text-sm">
                {getTimeDisplay()}
              </p>
            </div>
            <button onClick={onClose}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-6">
            {[
              { id: 'when', icon: Calendar, label: 'When' },
              { id: 'status', icon: Plane, label: 'Status' },
              { id: 'details', icon: Settings, label: 'Details' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-2 py-1 text-sm font-medium ${
                  activeTab === tab.id 
                    ? 'text-blue-600 bg-blue-50 rounded-md' 
                    : 'text-gray-600'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {activeTab === 'when' && (
                <div className="space-y-4">
                  {/* Privacy Toggle */}
                  <div className="flex items-center gap-2 mb-6">
                    <button
                      onClick={() => setPrivacyLevel(prev => prev === 'private' ? 'public' : 'private')}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm ${
                        privacyLevel === 'private'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {privacyLevel === 'private' ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                      {privacyLevel === 'private' ? 'Private' : 'Public'}
                    </button>
                  </div>

                  <div className="flex gap-6">
                    {/* Time Slots */}
                    {!isBulkSelect && (
                      <div className="w-40">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Time</h3>
                        <div className="space-y-2">
                          {timeSlots.map(slot => (
                            <button
                              key={slot.id}
                              onClick={() => setTimeSlot(slot.id)}
                              className={`w-full px-3 py-2 text-sm text-left rounded-md ${
                                timeSlot === slot.id
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              {slot.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Calendar */}
                    <div className="flex-1">
                      <DatePicker
                        selected={isBulkSelect ? dateRange[0] : new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay?.day)}
                        startDate={isBulkSelect ? dateRange[0] : null}
                        endDate={isBulkSelect ? dateRange[1] : null}
                        onChange={(date) => {
                          if (isBulkSelect) {
                            setDateRange(Array.isArray(date) ? date : [date, null]);
                          } else {
                            setSelectedDay(prev => ({
                              ...prev,
                              day: new Date(date).getDate()
                            }));
                          }
                        }}
                        selectsRange={isBulkSelect}
                        minDate={new Date()}
                        inline
                        dayClassName={getDayClassName}
                        calendarClassName="!border-none !shadow-none !font-normal"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="grid grid-cols-2 gap-3">
                  {eventTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setPreviousEventType(selectedEventType);
                        setSelectedEventType(type.id);
                        setShowUndoButton(true);
                        setTimeout(() => setActiveTab('details'), 300);
                        setTimeout(() => setShowUndoButton(false), 3000);
                      }}
                      className={`
                        py-2.5 text-center rounded-md text-sm font-medium transition-colors
                        ${selectedEventType === type.id 
                          ? type.selectedColor
                          : `${type.baseColor} hover:bg-opacity-75`
                        }
                      `}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'details' && (
                <div>
                  {getEventFields()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            {showUndoButton && (
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onClick={() => {
                  setSelectedEventType(previousEventType);
                  setActiveTab('status');
                  setShowUndoButton(false);
                }}
                className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
              >
                <Undo className="w-4 h-4" />
                Undo
              </motion.button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>

              {existingAvailability && (
                <button
                  onClick={() => {
                    onClear();
                    onClose();
                  }}
                  className="px-4 py-2 text-red-600 hover:text-red-700 text-sm"
                >
                  Clear
                </button>
              )}

              <button
                onClick={() => {
                  const savedData = {
                    eventType: selectedEventType,
                    privacy_level: privacyLevel,
                    timeSlot: isBulkSelect ? 'all' : timeSlot,
                    ...eventDetails
                  };
                  onSave(savedData);
                  onClose();
                }}
                disabled={!selectedEventType || !selectedDay?.day}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors
                  ${!selectedEventType || !selectedDay?.day
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AvailabilityModal;