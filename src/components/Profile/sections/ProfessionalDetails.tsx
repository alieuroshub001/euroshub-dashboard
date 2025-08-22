"use client";
import React, { useState } from 'react';
import { Save, Briefcase, Building, Calendar, Badge } from 'lucide-react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

interface ProfessionalDetailsProps {
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

const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({
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
    department: profileData.department || '',
    position: profileData.position || '',
    employeeId: profileData.employeeId || '',
    dateOfJoining: profileData.dateOfJoining ? new Date(profileData.dateOfJoining).toISOString().split('T')[0] : ''
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
    
    // Validate employee ID format if provided
    if (formData.employeeId && !/^[A-Za-z0-9-_]+$/.test(formData.employeeId)) {
      newErrors.employeeId = 'Employee ID can only contain letters, numbers, hyphens, and underscores';
    }

    // Validate date of joining is not in the future
    if (formData.dateOfJoining && new Date(formData.dateOfJoining) > new Date()) {
      newErrors.dateOfJoining = 'Date of joining cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const updatedData: Partial<IUserProfile> = {
      department: formData.department || undefined,
      position: formData.position || undefined,
      employeeId: formData.employeeId || undefined,
      dateOfJoining: formData.dateOfJoining ? new Date(formData.dateOfJoining) : undefined
    };

    onSave(updatedData);
  };

  const renderField = (
    fieldName: string,
    label: string,
    value: string | undefined,
    icon: React.ReactNode,
    type: 'text' | 'date' | 'select' = 'text',
    placeholder?: string,
    options?: string[]
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
        </label>
        
        {canEdit ? (
          <>
            {type === 'select' && options ? (
              <select
                value={fieldValue}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
                className={`
                  w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white
                  ${errors[fieldName] ? 'border-red-500' : 'border-gray-300'}
                `}
                disabled={loading}
              >
                <option value="">Select {label}</option>
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
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

  // Department options - in a real app, these would come from an API
  const departmentOptions = [
    'Engineering',
    'Product',
    'Design',
    'Marketing',
    'Sales',
    'Human Resources',
    'Finance',
    'Operations',
    'Customer Success',
    'Data Science',
    'Quality Assurance',
    'DevOps',
    'Legal',
    'Administration'
  ];

  // Role-based access control for different sections
  const showEmployeeManagement = currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'hr';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Professional Details
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
          'department',
          'Department',
          profileData.department,
          <Building size={16} />,
          'select',
          'Select your department',
          departmentOptions
        )}

        {renderField(
          'position',
          'Position / Job Title',
          profileData.position,
          <Briefcase size={16} />,
          'text',
          'Enter your job title'
        )}

        {showEmployeeManagement && renderField(
          'employeeId',
          'Employee ID',
          profileData.employeeId,
          <Badge size={16} />,
          'text',
          'Enter employee ID'
        )}

        {renderField(
          'dateOfJoining',
          'Date of Joining',
          formatDate(profileData.dateOfJoining),
          <Calendar size={16} />,
          'date'
        )}
      </div>

      {/* Additional Professional Information */}
      {canViewField('role') && (
        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Role & Access Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Current Role:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs capitalize ${
                profileData.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
                profileData.role === 'admin' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                profileData.role === 'hr' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' :
                profileData.role === 'employee' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' :
                'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
              }`}>
                {profileData.role}
              </span>
            </div>
            
            {profileData.dateOfJoining && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Years of Service:</span>
                <span className="ml-2 text-gray-900 dark:text-white">
                  {Math.floor((new Date().getTime() - new Date(profileData.dateOfJoining).getTime()) / (1000 * 60 * 60 * 24 * 365))} years
                </span>
              </div>
            )}
            
            <div>
              <span className="text-gray-500 dark:text-gray-400">Email Verification:</span>
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                profileData.emailVerified 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
              }`}>
                {profileData.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

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
          </div>
        </div>
      )}

      {/* Work Anniversary Reminder */}
      {profileData.dateOfJoining && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Work Anniversary
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                {(() => {
                  const joiningDate = new Date(profileData.dateOfJoining);
                  const today = new Date();
                  const thisYearAnniversary = new Date(today.getFullYear(), joiningDate.getMonth(), joiningDate.getDate());
                  
                  if (thisYearAnniversary < today) {
                    thisYearAnniversary.setFullYear(today.getFullYear() + 1);
                  }
                  
                  const daysUntil = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (daysUntil === 0) {
                    return "Today is your work anniversary! 🎉";
                  } else if (daysUntil === 1) {
                    return "Your work anniversary is tomorrow!";
                  } else if (daysUntil <= 30) {
                    return `Your work anniversary is in ${daysUntil} days`;
                  } else {
                    return `Next anniversary: ${thisYearAnniversary.toLocaleDateString()}`;
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDetails;