import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Calendar, Plane, Settings, Globe,
  MapPin, Users, Link as LinkIcon, 
  ClipboardList, Lock, Undo
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import { AnimatePresence, motion } from 'framer-motion';
import "react-datepicker/dist/react-datepicker.css";
import './calendarStyles.css';

const MultiSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort options to show selected ones first
  const sortedOptions = [...filteredOptions].sort((a, b) => {
    const aSelected = value.includes(a.value);
    const bSelected = value.includes(b.value);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    return 0;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 text-sm border rounded-md bg-white cursor-pointer flex justify-between items-center"
      >
        <div className="flex flex-wrap gap-1">
          {value.length === 0 ? (
            <span className="text-gray-400">{placeholder}</span>
          ) : (
            value.map(val => {
              const option = options.find(opt => opt.value === val);
              return (
                <span key={val} className="bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-sm">
                  {option?.label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange(value.filter(v => v !== val));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              );
            })
          )}
        </div>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          <div className="p-2 border-b sticky top-0 bg-white">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-1 text-sm border rounded"
              placeholder="Search..."
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="p-2">
            {sortedOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  const newValue = value.includes(option.value)
                    ? value.filter(v => v !== option.value)
                    : [...value, option.value];
                  onChange(newValue);
                }}
              >
                <input
                  type="checkbox"
                  checked={value.includes(option.value)}
                  onChange={() => {}}
                  className="mr-2"
                />
                <span className="text-sm">{option.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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
  friends = [],
  activeTab,
  setActiveTab
}) => {
  // Core state
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
    { id: 'open_to_plans', label: 'Open to plans', baseColor: 'bg-green-100', selectedColor: 'bg-green-100 border-2 border-green-500 shadow-sm' },
    { id: 'traveling', label: 'Traveling', baseColor: 'bg-blue-100', selectedColor: 'bg-blue-100 border-2 border-blue-500 shadow-sm' },
    { id: 'lunch', label: 'Lunch', baseColor: 'bg-orange-100', selectedColor: 'bg-orange-100 border-2 border-orange-500 shadow-sm' },
    { id: 'dinner', label: 'Dinner', baseColor: 'bg-yellow-100', selectedColor: 'bg-yellow-100 border-2 border-yellow-500 shadow-sm' },
    { id: 'event', label: 'Event', baseColor: 'bg-indigo-100', selectedColor: 'bg-indigo-100 border-2 border-indigo-500 shadow-sm' },
    { id: 'wedding', label: 'Wedding', baseColor: 'bg-pink-100', selectedColor: 'bg-pink-100 border-2 border-pink-500 shadow-sm' },
    { id: 'party', label: 'Party', baseColor: 'bg-purple-100', selectedColor: 'bg-purple-100 border-2 border-purple-500 shadow-sm' },
    { id: 'family', label: 'Family Time', baseColor: 'bg-red-100', selectedColor: 'bg-red-100 border-2 border-red-500 shadow-sm' },
    { id: 'work', label: 'Work', baseColor: 'bg-gray-100', selectedColor: 'bg-gray-100 border-2 border-gray-500 shadow-sm' },
    { id: 'other', label: 'Other', baseColor: 'bg-gray-50', selectedColor: 'bg-gray-100 border-2 border-gray-500 shadow-sm' }
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
    if (!selectedEventType || selectedEventType === 'open_to_plans') return null;
  
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
            placeholder="Add any notes or details..."
            rows={3}
          />
        </div>
      </div>
    );
  
    switch (selectedEventType) {
      case 'traveling':
        return (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
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

            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Users className="w-4 h-4 inline mr-2" />
                With who?
              </label>
              <MultiSelect
                options={[
                  { value: 'create', label: 'Create Trip' },
                  { value: 'suggest', label: 'Suggest Partner' },
                  { value: 'alone', label: 'Alone' },
                  ...friends.map(friend => ({
                    value: friend.id,
                    label: friend.username
                  }))
                ]}
                value={eventDetails.partners || []}
                onChange={(newValue) => setEventDetails(prev => ({
                  ...prev,
                  partners: newValue
                }))}
                placeholder="Choose..."
              />
            </div>

            <div className="col-span-12 mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
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
                placeholder="Add any notes or details..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'lunch':
      case 'dinner':
        return (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <MapPin className="w-4 h-4 inline mr-2" />
                Where
              </label>
              <input
                type="text"
                value={eventDetails.restaurant_name}
                onChange={(e) => setEventDetails(prev => ({
                  ...prev,
                  restaurant_name: e.target.value
                }))}
                className="w-full p-2 text-sm border rounded-md"
                placeholder="Enter restaurant/place"
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                <Users className="w-4 h-4 inline mr-2" />
                With who?
              </label>
              <MultiSelect
                options={[
                  { value: 'create', label: 'Create Plan' },
                  { value: 'alone', label: 'Alone' },
                  ...friends.map(friend => ({
                    value: friend.id,
                    label: friend.username
                  }))
                ]}
                value={eventDetails.partners || []}
                onChange={(newValue) => setEventDetails(prev => ({
                  ...prev,
                  partners: newValue
                }))}
                placeholder="Choose..."
              />
            </div>

            <div className="col-span-12 mt-4">
              <label className="block text-sm font-medium text-gray-600 mb-1">
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
                placeholder="Add any notes or details..."
                rows={3}
              />
            </div>
          </div>
        );
  
        case 'wedding':
          return (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  value={eventDetails.wedding_location}
                  onChange={(e) => setEventDetails(prev => ({
                    ...prev,
                    wedding_location: e.target.value
                  }))}
                  className="w-full p-2 text-sm border rounded-md"
                  placeholder="Enter place"
                />
              </div>
              
              <div className="col-span-6">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  <Users className="w-4 h-4 inline mr-2" />
                  Event
                </label>
                <MultiSelect
                  options={friends.map(friend => ({
                    value: friend.id,
                    label: friend.username
                  }))}
                  value={eventDetails.wedding_couple || []}
                  onChange={(newValue) => setEventDetails(prev => ({
                    ...prev,
                    wedding_couple: newValue
                  }))}
                  placeholder="Choose who's getting married..."
                />
              </div>

              <div className="col-span-12 mt-4">
                <label className="block text-sm font-medium text-gray-600 mb-1">
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
                  placeholder="Add any notes or details..."
                  rows={3}
                />
              </div>
            </div>
          );
    
          case 'event':
            return (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventDetails.event_location}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      event_location: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="Enter place"
                  />
                </div>
          
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Event
                  </label>
                  <input
                    type="text"
                    value={eventDetails.event_name}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      event_name: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="What's the event?"
                  />
                </div>
          
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Link to event
                  </label>
                  <input
                    type="url"
                    value={eventDetails.event_url}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      event_url: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="Show your friends where to get tickets!"
                  />
                </div>
          
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
              </div>
            );
          
          case 'party':
            return (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    What party?
                  </label>
                  <input
                    type="text"
                    value={eventDetails.event_name}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      event_name: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="Enter party name"
                  />
                </div>
          
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Where's the party?
                  </label>
                  <input
                    type="text"
                    value={eventDetails.event_location}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      event_location: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="Drop the pin!"
                  />
                </div>
          
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    <LinkIcon className="w-4 h-4 inline mr-2" />
                    Link to party
                  </label>
                  <input
                    type="url"
                    value={eventDetails.event_url}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      event_url: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="Show your friends where to get tickets!"
                  />
                </div>
          
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
              </div>
            );
          
          case 'family':
            return (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
              </div>
            );
          
          case 'work':
            return (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Private notes
                  </label>
                  <textarea
                    value={eventDetails.private_notes}
                    onChange={(e) => setEventDetails(prev => ({
                      ...prev,
                      private_notes: e.target.value
                    }))}
                    className="w-full p-2 text-sm border rounded-md"
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
          
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
              </div>
            );
          
          case 'other':
            return (
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
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
                    placeholder="Add any notes or details..."
                    rows={3}
                  />
                </div>
              </div>
            );
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
  className="bg-white rounded-lg shadow-xl w-[600px] mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4">
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
          <div className="relative flex gap-1 mt-6">
            {[
              { id: 'when', icon: Calendar, label: 'When' },
              { id: 'status', icon: Plane, label: 'Status' },
              { id: 'details', icon: Settings, label: 'Details' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  // Check if button should be clickable
                  if (tab.id === 'details' && (!selectedDay || !selectedEventType)) {
                    return; // Do nothing if conditions aren't met
                  }
                  if (tab.id === 'status' && !selectedDay && !isBulkSelect) {
                    return; // Do nothing if conditions aren't met
                  }
                  setActiveTab(tab.id);
                }}
                className={`
                  flex items-center gap-2 px-4 py-2 text-sm font-medium
                  border-t border-l border-r rounded-t-lg relative
                  transition-all duration-200
                  ${activeTab === tab.id 
                    ? 'bg-white text-blue-600 border-gray-200 -mb-px' 
                    : 'text-gray-600 bg-gray-50 border-transparent hover:bg-gray-100'
                  }
                  ${tab.id === 'status' && !selectedDay && !isBulkSelect ? 'opacity-50 cursor-not-allowed' : ''}
                  ${tab.id === 'details' && (!selectedDay || !selectedEventType) ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 h-[350px] overflow-y-auto">
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
                  <div className="mb-6">
                    <div className="flex items-center gap-2">
                      {privacyLevel === 'private' ? (
                        <>
                          <Lock className="w-4 h-4 text-gray-600" />
                          <span className="text-sm text-gray-600">Private</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-600">Public</span>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => setPrivacyLevel(prev => prev === 'private' ? 'public' : 'private')}
                        className="relative inline-flex h-6 w-11 items-center rounded-full"
                        style={{
                          backgroundColor: privacyLevel === 'private' ? '#E5E7EB' : '#3B82F6'
                        }}
                      >
                        <span className="sr-only">Toggle privacy</span>
                        <span
                          className={`${
                            privacyLevel === 'private' ? 'translate-x-1' : 'translate-x-6'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                        />
                      </button>
                    </div>
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
                    <div className="flex-1 flex items-center justify-center">
                      <div className="transform scale-125" style={{ marginLeft: isBulkSelect ? '1' : '-50px', marginTop: '-50px' }}>
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
                        
                        if (type.id === 'open_to_plans') {
                          // Auto save for "Open to plans"
                          const savedData = {
                            eventType: type.id,
                            privacy_level: privacyLevel,
                            timeSlot: isBulkSelect ? 'all' : timeSlot,
                          };
                          onSave(savedData);
                          onClose();
                        } else {
                          // Normal flow for other statuses
                          setShowUndoButton(true);
                          setTimeout(() => setActiveTab('details'), 300);
                          setTimeout(() => setShowUndoButton(false), 3000);
                        }
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