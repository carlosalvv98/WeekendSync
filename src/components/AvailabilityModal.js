import React, { useState, useEffect } from 'react';
import { 
  X, Calendar, Lock, LockOpen, MapPin, Users, 
  Link as LinkIcon, ClipboardList, Globe, Lock as LockIcon 
} from 'lucide-react';
import DatePicker from 'react-datepicker';
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
  friends = [] // You'll need to pass this from parent
}) => {
  // Core state
  const [selectedEventType, setSelectedEventType] = useState(
    existingAvailability?.eventType || null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [privacyLevel, setPrivacyLevel] = useState(
    existingAvailability?.privacy_level || 'public'
  );

  const [isEditMode, setIsEditMode] = useState(!existingAvailability);

  // Event details state
  const [eventDetails, setEventDetails] = useState({
    // Common fields
    travel_destination: existingAvailability?.travel_destination || '',
    partners: existingAvailability?.partners || [],
    event_url: existingAvailability?.event_url || '',
    private_notes: existingAvailability?.private_notes || '',
    notes: existingAvailability?.notes || '',
    
    // Specific event fields
    restaurant_name: existingAvailability?.restaurant_name || '',
    restaurant_location: existingAvailability?.restaurant_location || '',
    event_name: existingAvailability?.event_name || '',
    event_location: existingAvailability?.event_location || '',
    wedding_location: existingAvailability?.wedding_location || '',
    
    // Additional metadata
    is_linked_event: existingAvailability?.is_linked_event || false,
    linked_event_id: existingAvailability?.linked_event_id || null,
    attendee_count: existingAvailability?.attendee_count || 0
  });

  const eventTypes = [
    { 
      id: 'available', 
      label: 'Available',
      baseColor: 'bg-green-50',
      selectedColor: 'bg-green-100 border-green-500'
    },
    { 
      id: 'traveling', 
      label: 'Traveling',
      baseColor: 'bg-blue-50',
      selectedColor: 'bg-blue-100 border-blue-500'
    },
    { 
      id: 'lunch', 
      label: 'Lunch',
      baseColor: 'bg-orange-50',
      selectedColor: 'bg-orange-100 border-orange-500'
    },
    { 
      id: 'dinner', 
      label: 'Dinner',
      baseColor: 'bg-yellow-50',
      selectedColor: 'bg-yellow-100 border-yellow-500'
    },
    { 
      id: 'event', 
      label: 'Event',
      baseColor: 'bg-indigo-50',
      selectedColor: 'bg-indigo-100 border-indigo-500'
    },
    { 
      id: 'wedding', 
      label: 'Wedding',
      baseColor: 'bg-pink-50',
      selectedColor: 'bg-pink-100 border-pink-500'
    },
    { 
      id: 'party', 
      label: 'Party',
      baseColor: 'bg-purple-50',
      selectedColor: 'bg-purple-100 border-purple-500'
    },
    { 
      id: 'family', 
      label: 'Family Time',
      baseColor: 'bg-red-50',
      selectedColor: 'bg-red-100 border-red-500'
    },
    { 
      id: 'work', 
      label: 'Work',
      baseColor: 'bg-gray-50',
      selectedColor: 'bg-gray-100 border-gray-500'
    },
    { 
      id: 'other', 
      label: 'Other',
      baseColor: 'bg-gray-50',
      selectedColor: 'bg-gray-100 border-gray-500'
    }
  ];

  // Get dynamic fields based on event type
  const getEventFields = () => {
    if (!selectedEventType || selectedEventType === 'available') return null;

    const commonFields = (
      <div className="space-y-4">
        {/* Notes field - shown for all types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            Additional Details
          </label>
          <textarea
            value={eventDetails.notes}
            onChange={(e) => setEventDetails(prev => ({
              ...prev,
              notes: e.target.value
            }))}
            className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any notes or details..."
            rows={3}
          />
        </div>
      </div>
    );

    switch (selectedEventType) {
      case 'traveling':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Where to?
              </label>
              <input
                type="text"
                value={eventDetails.travel_destination}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  travel_destination: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter destination"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4" />
                With who?
              </label>
              <select
                value={eventDetails.partners[0] || ''}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  partners: e.target.value ? [e.target.value] : []
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

      case 'lunch':
      case 'dinner':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Where
              </label>
              <input
                type="text"
                value={eventDetails.restaurant_name}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  restaurant_name: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter restaurant/place"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Users className="w-4 h-4" />
                With who?
              </label>
              <select
                value={eventDetails.partners[0] || ''}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  partners: e.target.value ? [e.target.value] : []
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose...</option>
                <option value="create">Create Plan</option>
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

      case 'wedding':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </label>
              <input
                type="text"
                value={eventDetails.wedding_location}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  wedding_location: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter place"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who's getting married?
              </label>
              <select
                multiple
                value={eventDetails.partners}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  partners: Array.from(e.target.selectedOptions, option => option.value)
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
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

      case 'party':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                What party?
              </label>
              <input
                type="text"
                value={eventDetails.event_name}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  event_name: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter party name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Where's the party?
              </label>
              <input
                type="text"
                value={eventDetails.event_location}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  event_location: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Drop the pin!"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                Link to party
              </label>
              <input
                type="url"
                value={eventDetails.event_url}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  event_url: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Show your friends where to get tickets!"
              />
            </div>
            {commonFields}
          </div>
        );

      case 'work':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <LockIcon className="w-4 h-4" />
                Private notes
              </label>
              <textarea
                value={eventDetails.private_notes}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  private_notes: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add private notes (only visible to you)..."
                rows={3}
              />
            </div>
            {commonFields}
          </div>
        );

      case 'family':
      case 'other':
        return commonFields;

      default:
        return commonFields;
    }
  };

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
    return `${formatDate(date)} ${selectedDay.timeSlot !== 'all' ? ` - ${selectedDay.timeSlot.charAt(0).toUpperCase() + selectedDay.timeSlot.slice(1)}` : ''}`;
  };

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
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {existingAvailability ? 'Edit Availability' : 'Set Availability'}
              </h2>
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-0.5"
              >
                <Calendar size={14} />
                {getTimeDisplay()}
              </button>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
  {!isEditMode ? (
    // View Mode
    <>
      <div className={`p-4 rounded-lg ${
        selectedEventType === 'available' 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-blue-50 border border-blue-200'
      }`}>
        <p className="font-medium text-gray-800">
          {eventTypes.find(e => e.id === selectedEventType)?.label} 
          {selectedDay?.timeSlot === 'all' 
            ? ' All Day'
            : ` @ ${selectedDay?.timeSlot === 'morning' ? 'Morning' : 
                selectedDay?.timeSlot === 'afternoon' ? 'Afternoon' : 
                selectedDay?.timeSlot === 'night' ? 'Night' : ''}`
          }
        </p>

        <div className="mt-3 space-y-2">
          {eventDetails.travel_destination && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span>{eventDetails.travel_destination}</span>
            </div>
          )}
          {eventDetails.partners?.length > 0 && (
            <div className="flex items-center text-gray-600">
              <Users className="w-4 h-4 mr-2" />
              <span>{eventDetails.partners.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ')}</span>
            </div>
          )}
          {eventDetails.notes && (
            <div className="flex items-start text-gray-600">
              <ClipboardList className="w-4 h-4 mr-2 mt-1" />
              <span className="flex-1">{eventDetails.notes}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => setIsEditMode(true)}
          className="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Edit Details
       </button>
     </div>
    </>
  ) : (
    // Edit mode
  <div className="px-6 py-4 space-y-6">
          {/* Privacy Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPrivacyLevel(prev => prev === 'private' ? 'public' : 'private')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {privacyLevel === 'private' ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              {privacyLevel === 'private' ? 'Private' : 'Public'}
            </button>
            <div
              className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                privacyLevel === 'private' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
              onClick={() => setPrivacyLevel(prev => prev === 'private' ? 'public' : 'private')}
            >
              <div 
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                  privacyLevel === 'private' ? 'translate-x-4' : ''
                }`}
              />
            </div>
          </div>

          {/* Date Picker */}
          {(showDatePicker || isBulkSelect) && (
            <DatePicker
              selected={isBulkSelect ? dateRange[0] : new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay?.day)}
              startDate={isBulkSelect ? dateRange[0] : null}
              endDate={isBulkSelect ? dateRange[1] : null}
              onChange={(date) => {
                if (isBulkSelect) {
                  setDateRange(Array.isArray(date) ? date : [date, null]);
                } else if (date) {
                  setSelectedDay(prev => ({
                    ...prev,
                    day: new Date(date).getDate()
                  }));
                  setShowDatePicker(false);
                }
              }}
              selectsRange={isBulkSelect}
              minDate={new Date()}
              inline
              dayClassName={getDayClassName}
              calendarClassName="!border-none !shadow-lg !font-normal"
            />
          )}

          {/* Event Types */}
          <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
          <div className="grid grid-cols-2 gap-1.5">
              {eventTypes.map((eventType) => (
                <button
                  key={eventType.id}
                  onClick={() => setSelectedEventType(eventType.id)}
                  className={`
                    py-1.5 px-2 rounded-md text-sm font-medium transition-all text-left
                    border-2
                    ${selectedEventType === eventType.id 
                      ? eventType.selectedColor
                      : `${eventType.baseColor} border-transparent hover:border-gray-200`}
                  `}
                >
                  {eventType.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Fields */}
          {getEventFields()}
        </div>
        )}
      </div>

        {/* Footer */}
        <div className="px-6 py-2.5 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 p-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            {existingAvailability && (
              <button
                onClick={() => {
                  onClear();
                  onClose();
                }}
                className="flex-1 p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => {
                const savedData = {
                  eventType: selectedEventType,
                  privacy_level: privacyLevel,
                  ...eventDetails
                };
                onSave(savedData);
                onClose();
              }}
              className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              disabled={!selectedEventType}
            >
              {isEditMode ? 'Save' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;