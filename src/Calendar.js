import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CalendarDays, Info, Copy, Trash2,} from 'lucide-react';
import DatePicker from 'react-datepicker';
import ViewSwitcher from './components/ViewSwitcher';
import AvailabilityModal from './components/AvailabilityModal';
import { supabase } from './supabaseClient';
import { 
  saveAvailability,
  fetchUserAvailability,
  deleteAvailability 
} from './availabilityService';



const Calendar = ({ session }) => {
  console.log('Current user ID:', session?.user?.id); 
  // =============== Core State ===============
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availability, setAvailability] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isBulkSelect, setIsBulkSelect] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [showTip, setShowTip] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  const [startDate, endDate] = dateRange;
  const [copySource, setCopySource] = useState(null);
  const [copyMode, setCopyMode] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDay, setDragStartDay] = useState(null);
  const [dragEndDay, setDragEndDay] = useState(null);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    travel_destination: '',
    restaurant_name: '',
    restaurant_location: '',
    event_name: '',
    event_location: '',
    notes: ''
    });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        if (selectedDays.length === 1) {
          handleCopy(selectedDays[0]);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        if (copySource) {
          handlePaste();
        }
      }
      if (e.key === 'Escape') {
        setCopyMode(false);
        setSelectedDays([]);
        setCopySource(null);
      }
    };
  
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [copySource, selectedDays]);

  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
      setDragStartDay(null);
    };
  
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, 
  []);
  // =============== Constants ===============
  const today = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const timeSlots = ['morning', 'afternoon', 'night'];
  const eventTypes = [
    { id: 'traveling', label: 'Travelling' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'event', label: 'Event' },
    { id: 'family', label: 'Family Time' },
    { id: 'work', label: 'Work' },
    { id: 'party', label: 'Party' },
    { id: 'other', label: 'Other' }
  ];

  // =============== Helper Functions ===============
  // Check if a day is today
  const isToday = (day) => {
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  // Check if a day is in the past
  const isPastDay = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date instanceof Date) {
      return date < today;
    } else {
      // If passed a day number, convert to date
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), date);
      return checkDate < today;
    }
  };
  const getDaysInRange = (start, end) => {
    const startNum = Math.min(start, end);
    const endNum = Math.max(start, end);
    return Array.from(
      { length: endNum - startNum + 1 },
      (_, i) => startNum + i
    );
  };

  // Get days in current month
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Check if all time slots in a day have same status
  const isFullDayEvent = (dayData) => {
    if (!dayData) return false;
    return timeSlots.every(slot => 
      dayData[slot]?.status === dayData.morning?.status &&
      dayData[slot]?.eventType === dayData.morning?.eventType
    );
  };

  const getDateKey = (year, month, day) => `${year}-${month + 1}-${day}`;

  const getAvailability = (year, month, day) => {
    const key = getDateKey(year, month, day);
    return availability[key];
  };

  // Get color class based on availability status
  const getColorForStatus = (dayData, isFullDay = false) => {
    if (!dayData) return 'bg-white hover:bg-gray-50';
    switch (dayData.status) {
      case 'available': return isFullDay ? 'bg-green-100' : 'bg-green-100 hover:bg-green-200';
      case 'busy': return isFullDay ? 'bg-red-100' : 'bg-red-100 hover:bg-red-200';
      default: return 'bg-white hover:bg-gray-50';
    }
  };


  const WeekView = () => {
    // Get start and end of current week
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
  
    // Create array of days for the week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  
    return (
      <div className="space-y-4">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-2">
          <div className="text-center font-medium text-gray-500">Date</div>
          {weekDays.map(date => (
  <div 
    key={date.toString()} 
    className={`text-center ${
      isToday(date.getDate()) 
        ? 'text-blue-500 border-2 border-blue-500 rounded-lg p-1' 
        : 'text-gray-500'
    }`}
    onClick={(e) => handleDayClick(date.getDate(), e)}
  >
              <div className="font-medium">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]}
              </div>
              <div className="text-sm">
                {date.getDate()} {monthNames[date.getMonth()].slice(0, 3)}
              </div>
            </div>
          ))}
        </div>
  
        {/* Time slots grid */}
        <div className="relative grid grid-cols-8 gap-2">
          {/* Time labels column */}
          <div className="space-y-2">
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className="h-20 flex items-center justify-end pr-2 text-gray-500 text-sm">
                {timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}
              </div>
            ))}
          </div>
  
{/* Days columns */}
{weekDays.map(date => {
  const dateKey = getDateKey(date.getFullYear(), date.getMonth(), date.getDate());
  const dayData = availability[dateKey];
  const isPast = date < new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const isFullDay = isFullDayEvent(dayData);

  if (isFullDay) {
    return (
      <div key={date.toString()} className="relative group">
        <div className="absolute inset-0 pointer-events-none">
          <div className="border-b border-dotted border-gray-300" style={{ top: '33.33%' }}></div>
          <div className="border-b border-dotted border-gray-300" style={{ top: '66.66%' }}></div>
        </div>
        <div
  onClick={(e) => handleDayClick(date.getDate(), e)}
  className={`
    h-64 w-full rounded text-xs relative cursor-pointer
    ${getColorForStatus(dayData?.morning, true)}
    ${isPast ? 'opacity-50 pointer-events-none' : ''}
    ${isToday(date.getDate()) ? 'border-2 border-blue-500' : ''}
  `}
>
  <div className="h-full flex items-center justify-center">
    {dayData.morning?.status === 'available' ? (
      'Available'
    ) : (
      dayData.morning?.eventType && (
        <span className="text-gray-600">
          {eventTypes.find(e => e.id === dayData.morning.eventType)?.label}
        </span>
      )
    )}
  </div>
  <div
    onClick={(e) => {
      e.stopPropagation();
      setAvailability(prev => {
        const newAvailability = { ...prev };
        delete newAvailability[dateKey];
        return newAvailability;
      });
    }}
    className="absolute top-2 right-2 p-1 rounded-full bg-white shadow opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
  >
    <span className="text-xs">×</span>
  </div>
</div>
      </div>
    );
  }

  return (
    <div key={date.toString()} className="space-y-2 relative">
    {timeSlots.map((timeSlot, index) => (
      <button
        key={timeSlot}
        onClick={(e) => handleTimeSlotClick(date.getDate(), timeSlot, e)}
        disabled={isPast}
        className={`h-20 w-full rounded text-xs ${getColorForStatus(dayData?.[timeSlot])} ${isPast ? 'opacity-50 cursor-not-allowed' : ''} ${index !== timeSlots.length - 1 ? 'border-b border-dotted border-gray-300' : ''} ${isToday(date.getDate()) ? 'border-2 border-blue-500' : ''}`}
      >
        {dayData?.[timeSlot]?.status === 'available' ? (
          'Available'
        ) : (
          dayData?.[timeSlot]?.eventType && (
            <span className="text-gray-600 truncate">
              {eventTypes.find(e => e.id === dayData[timeSlot].eventType)?.label}
            </span>
          )
        )}
      </button>
    ))}
  </div>
);
})}
        </div>
      </div>
    );
  };

// Add this after WeekView but before the main return statement
const ListView = () => {
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1).sort((a, b) => a - b);

  return (
    <div className="space-y-2">
      {days.map(day => {
        const dayData = availability[day];
        const fullDayEvent = isFullDayEvent(dayData);
        const hasAnyAvailability = dayData && Object.values(dayData).some(slot => slot?.status);

        return (
          <div 
            key={day}
            className="p-4 border rounded-lg hover:border-blue-200 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className={`font-medium ${isToday(day) ? 'text-blue-500' : ''}`}>
                {monthNames[currentDate.getMonth()]} {day}
              </div>
              {fullDayEvent && (
                <div className={`text-sm px-2 py-1 rounded ${
                  dayData.morning?.status === 'available' 
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {dayData.morning?.status === 'available' 
                    ? 'Available'
                    : eventTypes.find(e => e.id === dayData.morning?.eventType)?.label}
                </div>
              )}
            </div>
            
            {!fullDayEvent && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {timeSlots.map(timeSlot => {
                  const slotData = dayData?.[timeSlot];
                  return (
                    <div 
                      key={timeSlot}
                      className={`text-sm px-2 py-1 rounded ${
                        !slotData ? 'bg-gray-50 text-gray-500' :
                        slotData.status === 'available' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span className="font-medium">{timeSlot}: </span>
                      {!slotData ? 'No Status' :
                        slotData.status === 'available' 
                          ? 'Available'
                          : eventTypes.find(e => e.id === slotData.eventType)?.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

  // Get class name for date picker days
  const getDayClassName = (date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
      const dayData = availability[day];
      if (dayData) {
        if (isFullDayEvent(dayData)) {
          if (dayData.morning?.status === 'available') return 'bg-green-100';
          if (dayData.morning?.status === 'busy') return 'bg-red-100';
        } else {
          const hasAvailable = Object.values(dayData).some(slot => slot?.status === 'available');
          const hasBusy = Object.values(dayData).some(slot => slot?.status === 'busy');
          if (hasAvailable) return 'bg-green-50';
          if (hasBusy) return 'bg-red-50';
        }
      }
    }
    return '';
  };

  // =============== Event Handlers ===============
  const handleTimeSlotClick = (day, timeSlot, e) => {
    e?.stopPropagation();
    const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!isPastDay(clickDate)) {
      setSelectedDay({ day, timeSlot });
      setIsBulkSelect(false);
      setShowEventModal(true);
    }
  };

  const handleClearAll = async () => {
    const confirmClear = window.confirm('Are you sure you want to clear all availability?');
    if (confirmClear) {
      try {
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        
        // Delete from Supabase
        await deleteAvailability(
          session.user.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        // Update local state
        setAvailability({});
      } catch (error) {
        console.error('Error clearing availability:', error);
        alert('Failed to clear availability. Please try again.');
      }
    }
  };

  const handleDeleteTimeSlot = async (dateStr, timeSlot = null) => {
    try {
      await deleteAvailability(session.user.id, dateStr);
      
      // Update local state
      setAvailability(prev => {
        const newAvailability = { ...prev };
        if (timeSlot) {
          // Delete specific time slot
          if (newAvailability[dateStr]) {
            delete newAvailability[dateStr][timeSlot];
            // If no more time slots for this date, remove the date
            if (Object.keys(newAvailability[dateStr]).length === 0) {
              delete newAvailability[dateStr];
            }
          }
        } else {
          // Delete entire day
          delete newAvailability[dateStr];
        }
        return newAvailability;
      });
    } catch (error) {
      console.error('Error deleting availability:', error);
      alert('Failed to delete availability. Please try again.');
    }
  };

  const handleDayClick = (day, e) => {
    e?.stopPropagation();
    const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (!isPastDay(clickDate)) {
      setSelectedDay({ day, timeSlot: 'all' });
      setIsBulkSelect(false);
      setShowEventModal(true);
    }
  };

  const handleBulkSelect = () => {
    setDateRange([null, null]);
    setIsBulkSelect(true);
    setShowEventModal(true);
  };

  const handleSetAvailability = async (status, eventType = null) => {
    console.log('handleSetAvailability called with:', { status, eventType });
    try {
      console.log('Starting handleSetAvailability with:', {
        status,
        eventType,
        session,
        selectedDay,
        isBulkSelect,
        startDate,
        endDate
      });

      if (isBulkSelect && startDate && endDate) {
        console.log('Handling bulk selection');
        let currentDate = new Date(startDate);
        let newAvailability = { ...availability };
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          console.log('Processing date:', dateStr);
          
          // Save each time slot
          for (const timeSlot of timeSlots) {
            console.log('Saving time slot:', {
              userId: session?.user?.id,
              dateStr,
              timeSlot,
              status,
              eventType
            });

            await saveAvailability(
              session.user.id,
              dateStr,
              timeSlot,
              status,
              { event_type: eventType }
            );
            
            if (!newAvailability[dateStr]) {
              newAvailability[dateStr] = {};
            }
            newAvailability[dateStr][timeSlot] = {
              status,
              eventType
            };
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setAvailability(newAvailability);
      } else if (selectedDay) {
        console.log('Handling single day selection:', selectedDay);
        const { day, timeSlot } = selectedDay;
        const dateStr = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        ).toISOString().split('T')[0];

        console.log('Generated dateStr:', dateStr);
  
        if (timeSlot === 'all') {
          console.log('Handling full day');
          // Handle full day
          for (const slot of timeSlots) {
            console.log('Saving slot:', {
              userId: session?.user?.id,
              dateStr,
              slot,
              status,
              eventType
            });

            try {
              await saveAvailability(
                session.user.id,
                dateStr,
                slot,
                status,
                { event_type: eventType }
              );
            } catch (slotError) {
              console.error('Error saving slot:', slot, slotError);
              throw slotError;
            }
          }
        } else {
          console.log('Handling single time slot:', {
            userId: session?.user?.id,
            dateStr,
            timeSlot,
            status,
            eventType
          });

          // Handle single time slot
          try {
            await saveAvailability(
              session.user.id,
              dateStr,
              timeSlot,
              status,
              { event_type: eventType }
            );
          } catch (slotError) {
            console.error('Error saving single slot:', slotError);
            throw slotError;
          }
        }
  
        // Update local state
        setAvailability(prev => ({
          ...prev,
          [dateStr]: timeSlot === 'all' 
            ? timeSlots.reduce((acc, slot) => ({
                ...acc,
                [slot]: { status, eventType }
              }), {})
            : {
                ...prev[dateStr],
                [timeSlot]: { status, eventType }
              }
        }));
      }
      
      setShowEventModal(false);
      setSelectedDay(null);
      setIsBulkSelect(false);
      setDateRange([null, null]);
    } catch (error) {
      console.error('Full error details:', error);
      console.error('Error stack:', error.stack);
      alert('Failed to save availability. Please try again.');
    }
  };

  const handleCopy = (day) => {
    // Change this to use dateKey
    const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    setCopySource(dateKey);  // Store the full dateKey instead of just the day
    setCopyMode(true);
    setSelectedDays([]);
  };
  
  const handlePaste = () => {
    if (!copySource || selectedDays.length === 0) return;
  
    const sourceData = availability[copySource];  // Get data using the full dateKey
    if (!sourceData) return;
  
    const newAvailability = { ...availability };
    selectedDays.forEach(targetDay => {
      // Create dateKey for target day
      const targetDateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), targetDay);
      // Copy all data from source to target
      newAvailability[targetDateKey] = JSON.parse(JSON.stringify(sourceData));
    });
  
    setAvailability(newAvailability);
    setCopyMode(false);
    setSelectedDays([]);
    setCopySource(null);
  };
  
  
  const handleDaySelection = (day) => {
    if (!copyMode) return;
    
    setSelectedDays(prev => {
      const isSelected = prev.includes(day);
      if (isSelected) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging && dragStartDay !== null && dragEndDay !== null) {
        const daysToSelect = getDaysInRange(dragStartDay, dragEndDay);
        setSelectedDays(daysToSelect);
      }
      setIsDragging(false);
      setDragStartDay(null);
      setDragEndDay(null);
    };
  
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [isDragging, dragStartDay, dragEndDay]);

  useEffect(() => {
    const loadAvailability = async () => {
      if (!session?.user?.id) return;
      
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      try {
        const data = await fetchUserAvailability(
          session.user.id,
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        );
        
        // Convert the data to your existing availability format
        const formattedData = data.reduce((acc, item) => {
          const dateKey = item.date;
          if (!acc[dateKey]) acc[dateKey] = {};
          acc[dateKey][item.time_slot] = {
            status: item.status,
            eventType: item.event_type
          };
          return acc;
        }, {});
        
        setAvailability(formattedData);
      } catch (error) {
        console.error('Error loading availability:', error);
      }
    };
  
    loadAvailability();
  }, [currentDate, session?.user?.id]);

  // =============== Main Render ===============
  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <ViewSwitcher 
              currentView={currentView}
              onViewChange={setCurrentView}
            />
          </div>
  
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button 
                onClick={handleBulkSelect}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                className="p-2 px-4 rounded-lg bg-purple-100 hover:bg-purple-200 flex items-center gap-2"
              >
                <CalendarDays size={16} />
                <span>Bulk Select</span>
              </button>
              {showTip && (
                <div className="absolute z-10 w-64 bg-gray-800 text-white text-xs rounded p-2 -bottom-20 left-0">
                  Pro Tips:
                  <ul className="mt-1 ml-2">
                    <li>• Select a date range for bulk updates</li>
                    <li>• Click a day to set all time slots at once</li>
                    <li>• Click individual time slots for precise control</li>
                  </ul>
                </div>
              )}
            </div>
  
            <button 
              onClick={handleClearAll}
              className="p-2 px-4 rounded-lg bg-red-100 hover:bg-red-200 flex items-center gap-2"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
  
            <div className="h-6 w-px bg-gray-200"></div>
  
            {copyMode && (
              <div className="absolute top-full right-0 mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded-lg shadow z-10">
                <span className="text-sm text-gray-600">Select days to paste availability</span>
                <button 
                  onClick={handlePaste}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  Paste
                </button>
                <button 
                  onClick={() => {
                    setCopyMode(false);
                    setSelectedDays([]);
                    setCopySource(null);
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
  
            <div className="h-6 w-px bg-gray-200"></div>
            
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              ←
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="p-2 px-4 rounded-lg bg-blue-100 hover:bg-blue-200"
            >
              Today
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              →
            </button>
          </div>
        </div>
  
        {/* View Container */}
        {currentView === 'month' ? (
  <div className="grid grid-cols-7 gap-2">
    {/* Weekday headers */}
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} className="text-center font-medium text-gray-500">
        {day}
      </div>
    ))}
    
    {/* Empty cells for days before start of month */}
    {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay() }, (_, i) => (
      <div key={`empty-${i}`} className="h-32"></div>
    ))}

    {/* Calendar days */}
    {days.map(day => {
      const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayData = availability[dateKey];
      const fullDayEvent = isFullDayEvent(dayData);
      const isSelected = selectedDays.includes(day);
      const isCopySource = copySource === day;

      return (
        <div 
          key={day} 
          className={`border rounded-lg h-32 overflow-hidden flex flex-col relative group
            ${isToday(day) ? 'border-blue-500 border-2' : ''}
            ${isPastDay(day) ? 'bg-gray-50' : ''}
            ${fullDayEvent ? getColorForStatus(dayData?.morning, true) : ''}
            ${isSelected ? 'border-blue-500 border-2 ring-2 ring-blue-200' : ''}
            ${isCopySource ? 'border-green-500 border-2 ring-2 ring-green-200' : ''}
            ${copyMode ? 'cursor-pointer hover:border-blue-400' : ''}`}
          onClick={(e) => {
            if (copyMode) {
              handleDaySelection(day);
            } else {
              handleDayClick(day, e);
            }
          }}
          onMouseDown={() => {
            if (copyMode) {
              setIsDragging(true);
              setDragStartDay(day);
            }
          }}
          onMouseEnter={() => {
            if (isDragging && copyMode) {
              handleDaySelection(day);
            }
          }}
        >
          {/* Copy and Delete buttons */}
{!isPastDay(day) && !copyMode && dayData && (
  <div className="absolute top-1.5 right-1.5 flex items-center space-x-1">
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCopy(day);
      }}
      className="w-5 h-5 flex items-center justify-center rounded-full bg-white/90 shadow-sm 
        opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
    >
      <Copy size={10} />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleDeleteTimeSlot(dateKey);
      }}
      className="w-5 h-5 flex items-center justify-center rounded-full bg-white/90 shadow-sm 
        opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
    >
      <span className="text-xs text-gray-500">×</span>
    </button>
  </div>
)}

{/* Day number */}
<div className={`p-1 font-medium ${isToday(day) ? 'text-blue-500' : ''} 
  ${isPastDay(day) ? 'text-gray-400' : ''}`}>
  {day}
</div>
          
{/* Time slots container */}
{fullDayEvent ? (
  <div className="flex-1 p-1 relative group">
    <div className="text-xs text-gray-600 truncate">
      {dayData.morning?.status === 'available' 
        ? 'Available'
        : dayData.morning?.eventType && 
          eventTypes.find(e => e.id === dayData.morning.eventType)?.label}
    </div>
  </div>
) : (
  <div className="flex-1 flex flex-col gap-1 p-1">
    {timeSlots.map(timeSlot => {
      const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
      return (
        <div key={timeSlot} className="relative group">
          <button
            onClick={(e) => handleTimeSlotClick(day, timeSlot, e)}
            disabled={isPastDay(day)}
            className={`w-full rounded text-[10px] p-1 transition-colors 
              ${getColorForStatus(availability[dateKey]?.[timeSlot])}
              ${isPastDay(day) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex justify-between items-center">
              <span>{timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)}</span>
              {availability[dateKey]?.[timeSlot]?.eventType && (
                <span className="text-[10px] text-gray-600 truncate ml-1">
                  ({eventTypes.find(e => e.id === availability[dateKey][timeSlot].eventType)?.label})
                </span>
              )}
            </div>
          </button>
          {availability[dateKey]?.[timeSlot] && !isPastDay(day) && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeleteTimeSlot(dateKey, timeSlot);
    }}
    className="absolute right-1 top-1/2 -translate-y-1/2
      w-4 h-4 flex items-center justify-center
      bg-white/90 rounded-full shadow-sm
      opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
  >
    <span className="text-[10px] text-gray-500 leading-none">×</span>
  </button>
)}
        </div>
      );
    })}
  </div>
)}
        </div>
      );
    })}
  </div>
) : currentView === 'week' ? (
  <WeekView />
) : (
  <ListView />
)}
      </div>
  
      {/* Availability Modal */}
      {showEventModal && (
  <AvailabilityModal
    isOpen={showEventModal}
    onClose={() => {
      setShowEventModal(false);
      setIsBulkSelect(false);
      setSelectedDay(null);
      setDateRange([null, null]);
    }}
    onSave={(details) => {
      handleSetAvailability(
        details.eventType === 'available' ? 'available' : 'busy',
        details.eventType,
        details
      );
    }}
    isBulkSelect={isBulkSelect}
    dateRange={dateRange}
    setDateRange={setDateRange}
    getDayClassName={getDayClassName}
    selectedDay={selectedDay}
    currentDate={currentDate}
    setSelectedDay={setSelectedDay}
  />
)}
    </>
  );
};

export default Calendar;