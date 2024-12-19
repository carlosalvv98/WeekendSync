import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ChevronDown, ChevronRight } from 'lucide-react';

const MultiSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="border rounded-md px-2 py-1 text-sm w-48 text-left bg-white flex justify-between items-center"
      >
        <span className="truncate">
          {value.length === 0 ? placeholder :
           value.length === 1 ? options.find(o => value.includes(o.value))?.label :
           `${value.length} selected`}
        </span>
        <ChevronDown className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer"
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
      )}
    </div>
  );
};

const ListView = ({ availability, eventTypes }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    types: [],
    countries: [],
    cities: [],
    friends: []
  });
  const [expandedEvent, setExpandedEvent] = useState(null);

  const hasUpcomingDates = (event) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(event.endDate);
    return endDate >= today;
  };

  const predefinedEventTypes = [
    { value: 'traveling', label: 'Traveling', color: 'bg-blue-500' },  // Using opacity modifier
    { value: 'lunch', label: 'Lunch', color: 'bg-orange-500' },
    { value: 'dinner', label: 'Dinner', color: 'bg-yellow-500' },
    { value: 'event', label: 'Event', color: 'bg-indigo-500' },
    { value: 'wedding', label: 'Wedding', color: 'bg-pink-500' },
    { value: 'party', label: 'Party', color: 'bg-purple-500' },
    { value: 'family', label: 'Family Time', color: 'bg-red-500' },
    { value: 'work', label: 'Work', color: 'bg-gray-500' },
    { value: 'other', label: 'Other', color: 'bg-gray-500' }
  ];

  const groupEvents = () => {
    const events = [];
  
    // First, consolidate events by date
    const consolidatedByDate = Object.entries(availability).reduce((acc, [dateStr, dayData]) => {
      // Skip days where nothing is busy
      if (!Object.values(dayData).some(data => data.status === 'busy')) {
        return acc;
      }
      
      // Find the first busy slot for this day
      const busySlot = Object.entries(dayData).find(([_, data]) => data.status === 'busy');
      if (!busySlot) return acc;
      
      const [timeSlot, data] = busySlot;
      const location = data.travel_destination || data.restaurant_name || data.event_location || data.wedding_location || '';
      
      acc[dateStr] = {
        date: dateStr,
        eventType: data.eventType,
        location: location,
        country: location.split(',')[0]?.trim() || '',
        city: location.split(',')[1]?.trim() || '',
        notes: data.notes,
        partners: data.partners || [],
        details: data
      };
      
      return acc;
      }, {});
      
      // Then, merge consecutive days with same event type
      const sortedDates = Object.keys(consolidatedByDate).sort();
      let currentEvent = null;
      
      sortedDates.forEach(dateStr => {
        const eventData = consolidatedByDate[dateStr];
        
        const shouldMerge = currentEvent && 
          currentEvent.eventType === eventData.eventType && 
          currentEvent.location === eventData.location &&
          Math.abs(Date.UTC(new Date(dateStr).getUTCFullYear(), new Date(dateStr).getUTCMonth(), new Date(dateStr).getUTCDate()) - 
                   Date.UTC(new Date(currentEvent.endDate).getUTCFullYear(), new Date(currentEvent.endDate).getUTCMonth(), new Date(currentEvent.endDate).getUTCDate())) <= 24 * 60 * 60 * 1000;
      
        if (shouldMerge) {
          currentEvent.endDate = dateStr;
        } else {
          if (currentEvent) {
            events.push(currentEvent);
          }
          currentEvent = {
            startDate: dateStr,
            endDate: dateStr,
            ...eventData
          };
        }
      });
      
      if (currentEvent) {
        events.push(currentEvent);
      }
      
      return events;
  };

  const getEventTitle = (event) => {
    const hasLocation = event.location && event.location.trim() !== '';
    
    switch (event.eventType) {
      case 'traveling':
        return hasLocation ? `Trip to ${event.location}` : 'Trip';
      case 'dinner':
      case 'lunch':
        return hasLocation 
          ? `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} @ ${event.location}`
          : event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
      case 'wedding':
        return hasLocation ? `Wedding @ ${event.location}` : 'Wedding';
      case 'party':
        return hasLocation ? `Party @ ${event.location}` : 'Party';
      default:
        return event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
    }
  };

  const formatDateRange = (startDate, endDate) => {
    // Add time to force correct date interpretation
    const start = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC'  // Force UTC interpretation
      });
    }
    
    return `${start.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      timeZone: 'UTC'
    })} - ${end.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'UTC'
    })}`;
  };

  const getEventColor = (eventType) => {
    const type = predefinedEventTypes.find(t => t.value === eventType);
    return type?.color || 'bg-gray-50';
  };

  const events = groupEvents().sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const countries = [...new Set(events.map(e => e.country).filter(Boolean))]
    .map(country => ({ value: country, label: country }));
  const cities = [...new Set(events.map(e => e.city).filter(Boolean))]
    .map(city => ({ value: city, label: city }));
  const friendsList = [...new Set(events.flatMap(e => e.partners).filter(Boolean))]
    .map(friend => ({ value: friend, label: friend }));

    const filteredEvents = events
    .filter(hasUpcomingDates)  // Add this line
    .filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dateInRange = !startDate || !endDate || 
        (eventStart <= endDate && eventEnd >= startDate);
  
      const typeMatch = filters.types.length === 0 || filters.types.includes(event.eventType);
      const countryMatch = filters.countries.length === 0 || filters.countries.includes(event.country);
      const cityMatch = filters.cities.length === 0 || filters.cities.includes(event.city);
      const friendsMatch = filters.friends.length === 0 || 
        event.partners.some(partner => filters.friends.includes(partner));
  
      return dateInRange && typeMatch && countryMatch && cityMatch && friendsMatch;
    });

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex flex-wrap gap-3">
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            className="border rounded-md px-2 py-1 text-sm w-44"
            placeholderText="Filter by date range"
            isClearable={true}
          />
          
          <MultiSelect
            options={predefinedEventTypes}
            value={filters.types}
            onChange={(types) => setFilters(prev => ({ ...prev, types }))}
            placeholder="All Event Types"
          />

          <MultiSelect
            options={countries}
            value={filters.countries}
            onChange={(countries) => setFilters(prev => ({ ...prev, countries }))}
            placeholder="All Countries"
          />

          <MultiSelect
            options={cities}
            value={filters.cities}
            onChange={(cities) => setFilters(prev => ({ ...prev, cities }))}
            placeholder="All Cities"
          />

          <MultiSelect
            options={friendsList}
            value={filters.friends}
            onChange={(friends) => setFilters(prev => ({ ...prev, friends }))}
            placeholder="All Friends"
          />
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map((event, index) => (
          <div 
            key={`${event.startDate}-${index}`}
            className="border rounded-lg hover:border-blue-200 transition-colors overflow-hidden flex"
          >
            {/* Color Tab */}
            <div className={`w-2 ${getEventColor(event.eventType)}`} />
            
            {/* Content */}
            <div className="flex-1 p-4">
              <div 
                className="flex justify-between items-start cursor-pointer"
                onClick={() => setExpandedEvent(expandedEvent === index ? null : index)}
              >
                <div>
                  <h3 className="font-medium text-lg">{getEventTitle(event)}</h3>
                  <p className="text-sm text-gray-500">{formatDateRange(event.startDate, event.endDate)}</p>
                </div>
                <div className="text-gray-400">
                  {expandedEvent === index ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </div>
              
              {/* Event Details */}
              {expandedEvent === index && (
                <div className="mt-4 space-y-3 border-t pt-3">
                  {event.location && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Location: </span>
                      {event.location}
                    </div>
                  )}
                  {event.partners?.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">With: </span>
                      {event.partners.join(', ')}
                    </div>
                  )}
                  {event.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes: </span>
                      {event.notes}
                    </div>
                  )}
                  {event.details.event_url && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Link: </span>
                      <a href={event.details.event_url} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 hover:underline">
                        Event Details
                      </a>
                    </div>
                  )}
                  {!event.location && !event.partners?.length && !event.notes && (
                        <div className="mt-3 text-sm text-gray-400 italic">
                            <button 
                            onClick={() => {/* TODO: Add logic to open availability modal */}}
                            className="text-blue-500 hover:underline"
                            >
                            No details provided - Add details?
                            </button>
                        </div>
                        )}
                    </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default ListView;