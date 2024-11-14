import React, { useState, useRef, useEffect } from 'react';
import { User, MapPin, Heart, Camera, Plane, Home, Zap, Calendar, Users, Coffee, Utensils, Trophy, Check, X, Settings, Lock, LogOut, Link } from 'lucide-react';
import { debounce } from 'lodash';
import { supabase } from '../supabaseClient';  // Adjust path if needed

const Profile = ({ session }) => {
    const [loading, setLoading] = useState(true);

  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    username: '',
    hometown: '',
    personality: [],
    profilePicture: null
  });

  const [usernameStatus, setUsernameStatus] = useState({
    isChecking: false,
    isAvailable: false,
    message: ''
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const personalityTraits = [
    { id: 'traveller', label: 'Traveller', icon: Plane },
    { id: 'family', label: 'Family Oriented', icon: Home },
    { id: 'spontaneous', label: 'Spontaneous', icon: Zap },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'social', label: 'Social Butterfly', icon: Users },
    { id: 'introvert', label: 'Introvert', icon: Coffee },
    { id: 'foodie', label: 'Foodie', icon: Utensils },
    { id: 'active', label: 'Active/Sporty', icon: Trophy }
  ];

  useEffect(() => {
    if (session) getProfile();
  }, [session]);

  async function getProfile() {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      console.log('Fetching profile for user:', session.user.id); // Debug log
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, hometown, personality_traits, avatar_url, is_admin')
        .eq('id', session.user.id)
        .single();
  
      console.log('Profile data:', data); // Debug log
      
      if (error) throw error;
  
      if (data) {
        setProfile(prev => ({
          ...prev,
          username: data.username || '',
          hometown: data.hometown || '',
          personality: data.personality_traits || [],
          profilePicture: data.avatar_url
        }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError(error.message);  // Set error message instead of alert
    } finally {
      setLoading(false);
    }
  }

  const handlePhotoUpload = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        alert('Please upload only JPEG or PNG images.');
        return;
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id);

      if (updateError) throw updateError;

      setProfile(prev => ({
        ...prev,
        profilePicture: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo!');
    }
  };

  const handleTraitToggle = (traitId) => {
    setProfile(prev => {
      if (prev.personality.includes(traitId)) {
        return {
          ...prev,
          personality: prev.personality.filter(id => id !== traitId)
        };
      }
      
      if (prev.personality.length >= 3) {
        return prev;
      }
      
      return {
        ...prev,
        personality: [...prev.personality, traitId]
      };
    });
  };

  const checkUsername = async (username) => {
    const cleanUsername = username.replace('@', '').trim();
    
    if (cleanUsername.length < 3) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Username must be at least 3 characters'
      });
      return;
    }

    setUsernameStatus({
      isChecking: true,
      isAvailable: false,
      message: 'Checking availability...'
    });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', cleanUsername)
        .not('id', 'eq', session.user.id);

      if (error) throw error;

      const isAvailable = data.length === 0;
      setUsernameStatus({
        isChecking: false,
        isAvailable: isAvailable,
        message: isAvailable ? 'Username is available' : 'Username is taken'
      });
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Error checking username'
      });
    }
  };

  const debouncedCheckUsername = debounce(checkUsername, 300);

  const handleUsernameChange = (e) => {
    let newUsername = e.target.value;
    if (!newUsername.startsWith('@')) {
      newUsername = '@' + newUsername;
    }
    setProfile(prev => ({ ...prev, username: newUsername }));
    if (newUsername.length > 1) {
      debouncedCheckUsername(newUsername);
    }
  };

  const handleHometownChange = (e) => {
    const value = e.target.value;
    setProfile(prev => ({ ...prev, hometown: value }));
    if (value.length > 2) {
      debouncedSearchLocations(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const searchLocations = async (query) => {
    // TODO: Integrate with a real location API
    const mockLocations = [
      'New York, NY, USA',
      'New Orleans, LA, USA',
      'New Delhi, India',
      'Newport Beach, CA, USA'
    ];

    const filtered = mockLocations.filter(location => 
      location.toLowerCase().includes(query.toLowerCase())
    );
    setSuggestions(filtered);
  };

  const debouncedSearchLocations = debounce(searchLocations, 300);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username.replace('@', ''),
          hometown: profile.hometown,
          personality_traits: profile.personality,
          updated_at: new Date().toISOString(),
        })
        .eq('id', session.user.id);

      if (error) throw error;
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsClick = async (type) => {
    switch(type) {
      case 'calendar':
        alert('Calendar settings coming soon!');
        break;
      case 'password':
        const { error } = await supabase.auth.resetPasswordForEmail(session.user.email);
        if (error) {
          alert('Error sending password reset email');
        } else {
          alert('Password reset email sent!');
        }
        break;
      case 'logout':
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          alert('Error signing out');
        }
        break;
      default:
        break;
    }
  };

  // Add loading UI
if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading profile...</span>
        </div>
      </div>
    );
  }
  
  // Add error UI
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={() => {
            setError(null);
            getProfile();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  // Updated JSX with all the new changes
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">
        My Profile
      </h2>

      <div className="space-y-6">
        {/* Profile Header Section */}
        <div className="flex gap-6">
          {/* Left: Photo */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
              {profile.profilePicture ? (
                <img 
                  src={profile.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".jpg,.jpeg,.png"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
            >
              Change Photo
            </button>
          </div>

          {/* Right: Basic Info */}
          <div className="flex-1 pt-2">
            <div className="w-1/2 space-y-3">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={profile.username}
                    onChange={handleUsernameChange}
                    className={`w-full py-1.5 px-2 border rounded-lg focus:ring-2 outline-none text-sm ${
                      usernameStatus.isAvailable ? 'border-green-500' : 'border-gray-300'
                    }`}
                    placeholder="@username"
                  />
                  <div className="absolute right-2 top-1.5">
                    {usernameStatus.isChecking ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                    ) : usernameStatus.isAvailable ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : profile.username.length > 1 ? (
                      <X className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                {usernameStatus.message && (
                  <p className={`mt-1 text-xs ${
                    usernameStatus.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
              </div>

              {/* Hometown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Hometown
                </label>
                <input
                  type="text"
                  value={profile.hometown}
                  onChange={handleHometownChange}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full py-1.5 px-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="Enter your hometown"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                    {suggestions.map((location, index) => (
                      <div
                        key={index}
                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setProfile(prev => ({ ...prev, hometown: location }));
                          setShowSuggestions(false);
                        }}
                      >
                        {location}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* My Socials Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">My Socials</h3>
          <button 
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            onClick={() => alert('Add socials coming soon!')}
          >
            <Link className="w-4 h-4" />
            Add socials
          </button>
        </div>

        {/* Personality Traits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Personality Traits (Choose up to 3)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {personalityTraits.map(trait => {
              const Icon = trait.icon;
              return (
                <div
                  key={trait.id}
                  className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleTraitToggle(trait.id)}
                >
                  <input
                    type="checkbox"
                    checked={profile.personality.includes(trait.id)}
                    onChange={() => {}}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <Icon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{trait.label}</span>
                </div>
              );
            })}
          </div>
          {profile.personality.length >= 3 && (
            <p className="text-sm text-red-600 mt-2">
              Select a maximum of 3 traits.
            </p>
          )}
        </div>

        {/* Settings Buttons */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Settings</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSettingsClick('calendar')}
              className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">Calendar Settings</span>
            </button>
            <button
              onClick={() => handleSettingsClick('password')}
              className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50"
            >
              <Lock className="w-4 h-4" />
              <span className="text-sm">Change Password</span>
            </button>
            <button
              onClick={() => handleSettingsClick('logout')}
              className="flex items-center gap-2 p-2 rounded-lg border hover:bg-gray-50 text-red-600"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button 
        onClick={handleSaveProfile}
        disabled={saving}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Profile'}
      </button>
      </div>
    </div>
  );
};

export default Profile;