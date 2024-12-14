import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const ListView = ({ availability }) => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [filters, setFilters] = useState({
    type: 'all',
    country: 'all',
    city: 'all',
    friends: 'justYou'
  });

  const predefinedEventTypes = [
    { id: 'all', label: 'All' },
    { id: 'traveling', label: 'Traveling' },
    { id: 'lunch', label: 'Lunch' },
    { id: 'dinner', label: 'Dinner' },
    { id: 'event', label: 'Event' },
    { id: 'wedding', label: 'Wedding' },
    { id: 'party', label: 'Party' },
    { id: 'family', label: 'Family Time' },
    { id: 'work', label: 'Work' },
    { id: 'other', label: 'Other' }
  ];

  // Helper functions (keep all the existing helper functions exactly the same)
  const groupEvents = () => {
    const events = [];
    let currentEvent = null;

    Object.entries(availability).forEach(([dateStr, dayData]) => {
      Object.entries(dayData).forEach(([timeSlot, data]) => {
        if (data?.status === 'busy') {
          const location = data.travel_destination || data.restaurant_name || data.event_location || data.wedding_location || '';
          const [country, city] = location.split(',').map(s => s.trim());

          if (!currentEvent || 
              currentEvent.eventType !== data.eventType ||
              currentEvent.location !== location ||
              currentEvent.notes !== data.notes) {
            currentEvent = {
              startDate: dateStr,
              endDate: dateStr,
              timeSlot: timeSlot,
              eventType: data.eventType,
              location: location,
              country: country,
              city: city,
              notes: data.notes,
              partners: data.partners || [],
              details: data
            };
            events.push(currentEvent);
          } else {
            currentEvent.endDate = dateStr;
          }
        }
      });
    });

    return events;
  };

  const getEventTitle = (event) => {
    switch (event.eventType) {
      case 'traveling':
        return `Trip to ${event.location}`;
      case 'dinner':
      case 'lunch':
        return `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} @ ${event.location}`;
      case 'wedding':
        return `Wedding @ ${event.location}`;
      case 'party':
        return `Party @ ${event.location}`;
      default:
        return event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1);
    }
  };

  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  };

  const events = groupEvents().sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const countries = [...new Set(events.map(e => e.country).filter(Boolean))];
  const cities = [...new Set(events.map(e => e.city).filter(Boolean))];

  const filteredEvents = events.filter(event => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dateInRange = !startDate || !endDate || 
      (eventStart <= endDate && eventEnd >= startDate);

    const typeMatch = filters.type === 'all' || event.eventType === filters.type;
    const countryMatch = filters.country === 'all' || event.country === filters.country;
    const cityMatch = filters.city === 'all' || event.city === filters.city;
    const friendsMatch = filters.friends === 'justYou' ? 
      event.partners.length === 0 : 
      filters.friends === 'all' || event.partners.includes(filters.friends);

    return dateInRange && typeMatch && countryMatch && cityMatch && friendsMatch;
  });

  return (
    <div className="space-y-4">
      {/* Filter Controls - More Compact Layout */}
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
          
          <select 
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm w-36"
          >
            {predefinedEventTypes.map(type => (
              <option key={type.id} value={type.id}>{type.label}</option>
            ))}
          </select>

          <select 
            value={filters.country}
            onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm w-32"
          >
            <option value="all">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select 
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm w-32"
          >
            <option value="all">All Cities</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>

          <select 
            value={filters.friends}
            onChange={(e) => setFilters(prev => ({ ...prev, friends: e.target.value }))}
            className="border rounded-md px-2 py-1 text-sm w-32"
          >
            <option value="justYou">Just you</option>
            <option value="all">All Friends</option>
            {events
              .flatMap(e => e.partners)
              .filter((v, i, a) => v && a.indexOf(v) === i)
              .map(partner => (
                <option key={partner} value={partner}>{partner}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {filteredEvents.map((event, index) => (
          <div 
            key={`${event.startDate}-${index}`}
            className="p-4 border rounded-lg hover:border-blue-200 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{getEventTitle(event)}</h3>
                <p className="text-sm text-gray-500">{formatDateRange(event.startDate, event.endDate)}</p>
              </div>
            </div>
            
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              {event.partners?.length > 0 && (
                <div>
                  <span className="font-medium">With: </span>
                  {event.partners.join(', ')}
                </div>
              )}
              {event.notes && (
                <div>
                  <span className="font-medium">Notes: </span>
                  {event.notes}
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