import React, { useState } from 'react';
import { X, Calendar, Lock, LockOpen } from 'lucide-react';
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
  existingAvailability = null
}) => {
    const [selectedEventType, setSelectedEventType] = useState(existingAvailability?.eventType || null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [eventDetails, setEventDetails] = useState({
      location: existingAvailability?.location || '',
      withWho: existingAvailability?.withWho || '',
      notes: existingAvailability?.notes || ''
    });
    const [isPrivate, setIsPrivate] = useState(existingAvailability?.isPrivate || false); // Add this

  // Date formatting helper
  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  // Get display text for selected time
  const getTimeDisplay = () => {
    if (isBulkSelect) {
      if (dateRange[0] && dateRange[1]) {
        return `${formatDate(dateRange[0])} - ${formatDate(dateRange[1])}`;
      }
      return 'Select date range';
    }
    
    if (!selectedDay) return '';
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day);
    return `${formatDate(date)} - ${selectedDay.timeSlot.charAt(0).toUpperCase() + selectedDay.timeSlot.slice(1)}`;
  };

  // Event types with their colors
  const eventTypes = [
    { id: 'available', label: 'Available', baseColor: 'bg-green-50', selectedColor: 'bg-green-100 border-green-500' },
    { id: 'traveling', label: 'Travelling', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'lunch', label: 'Lunch', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'dinner', label: 'Dinner', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'wedding', label: 'Wedding', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'event', label: 'Event', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'family', label: 'Family Time', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'work', label: 'Work', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'party', label: 'Party', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' },
    { id: 'other', label: 'Other', baseColor: 'bg-red-50', selectedColor: 'bg-red-100 border-red-500' }
  ];

  if (!isOpen) return null;

  return (
    <div 
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
  onClick={onClose}
>
  <div 
    className="bg-white rounded-lg p-4 max-w-md w-full shadow-xl transform transition-all"
    onClick={e => e.stopPropagation()}
  >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Setting availability for:
            </h3>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 mt-1"
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

        {/* Date Picker */}
{(showDatePicker || isBulkSelect) && (
  <div className="mb-4 mt-3">
    <DatePicker
      selected={isBulkSelect ? dateRange[0] : new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay?.day)}
      startDate={isBulkSelect ? dateRange[0] : null}
      endDate={isBulkSelect ? dateRange[1] : null}
      onChange={(date) => {
        if (isBulkSelect) {
          setDateRange(Array.isArray(date) ? date : [date, null]);
        } else {
          // Handle single date selection
          if (date) {
            const newDay = new Date(date).getDate();
            const newMonth = new Date(date).getMonth();
            const newYear = new Date(date).getFullYear();
            // Update selectedDay with the new date
            setSelectedDay(prev => ({
              ...prev,
              day: newDay
            }));
            // You might want to close the date picker after selection
            setShowDatePicker(false);
          }
        }
      }}
      selectsRange={isBulkSelect}
      minDate={new Date()}
      inline
      dayClassName={getDayClassName}
      calendarClassName="!border-none !shadow-lg !font-normal"
      wrapperClassName="!border-none"
      monthClassName="!m-0"
      weekClassName="!m-0"
      fixedHeight={false} 
      showPopperArrow={false}
      placeholderText={isBulkSelect ? "Select date range" : "Select date"}
    />
  </div>
)}

{/* Privacy Toggle */}
<div className="flex items-center gap-2 mb-4">
  <div className="flex items-center gap-2">
    <button
      onClick={() => setIsPrivate(!isPrivate)}
      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
    >
      {isPrivate ? (
        <Lock className="w-4 h-4" />
      ) : (
        <LockOpen className="w-4 h-4" />
      )}
      {isPrivate ? 'Private' : 'Public'}
    </button>
    <div className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${isPrivate ? 'bg-blue-600' : 'bg-gray-300'}`}
      onClick={() => setIsPrivate(!isPrivate)}
    >
      <div 
        className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
          isPrivate ? 'translate-x-4' : ''
        }`}
      />
    </div>
  </div>
</div>

        {/* Event Types Grid */}
<div className="grid grid-cols-2 gap-1.5 mt-4">
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

        {/* Additional Details */}
        <div className="space-y-4 mt-6">
          {/* Location and With Who */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where
              </label>
              <input
                type="text"
                value={eventDetails.location}
                onChange={(e) => setEventDetails({
                  ...eventDetails,
                  location: e.target.value
                })}
                className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter city"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                With Who?
              </label>
              <input
                type="text"
                value={eventDetails.withWho}
                onChange={(e) => setEventDetails({
                  ...eventDetails,
                  withWho: e.target.value
                })}
                disabled
                className="w-full p-2 text-sm border rounded-md bg-gray-50 cursor-not-allowed"
                placeholder="Coming soon..."
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Any other details?
            </label>
            <textarea
              value={eventDetails.notes}
              onChange={(e) => setEventDetails({
                ...eventDetails,
                notes: e.target.value
              })}
              className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add additional details for you and your friends..."
              rows={3}
            />
          </div>
        </div>

        {/* Action Buttons */}
<div className="flex gap-3 mt-6">
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
    onClick={() => onSave({ 
      eventType: selectedEventType, 
      ...eventDetails,
      isPrivate 
    })}
    className="flex-1 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
    disabled={!selectedEventType}
  >
    Save
  </button>
</div>
      </div>
    </div>
  );
};

export default AvailabilityModal;