"use client";
import React, { useState } from 'react';
import { Camera, Edit3, Mail, Phone, MapPin, Calendar, Badge } from 'lucide-react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

interface ProfileHeaderProps {
  profileData: IUserProfile;
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  isOwnProfile: boolean;
  editMode: boolean;
  onEditToggle: () => void;
  canEdit: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profileData,
  currentUser,
  isOwnProfile,
  editMode,
  onEditToggle,
  canEdit
}) => {
  const [imageHover, setImageHover] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Handle image upload logic here
      console.log('Uploading image:', file);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Not specified';
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      superadmin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      hr: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      employee: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      client: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[role];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
      {/* Cover/Background */}
      <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
      
      <div className="relative px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end md:space-x-6">
          {/* Profile Image */}
          <div className="relative -mt-16 mb-4 md:mb-0">
            <div
              className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg overflow-hidden bg-gray-200 dark:bg-gray-700"
              onMouseEnter={() => setImageHover(true)}
              onMouseLeave={() => setImageHover(false)}
            >
              {profileData.profileImage ? (
                <img
                  src={profileData.profileImage}
                  alt={profileData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-semibold text-gray-500 dark:text-gray-400">
                  {profileData.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Image Upload Overlay */}
              {canEdit && imageHover && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <label htmlFor="profile-image-upload" className="cursor-pointer">
                    <Camera className="text-white" size={24} />
                    <input
                      id="profile-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.name}
                </h1>
                {profileData.position && (
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    {profileData.position}
                  </p>
                )}
                {profileData.department && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {profileData.department}
                  </p>
                )}
              </div>

              {/* Status and Role Badges */}
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(profileData.isActive)}`}>
                  {profileData.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(profileData.role)}`}>
                  {profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1)}
                </span>
                {profileData.emailVerified && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              {profileData.email && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Mail size={16} />
                  <span className="truncate">{profileData.email}</span>
                </div>
              )}
              
              {profileData.phone && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Phone size={16} />
                  <span>{profileData.phone}</span>
                </div>
              )}

              {profileData.employeeId && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Badge size={16} />
                  <span>ID: {profileData.employeeId}</span>
                </div>
              )}

              {profileData.dateOfJoining && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar size={16} />
                  <span>Joined {formatDate(profileData.dateOfJoining)}</span>
                </div>
              )}

              {profileData.address && (
                <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                  <MapPin size={16} />
                  <span className="truncate">
                    {profileData.address.city && profileData.address.country
                      ? `${profileData.address.city}, ${profileData.address.country}`
                      : profileData.address.city || profileData.address.country || 'Location not specified'
                    }
                  </span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profileData.bio && (
              <div className="mt-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {profileData.bio}
                </p>
              </div>
            )}

            {/* Edit Button */}
            {canEdit && (
              <div className="mt-4">
                <button
                  onClick={onEditToggle}
                  className={`
                    inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                    ${editMode
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    } 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
                  `}
                >
                  <Edit3 size={16} className="mr-2" />
                  {editMode ? 'Cancel Edit' : 'Edit Profile'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;