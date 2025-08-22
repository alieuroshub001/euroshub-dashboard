"use client";
import React, { useState } from 'react';
import { Save, X, User, Mail, Phone, Calendar, FileText } from 'lucide-react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

interface BasicInformationProps {
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

const BasicInformation: React.FC<BasicInformationProps> = ({
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
    name: profileData.name || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    bio: profileData.bio || '',
    dateOfBirth: profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().split('T')[0] : ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updatedData: Partial<IUserProfile> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      bio: formData.bio || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
    };

    onSave(updatedData);
  };

  const renderField = (
    fieldName: string,
    label: string,
    value: string | undefined,
    icon: React.ReactNode,
    type: 'text' | 'email' | 'tel' | 'date' | 'textarea' = 'text',
    placeholder?: string
  ) => {
    if (!canViewField(fieldName)) {
      return null;
    }

    const canEdit = editMode && canEditField(fieldName);
    const fieldValue = formData[fieldName as keyof typeof formData] || '';

    return (
      <div className="space-y-2">
        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
          {icon}
          <span className="ml-2">{label}</span>
          {fieldName === 'name' || fieldName === 'email' ? (
            <span className="text-red-500 ml-1">*</span>
          ) : null}
        </label>
        
        {canEdit ? (
          <>
            {type === 'textarea' ? (
              <textarea
                value={fieldValue}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                placeholder={placeholder}
                className={`
                  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}
                `}
                rows={3}
                disabled={loading}
              />
            ) : (
              <input
                type={type}
                value={fieldValue}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                placeholder={placeholder}
                className={`
                  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              />
            )}
            {errors[fieldName] && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors[fieldName]}</p>
            )}
          </>
        ) : (
          <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            <span className="text-gray-900 dark:text-white">
              {value || 'Not specified'}
            </span>
          </div>
        )}
      </div>
    );
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return undefined;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Basic Information
        </h2>
        
        {editMode && (
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              <Save size={16} className="mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderField(
          'name',
          'Full Name',
          profileData.name,
          <User size={16} />,
          'text',
          'Enter your full name'
        )}

        {renderField(
          'email',
          'Email Address',
          profileData.email,
          <Mail size={16} />,
          'email',
          'Enter your email address'
        )}

        {renderField(
          'phone',
          'Phone Number',
          profileData.phone,
          <Phone size={16} />,
          'tel',
          'Enter your phone number'
        )}

        {renderField(
          'dateOfBirth',
          'Date of Birth',
          formatDate(profileData.dateOfBirth),
          <Calendar size={16} />,
          'date'
        )}
      </div>

      <div className="space-y-4">
        {renderField(
          'bio',
          'Bio / About',
          profileData.bio,
          <FileText size={16} />,
          'textarea',
          'Tell us about yourself...'
        )}
      </div>

      {/* Role-specific information display */}
      {(currentUser.role === 'superadmin' || currentUser.role === 'admin') && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Account Status:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                profileData.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {profileData.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Email Verified:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                profileData.emailVerified 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {profileData.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>
            {profileData.employeeId && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Employee ID:</span>
                <span className="ml-2 text-gray-900 dark:text-white">{profileData.employeeId}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 dark:text-gray-400">Member Since:</span>
              <span className="ml-2 text-gray-900 dark:text-white">
                {formatDate(profileData.createdAt)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicInformation;