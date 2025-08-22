"use client";
import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';
import { canViewProfileField, canEditProfileField } from '@/types/modules/profile/permission';

// Component imports
import ProfileHeader from './ProfileHeader';
import BasicInformation from './sections/BasicInformation';
import ContactInformation from './sections/BasicInformation';
import ProfessionalDetails from './sections/ProfessionalDetails';
import {AddressInformation} from './sections/AddressInformation';
import {EmergencyContact} from './sections/EmergencyContact';
import {SkillsCertifications} from './sections/SkillsCertification';
import {SocialLinks} from './sections/SocialLinks';
import AdminActions from './sections/AdminActions';
import {ActivityLog} from './sections/ActivityLog';

interface ProfileProps {
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  profileData: IUserProfile;
  isOwnProfile: boolean;
  onProfileUpdate?: (updatedData: Partial<IUserProfile>) => void;
  onAdminAction?: (action: string, data: any) => void;
}

const Profile: React.FC<ProfileProps> = ({
  currentUser,
  profileData,
  isOwnProfile,
  onProfileUpdate,
  onAdminAction
}) => {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Role-based visibility configuration
  const roleVisibility = {
    superadmin: {
      sections: ['basic', 'contact', 'professional', 'address', 'emergency', 'skills', 'social', 'admin', 'activity'],
      canEditAll: true,
      canViewAll: true,
      showAdminActions: true
    },
    admin: {
      sections: ['basic', 'contact', 'professional', 'address', 'emergency', 'skills', 'social', 'admin', 'activity'],
      canEditAll: false,
      canViewAll: true,
      showAdminActions: true
    },
    hr: {
      sections: ['basic', 'contact', 'professional', 'address', 'emergency', 'skills'],
      canEditAll: false,
      canViewAll: false,
      showAdminActions: false
    },
    employee: {
      sections: ['basic', 'contact', 'address', 'emergency', 'skills', 'social'],
      canEditAll: false,
      canViewAll: false,
      showAdminActions: false
    },
    client: {
      sections: ['basic', 'contact', 'address', 'social'],
      canEditAll: false,
      canViewAll: false,
      showAdminActions: false
    }
  };

  const currentRoleConfig = roleVisibility[currentUser.role];

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: 'User' },
    { id: 'contact', label: 'Contact', icon: 'Phone' },
    { id: 'professional', label: 'Professional', icon: 'Briefcase' },
    { id: 'address', label: 'Address', icon: 'MapPin' },
    { id: 'emergency', label: 'Emergency', icon: 'AlertTriangle' },
    { id: 'skills', label: 'Skills & Certs', icon: 'Award' },
    { id: 'social', label: 'Social Links', icon: 'Link' },
    { id: 'admin', label: 'Admin Actions', icon: 'Settings' },
    { id: 'activity', label: 'Activity', icon: 'Activity' }
  ].filter(tab => currentRoleConfig.sections.includes(tab.id));

  const handleSave = async (sectionData: Partial<IUserProfile>) => {
    setLoading(true);
    try {
      if (onProfileUpdate) {
        await onProfileUpdate(sectionData);
      }
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const canViewField = (fieldName: string): boolean => {
    return canViewProfileField(currentUser.role, fieldName, isOwnProfile);
  };

  const canEditField = (fieldName: string): boolean => {
    return canEditProfileField(currentUser.role, fieldName, isOwnProfile);
  };

  const renderSection = () => {
    const sectionProps = {
      profileData,
      currentUser,
      isOwnProfile,
      editMode,
      onSave: handleSave,
      loading,
      canViewField,
      canEditField
    };

    switch (activeTab) {
      case 'basic':
        return <BasicInformation {...sectionProps} />;
      case 'contact':
        return <ContactInformation {...sectionProps} />;
      case 'professional':
        return <ProfessionalDetails {...sectionProps} />;
      case 'address':
        return <AddressInformation {...sectionProps} />;
      case 'emergency':
        return <EmergencyContact {...sectionProps} />;
      case 'skills':
        return <SkillsCertifications {...sectionProps} />;
      case 'social':
        return <SocialLinks {...sectionProps} />;
      case 'admin':
        return (
          <AdminActions
            profileData={profileData}
            currentUser={currentUser}
            onAdminAction={onAdminAction}
          />
        );
      case 'activity':
        return <ActivityLog profileData={profileData} currentUser={currentUser} />;
      default:
        return <BasicInformation {...sectionProps} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <ProfileHeader
        profileData={profileData}
        currentUser={currentUser}
        isOwnProfile={isOwnProfile}
        editMode={editMode}
        onEditToggle={() => setEditMode(!editMode)}
        canEdit={canEditField('profileImage')}
      />

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default Profile;