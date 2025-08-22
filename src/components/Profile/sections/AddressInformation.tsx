// AddressInformation.tsx
"use client";
import React, { useState } from 'react';
import { Save, MapPin, Globe, Mail as MailIcon } from 'lucide-react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

interface AddressInformationProps {
  profileData: IUserProfile;
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  isOwnProfile: boolean;
  editMode: boolean;
  onSave: (data: Partial<IUserProfile>) => void;
  loading: boolean;
  canViewField: (fieldName: string) => boolean;
  canEditField: (fieldName: string) => boolean;
}

export const AddressInformation: React.FC<AddressInformationProps> = ({
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
    street: profileData.address?.street || '',
    city: profileData.address?.city || '',
    state: profileData.address?.state || '',
    country: profileData.address?.country || '',
    zipCode: profileData.address?.zipCode || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedData: Partial<IUserProfile> = {
      address: {
        street: formData.street || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        country: formData.country || undefined,
        zipCode: formData.zipCode || undefined
      }
    };
    onSave(updatedData);
  };

  const renderField = (
    fieldName: string,
    label: string,
    placeholder: string,
    icon: React.ReactNode
  ) => {
    if (!canViewField('address')) return null;

    const canEdit = editMode && canEditField('address');
    const fieldValue = formData[fieldName as keyof typeof formData] || '';

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {icon}
          <span className="ml-2">{label}</span>
        </label>
        
        {canEdit ? (
          <input
            type="text"
            value={fieldValue}
            onChange={(e) => handleInputChange(fieldName, e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={loading}
          />
        ) : (
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            <span className="text-gray-900 dark:text-white">
              {fieldValue || 'Not specified'}
            </span>
          </div>
        )}
      </div>
    );
  };

  if (!canViewField('address')) {
    return (
      <div className="text-center py-8">
        <MapPin className="mx-auto text-gray-400" size={48} />
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Address information is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Address Information
        </h2>
        
        {editMode && canEditField('address') && (
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

      <div className="grid grid-cols-1 gap-6">
        {renderField('street', 'Street Address', 'Enter street address', <MapPin size={16} />)}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('city', 'City', 'Enter city', <MapPin size={16} />)}
          {renderField('state', 'State/Province', 'Enter state or province', <MapPin size={16} />)}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField('country', 'Country', 'Enter country', <Globe size={16} />)}
          {renderField('zipCode', 'ZIP/Postal Code', 'Enter ZIP or postal code', <MailIcon size={16} />)}
        </div>
      </div>
    </div>
  );
};