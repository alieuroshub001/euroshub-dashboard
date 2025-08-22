import { IUserProfile } from "@/types/modules/profile";
import { Save } from "lucide-react";
import { useState } from "react";

// EmergencyContact.tsx
export const EmergencyContact: React.FC<AddressInformationProps> = ({
  profileData,
  currentUser,
  isOwnProfile,
  editMode,
  onSave,
  loading,
  canViewField,
  canEditField
}) => {
  const [formData, setFormData] = useState({
    name: profileData.emergencyContact?.name || '',
    relationship: profileData.emergencyContact?.relationship || '',
    phone: profileData.emergencyContact?.phone || '',
    email: profileData.emergencyContact?.email || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedData: Partial<IUserProfile> = {
      emergencyContact: {
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email || undefined
      }
    };
    onSave(updatedData);
  };

  if (!canViewField('emergencyContact')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Emergency contact information is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Emergency Contact
        </h2>
        
        {editMode && canEditField('emergencyContact') && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name *
          </label>
          {editMode && canEditField('emergencyContact') ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter contact name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-white">
                {formData.name || 'Not specified'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Relationship *
          </label>
          {editMode && canEditField('emergencyContact') ? (
            <select
              value={formData.relationship}
              onChange={(e) => handleInputChange('relationship', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            >
              <option value="">Select relationship</option>
              <option value="spouse">Spouse</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="child">Child</option>
              <option value="friend">Friend</option>
              <option value="relative">Relative</option>
              <option value="other">Other</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-white capitalize">
                {formData.relationship || 'Not specified'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number *
          </label>
          {editMode && canEditField('emergencyContact') ? (
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-white">
                {formData.phone || 'Not specified'}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          {editMode && canEditField('emergencyContact') ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
              <span className="text-gray-900 dark:text-white">
                {formData.email || 'Not specified'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};