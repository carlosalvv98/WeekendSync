import React, { useState, useEffect } from 'react';
import { Shield, Settings } from 'lucide-react';
import { supabase } from '../../../supabaseClient';

const TierSelector = ({ 
  friend, 
  currentTier, 
  customPermissions,
  onTierChange,
  onCustomPermissionsChange 
}) => {
  const [showCustomize, setShowCustomize] = useState(false);
  const [tiers, setTiers] = useState([]);

  // Fetch available tiers
  useEffect(() => {
    const fetchTiers = async () => {
      const { data: friendTiers, error } = await supabase
        .from('friend_tiers')
        .select('*')
        .order('level', { ascending: false });

      if (error) {
        console.error('Error fetching tiers:', error);
        return;
      }

      setTiers(friendTiers);
    };

    fetchTiers();
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <select
          value={currentTier?.id}
          onChange={(e) => onTierChange(e.target.value)}
          className="p-2 border rounded-lg"
        >
          {tiers.map(tier => (
            <option key={tier.id} value={tier.id}>
              {tier.name}
            </option>
          ))}
        </select>
        <button 
          onClick={() => setShowCustomize(true)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Settings size={16} />
        </button>
      </div>

      {/* Custom Permissions Modal */}
      {showCustomize && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Custom Permissions</h3>
            
            {Object.entries(currentTier.permissions).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm">{key.split('_').join(' ')}</span>
                <input
                  type="checkbox"
                  checked={customPermissions?.[key] ?? value}
                  onChange={(e) => onCustomPermissionsChange({
                    ...customPermissions,
                    [key]: e.target.checked
                  })}
                />
              </div>
            ))}
            
            <div className="mt-4 flex justify-end gap-2">
              <button 
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowCustomize(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierSelector;