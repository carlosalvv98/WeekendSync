import { supabase } from './supabaseClient';

export const saveAvailability = async (userId, date, timeSlot, status, eventDetails = {}) => {
  try {
    // Clean up the event type - remove spaces and ensure proper format
    const cleanEventType = eventDetails.event_type?.replace(/\s+/g, '_').toLowerCase();

    // Convert open_to_plans status to 'available'
    const normalizedStatus = status === 'open_to_plans' ? 'available' : 'busy';

    console.log('Save Availability Input:', {
      userId,
      date,
      timeSlot,
      normalizedStatus,
      eventDetails,
      cleanEventType
    });

    if (!['morning', 'afternoon', 'night'].includes(timeSlot)) {
      throw new Error(`Invalid time slot: ${timeSlot}`);
    }

    const payload = {
      user_id: userId,
      date: date,
      time_slot: timeSlot,
      status: normalizedStatus,
      event_type: cleanEventType,
      travel_destination: eventDetails.travel_destination || null,
      restaurant_name: eventDetails.restaurant_name || null,
      restaurant_location: eventDetails.restaurant_location || null,
      event_name: eventDetails.event_name || null,
      event_location: eventDetails.event_location || null,
      wedding_location: eventDetails.wedding_location || null,
      notes: eventDetails.notes || null,
      updated_at: new Date().toISOString()
    };

    console.log('Built Payload:', payload);

    const { data, error } = await supabase
      .from('availability')
      .upsert(payload, {
        onConflict: 'user_id,date,time_slot',
        returning: 'minimal'
      });

    if (error) {
      console.error('Detailed Supabase error:', error);
      throw error;
    }

    console.log('Save successful:', data);
    return data;
  } catch (error) {
    console.error('Full error in saveAvailability:', error);
    throw error;
  }
};

export const fetchUserAvailability = async (userId, startDate, endDate) => {
  try {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const extendedStartDate = new Date(startDateObj.setMonth(startDateObj.getMonth() - 1)).toISOString().split('T')[0];
    const extendedEndDate = new Date(endDateObj.setMonth(endDateObj.getMonth() + 1)).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('user_id', userId)
      .gte('date', extendedStartDate)
      .lte('date', extendedEndDate)
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
};

export const deleteAvailability = async (userId, date, timeSlot = null) => {
  try {
    console.log('Delete params:', { userId, date, timeSlot });
    
    let query = supabase
      .from('availability')
      .delete()
      .eq('user_id', userId);

    if (date) {
      query = query.eq('date', date);
      
      // If timeSlot is specified, only delete that specific slot
      if (timeSlot) {
        query = query.eq('time_slot', timeSlot);
      }
    }

    const { error } = await query;
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    console.log('Successfully deleted availability');
    return true;
  } catch (error) {
    console.error('Error in deleteAvailability:', error);
    throw error;
  }
};