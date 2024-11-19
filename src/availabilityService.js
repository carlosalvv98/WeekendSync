import { supabase } from './supabaseClient';

export const saveAvailability = async (userId, date, timeSlot, status, eventDetails = {}) => {
  try {
    const payload = {
      user_id: userId,
      date: date,
      time_slot: timeSlot,
      status: status,
      event_type: status === 'busy' ? eventDetails.event_type : null,
      travel_destination: eventDetails.travel_destination || null,
      restaurant_name: eventDetails.restaurant_name || null,
      restaurant_location: eventDetails.restaurant_location || null,
      event_name: eventDetails.event_name || null,
      event_location: eventDetails.event_location || null,
      wedding_location: eventDetails.wedding_location || null,
      notes: eventDetails.notes || null,
      updated_at: new Date().toISOString()
    };

    console.log('Attempting to save with payload:', payload);

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

    return data;
  } catch (error) {
    console.error('Error in saveAvailability:', error);
    throw error;
  }
};

export const fetchUserAvailability = async (userId, startDate, endDate) => {
  try {
    const { data, error } = await supabase
      .from('availability')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    throw error;
  }
};

export const deleteAvailability = async (userId, startDate, endDate = null) => {
  try {
    let query = supabase
      .from('availability')
      .delete()
      .eq('user_id', userId);

    if (startDate && endDate) {
      // If date range provided, delete within range
      query = query
        .gte('date', startDate)
        .lte('date', endDate);
    } else if (startDate) {
      // If only one date provided, delete for that specific date
      query = query.eq('date', startDate);
    }

    const { error } = await query;
    if (error) throw error;

    console.log('Successfully deleted availability');
  } catch (error) {
    console.error('Error deleting availability:', error);
    throw error;
  }
};