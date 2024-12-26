import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, CalendarDays, Info, Copy, Trash2, X, Check } from 'lucide-react';
import DatePicker from 'react-datepicker';
import ViewSwitcher from './components/ViewSwitcher';
import AvailabilityModal from './components/AvailabilityModal';
import PastEventModal from './components/PastEventModal';
import { supabase } from './supabaseClient';
import { 
  saveAvailability,
  fetchUserAvailability,
  deleteAvailability 
} from './availabilityService';
import ListView from './components/ListView';
import CreateActionButton from './components/CreateActionButton';


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
  const [existingAvailabilityData, setExistingAvailabilityData] = useState(null);
  const [showPastEventModal, setShowPastEventModal] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState(null);
  const [activeTab, setActiveTab] = useState('when');
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedDates, setSelectedDates] = useState([]);
  const [selectionMode, setSelectionMode] = useState('none'); 
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
    { 
      id: 'open_to_plans', 
      label: 'Open to plans',
      baseColor: 'bg-green-100',
      selectedColor: 'bg-green-100 border-green-500'
    },
    { 
      id: 'traveling', 
      label: 'Traveling',
      baseColor: 'bg-blue-100',
      selectedColor: 'bg-blue-100 border-blue-500'
    },
    { 
      id: 'lunch', 
      label: 'Lunch',
      baseColor: 'bg-yellow-100',
      selectedColor: 'bg-orange-100 border-orange-500'
    },
    { 
      id: 'dinner', 
      label: 'Dinner',
      baseColor: 'bg-pink-100',
      selectedColor: 'bg-yellow-100 border-yellow-500'
    },
    { 
      id: 'event', 
      label: 'Event',
      baseColor: 'bg-indigo-100',
      selectedColor: 'bg-indigo-100 border-indigo-500'
    },
    { 
      id: 'wedding', 
      label: 'Wedding',
      baseColor: 'bg-orange-100',
      selectedColor: 'bg-pink-100 border-pink-500'
    },
    { 
      id: 'party', 
      label: 'Party',
      baseColor: 'bg-purple-100',
      selectedColor: 'bg-purple-100 border-purple-500'
    },
    { 
      id: 'family', 
      label: 'Family Time',
      baseColor: 'bg-red-100',
      selectedColor: 'bg-red-100 border-red-500'
    },
    { 
      id: 'work', 
      label: 'Work',
      baseColor: 'bg-gray-100',
      selectedColor: 'bg-gray-100 border-gray-500'
    },
    { 
      id: 'other', 
      label: 'Other',
      baseColor: 'bg-gray-100',
      selectedColor: 'bg-gray-100 border-gray-500'
    }
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

  const getDateKey = (year, month, day) => {
    // Add 1 to month since it's 0-based, and ensure proper formatting with leading zeros
    const formattedMonth = (month + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    return `${year}-${formattedMonth}-${formattedDay}`;
};

  const getAvailability = (year, month, day) => {
    const key = getDateKey(year, month, day);
    return availability[key];
  };

  // Get color class based on availability status
  const getColorForStatus = (dayData, isFullDay = false) => {
    if (!dayData) return 'bg-white hover:bg-gray-100';
    
    if (dayData.status === 'open_to_plans') {
        return isFullDay ? 'bg-green-100 opacity-75' : 'bg-green-100 hover:bg-green-200 opacity-75';
    } else if (dayData.status === 'busy') {
        const eventType = eventTypes.find(e => e.id === dayData.eventType);
        if (!eventType) return 'bg-white hover:bg-gray-50';
        return isFullDay ? eventType.baseColor : `${eventType.baseColor} hover:${eventType.selectedColor}`;
    }
    
    return 'bg-white hover:bg-gray-50';
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
  console.log('Date:', date);
  console.log('Timezone Offset:', date.getTimezoneOffset());
  console.log('ISO String:', date.toISOString());

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
    {dayData.morning?.status === 'open_to_plans' ? (
      'Open to plans'
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
        {dayData?.[timeSlot]?.status === 'open_to_plans' ? (
          'Open to plans'
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

  // Get class name for date picker days
  const getDayClassName = (date) => {
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    if (month === currentDate.getMonth() && year === currentDate.getFullYear()) {
      const dayData = availability[day];
      if (dayData) {
        if (isFullDayEvent(dayData)) {
          if (dayData.morning?.status === 'open_to_plans') return 'bg-green-100';
          if (dayData.morning?.status === 'busy') return 'bg-red-100';
        } else {
          const hasAvailable = Object.values(dayData).some(slot => slot?.status === 'open_to_plans');
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
    const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
    
    if (!isPastDay(clickDate)) {
      setSelectedDay({ day, timeSlot });
      setIsBulkSelect(false);
      
      // Get existing availability if any
      const existingData = availability[dateKey];
      let existingAvailability = null;
      
      if (existingData && existingData[timeSlot]) {
        existingAvailability = {
          eventType: existingData[timeSlot].eventType,
          location: existingData[timeSlot].location || '',
          withWho: existingData[timeSlot].withWho || '',
          notes: existingData[timeSlot].notes || '',
          isPrivate: existingData[timeSlot].isPrivate || false
        };
      }
      
      setActiveTab('status');
      setShowEventModal(true);
      setExistingAvailabilityData(existingAvailability);
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
      console.log('Deleting:', { dateStr, timeSlot });
      
      // Delete from Supabase
      await deleteAvailability(
        session.user.id,
        dateStr,
        timeSlot  // Pass timeSlot to deleteAvailability
      );
      
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
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      
      const clickDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
      const existingData = availability[dateKey];
      
      // Clear any existing modals first
      setShowEventModal(false);
      setShowPastEventModal(false);
      
      if (isPastDay(clickDate)) {
        if (availability[dateKey]) {
          setShowPastEventModal(true);
          setSelectedDay({ day });
        }
        return;
      }
      
      // Rest of your code remains the same
      if (selectionMode === 'select') {
        // ... your selection code
      } else {
        setSelectedDay({ day, timeSlot: 'all' });
        setExistingAvailabilityData(existingData);
        setShowEventModal(true);
        setActiveTab('status');
      }
  };

  const handleBulkSelect = () => {
    setDateRange([null, null]);
    setIsBulkSelect(true);
    setShowEventModal(true);
  };

  const handleSetAvailability = async (details) => {
    console.log('Starting handleSetAvailability with:', details);
    try {
      // Determine status based on event type
      const status = details.eventType === 'open_to_plans' ? 'open_to_plans' : 'busy';
      
      // Prepare the event details payload
      const eventPayload = {
        event_type: details.eventType,
        travel_destination: details.travel_destination || null,
        restaurant_name: details.restaurant_name || null,
        restaurant_location: details.restaurant_location || null,
        event_name: details.event_name || null,
        event_location: details.event_location || null,
        wedding_location: details.wedding_location || null,
        partners: details.partners || [],
        event_url: details.event_url || null,
        private_notes: details.private_notes || null,
        notes: details.notes || null,
        privacy_level: details.privacy_level || 'public'
      };
  
        if (selectedDates.length > 0) {
        // Handle multi-selected dates
        let newAvailability = { ...availability };
        
        for (const dateStr of selectedDates) {
          // Save all time slots for each selected day
          for (const slot of timeSlots) {
            await saveAvailability(
              session.user.id,
              dateStr,
              slot,
              status,
              eventPayload
            );
            
            if (!newAvailability[dateStr]) {
              newAvailability[dateStr] = {};
            }
            newAvailability[dateStr][slot] = {
              status,
              eventType: details.eventType,
              ...details
            };
          }
        }
        
        setAvailability(newAvailability);
        setSelectedDates([]);
        setSelectionMode('none');
      }

      if (isBulkSelect && startDate && endDate) {
        // Handle bulk selection
        let currentDate = new Date(startDate);
        let newAvailability = { ...availability };
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          // Save all time slots for each day
          for (const slot of timeSlots) {
            await saveAvailability(
              session.user.id,
              dateStr,
              slot,
              status,
              eventPayload
            );
            
            if (!newAvailability[dateStr]) {
              newAvailability[dateStr] = {};
            }
            newAvailability[dateStr][slot] = {
              status,
              eventType: details.eventType,
              ...details
            };
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setAvailability(newAvailability);
        
      } else if (selectedDay) {
        // Handle single day selection
        const { day, timeSlot } = selectedDay;
        const dateStr = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day
        ).toISOString().split('T')[0];
  
        if (timeSlot === 'all') {
          // Save all time slots for the day
          for (const slot of timeSlots) {
            await saveAvailability(
              session.user.id,
              dateStr,
              slot,
              status,
              eventPayload
            );
          }
        } else {
          // Save single time slot
          await saveAvailability(
            session.user.id,
            dateStr,
            timeSlot,
            status,
            eventPayload
          );
        }
  
        // Update local state
        setAvailability(prev => ({
          ...prev,
          [dateStr]: timeSlot === 'all'
            ? timeSlots.reduce((acc, slot) => ({
                ...acc,
                [slot]: {
                  status,
                  eventType: details.eventType,
                  ...details
                }
              }), {})
            : {
                ...prev[dateStr],
                [timeSlot]: {
                  status,
                  eventType: details.eventType,
                  ...details
                }
              }
        }));
      }
  
      // Clean up
      setShowEventModal(false);
      setSelectedDay(null);
      setIsBulkSelect(false);
      setDateRange([null, null]);
      
    } catch (error) {
      console.error('Error in handleSetAvailability:', error);
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
        
        // Get a wider date range (e.g., ±6 months from today)
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 6, 0);
        
        try {
            const data = await fetchUserAvailability(
                session.user.id,
                startDate.toISOString().split('T')[0],
                endDate.toISOString().split('T')[0]
            );
            
            console.log('Fetched data:', data); // Debug log
            
            // Convert the data to your existing availability format
            const formattedData = data.reduce((acc, item) => {
                const dateKey = item.date; // This should match the format from getDateKey
                if (!acc[dateKey]) acc[dateKey] = {};
                acc[dateKey][item.time_slot] = {
                    status: item.status,
                    eventType: item.event_type,
                    travel_destination: item.travel_destination,
                    restaurant_name: item.restaurant_name,
                    restaurant_location: item.restaurant_location,
                    event_name: item.event_name,
                    event_location: item.event_location,
                    wedding_location: item.wedding_location,
                    partners: item.partners || [],
                    event_url: item.event_url,
                    private_notes: item.private_notes,
                    notes: item.notes,
                    privacy_level: item.privacy_level || 'public'
                };
                return acc;
            }, {});
            
            console.log('Formatted data:', formattedData); // Debug log
            setAvailability(formattedData);
        } catch (error) {
            console.error('Error loading availability:', error);
        }
    };

    loadAvailability();
}, [session?.user?.id]);

  // =============== Main Render ===============
return (
  <>
    <div className="bg-white rounded-lg shadow p-6">
    {/* Calendar Header */}
<div className="flex flex-col gap-4 mb-6">
  {/* Top row with ViewSwitcher and action buttons */}
  <div className="flex justify-between items-center">
    <ViewSwitcher 
      currentView={currentView}
      onViewChange={setCurrentView}
    />
    
    <div className="flex items-center gap-2">
      <CreateActionButton 
        onSelect={(actionType) => {
          setSelectedEventType(actionType);
          setShowEventModal(true);
          setActiveTab('dates');
        }} 
      />

      <button 
        onClick={() => setSelectionMode(prev => prev === 'select' ? 'none' : 'select')}
        className={`p-2 px-4 rounded-lg flex items-center gap-2 ${
          selectionMode === 'select' 
            ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300' 
            : 'bg-purple-100 hover:bg-purple-200'
        }`}
      >
        <CalendarDays size={16} />
        <span>Select</span>
      </button>

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

  {/* Bottom row with month/year and selection controls */}
{currentView !== 'list' && (
  <div className="flex justify-between items-center">
    <h2 className="text-2xl font-bold">
      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
    </h2>

    {(selectionMode === 'select' || copyMode) && (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">
          {selectionMode === 'select' ? 'Selection Mode' : 'Copy Mode'}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (selectionMode === 'select') {
                setSelectionMode('none');
                setSelectedDates([]);
              } else {
                setCopyMode(false);
                setSelectedDays([]);
                setCopySource(null);
              }
            }}
            className="p-1.5 rounded-full hover:bg-red-50 text-red-500"
          >
            <X size={16} />
          </button>

          <button
            onClick={() => {
              if (selectionMode === 'select') {
                if (selectedDates.length > 0) {
                  setIsBulkSelect(true);
                  setShowEventModal(true);
                  setActiveTab('status');
                  const sortedDates = selectedDates.sort();
                  setDateRange([
                    new Date(sortedDates[0]),
                    new Date(sortedDates[sortedDates.length - 1])
                  ]);
                }
              } else {
                handlePaste();
              }
            }}
            className="p-1.5 rounded-full hover:bg-green-50 text-green-500"
          >
            <Check size={16} />
          </button>

          <div className="h-6 w-px bg-gray-200"></div>

          <button
            onClick={() => {
              if (selectionMode === 'select' && selectedDates.length > 0) {
                for (const dateStr of selectedDates) {
                  handleDeleteTimeSlot(dateStr);
                }
                setSelectedDates([]);
                setSelectionMode('none');
              }
            }}
            className="p-1.5 px-3 rounded-lg hover:bg-red-100 text-gray-600 hover:text-red-600"
          >
            Clear
          </button>
        </div>
      </div>
    )}
  </div>
)}
</div>
  
        {/* View Container */}
          {currentView === 'list' ? (
            <ListView availability={availability} eventTypes={eventTypes} />
) : (
  <>
    {currentView === 'month' ? (
      <div 
      className="grid grid-cols-7 gap-2"
      onMouseUp={() => {
        if (isDragging) {
          setIsDragging(false);
          setDragStartDay(null);
        }
      }}
      onMouseLeave={() => {
        if (isDragging) {
          setIsDragging(false);
          setDragStartDay(null);
        }
      }}
    >
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
              className={`border rounded-lg h-34 overflow-hidden flex flex-col relative group
                ${isToday(day) ? 'border-blue-500 border-2' : ''}
                ${isPastDay(day) && !dayData ? 'bg-gray-50' : ''}
                ${fullDayEvent ? `${getColorForStatus(dayData?.morning, true)} ${isPastDay(day) ? 'opacity-75' : ''}` : ''}
                ${selectionMode === 'select' && selectedDates.includes(dateKey) ? 'ring-2 ring-blue-500 border-blue-500' : ''}
                ${isSelected ? 'border-blue-500 border-2 ring-2 ring-blue-200' : ''}
                ${isCopySource ? 'border-green-500 border-2 ring-2 ring-green-200' : ''}
                ${copyMode ? 'cursor-pointer hover:border-blue-400' : ''}
                ${selectionMode === 'select' ? 'cursor-pointer hover:border-blue-300' : ''}`}
                
                
                onClick={(e) => {
                  if (copyMode) {
                    if (!isDragging) {
                      handleDaySelection(day);
                    }
                  } else if (selectionMode === 'select') {
                    const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
                    setSelectedDates(prev => {
                      const isSelected = prev.includes(dateKey);
                      return isSelected ? prev.filter(d => d !== dateKey) : [...prev, dateKey];
                    });
                  } else {
                    handleDayClick(day, e);
                  }
                }}
                onMouseDown={(e) => {
                  if (selectionMode === 'select' || copyMode) {
                    e.preventDefault();
                    const rect = e.currentTarget.getBoundingClientRect();
                    const startX = e.clientX - rect.left;
                    const startY = e.clientY - rect.top;
                    
                    const handleMouseMove = (moveEvent) => {
                      const moveX = moveEvent.clientX - rect.left;
                      const moveY = moveEvent.clientY - rect.top;
                      
                      if (Math.abs(moveX - startX) > 5 || Math.abs(moveY - startY) > 5) {
                        setIsDragging(true);
                        setDragStartDay(day);
                        if (copyMode) {
                          handleDaySelection(day);
                        } else {
                          const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
                          setSelectedDates(prev => {
                            if (!prev.includes(dateKey)) {
                              return [...prev, dateKey];
                            }
                            return prev;
                          });
                        }
                        document.removeEventListener('mousemove', handleMouseMove);
                      }
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      setIsDragging(false);
                      setDragStartDay(null);
                    }, { once: true });
                  }
                }}
                onMouseEnter={() => {
                  if (isDragging && (selectionMode === 'select' || copyMode)) {
                    if (copyMode) {
                      handleDaySelection(day);
                    } else {
                      const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
                      setSelectedDates(prev => {
                        if (!prev.includes(dateKey)) {
                          return [...prev, dateKey];
                        }
                        return prev;
                      });
                    }
                  }
                }}
            >


              {/* Copy and Delete buttons */}
              {!copyMode && selectionMode === 'none' && dayData && (
                <div className="absolute top-1.5 right-1.5 flex items-center space-x-1 z-50">
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
              <div className="relative">
              <div className={`p-1 font-medium ${isToday(day) ? 'text-blue-500' : ''} 
                ${isPastDay(day) ? 'text-gray-400' : ''}`}>
                {day}
                {isPastDay(day) && (
                  <span className="absolute -top-2 right-1 text-red-500 text-[15px] font-medium p-1">
                    ×
                  </span>
                )}
              </div>
            </div>
                    
              {/* Time slots container */}
              {fullDayEvent ? (
              <div className="flex-1 p-1 relative group">
                <div className="flex flex-col">
                  <div className="text-xs text-gray-600 font-medium">
                    {dayData.morning?.status === 'open_to_plans' 
                      ? 'Open to plans'
                      : dayData.morning?.eventType && 
                        eventTypes.find(e => e.id === dayData.morning.eventType)?.label}
                  </div>
                  {dayData.morning?.eventType === 'traveling' && dayData.morning?.travel_destination && (
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate w-full">
                      {dayData.morning.travel_destination}
                    </div>
                  )}
                  {dayData.morning?.eventType === 'wedding' && (
                    <>
                      {dayData.morning?.wedding_couple && (
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate w-full">
                          {dayData.morning.wedding_couple}
                        </div>
                      )}
                      {dayData.morning?.wedding_location && (
                        <div className="text-[10px] text-gray-500 mt-0.5 truncate w-full">
                          {dayData.morning.wedding_location}
                        </div>
                      )}
                    </>
                  )}
                  {(dayData.morning?.eventType === 'lunch' || dayData.morning?.eventType === 'dinner') && 
                  dayData.morning?.restaurant_name && (
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate w-full">
                      {dayData.morning.restaurant_name}
                    </div>
                  )}
                  {(dayData.morning?.eventType === 'event' || dayData.morning?.eventType === 'party') && 
                  dayData.morning?.event_name && (
                    <div className="text-[10px] text-gray-500 mt-0.5 truncate w-full">
                      {dayData.morning.event_name}
                    </div>
                  )}
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
                            {availability[dateKey]?.[timeSlot]?.eventType && 
                             availability[dateKey]?.[timeSlot]?.status !== 'open_to_plans' && (
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
    ) : (
      <WeekView />
    )}
  </>
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
    onSave={(details) => handleSetAvailability(details)}  // Changed this line
    onClear={() => {
      const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day);
      handleDeleteTimeSlot(dateKey, selectedDay.timeSlot === 'all' ? null : selectedDay.timeSlot);
    }}
    isBulkSelect={isBulkSelect}
    dateRange={dateRange}
    setDateRange={setDateRange}
    getDayClassName={getDayClassName}
    selectedDay={selectedDay}
    currentDate={currentDate}
    setSelectedDay={setSelectedDay}
    existingAvailability={existingAvailabilityData} 
    activeTab={activeTab}
    setActiveTab={setActiveTab}
    selectedDates={selectedDates} 
  />
)}
{/* Past Event Modal */}
{showPastEventModal && selectedDay && (
  <PastEventModal
    isOpen={showPastEventModal}
    onClose={() => {
      setShowPastEventModal(false);
      setSelectedDay(null);
    }}
    onClear={() => {
      const dateKey = getDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day);
      handleDeleteTimeSlot(dateKey);
      setShowPastEventModal(false);
      setSelectedDay(null);  // Add this line
    }}
    dayData={availability[getDateKey(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day)]}
    date={new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay.day)}
  />
)}
    </>
  );
};

export default Calendar;