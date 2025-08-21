// components/Global/Header-Addons/Profile-Image.tsx
"use client"
import React from 'react';

interface ProfileImageProps {
  userName: string;
  profileImage?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ProfileImage: React.FC<ProfileImageProps> = ({ 
  userName, 
  profileImage, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt="Profile"
        className={`${sizeClasses[size]} rounded-full object-cover`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold`}>
      {userName.charAt(0).toUpperCase()}
    </div>
  );
};

export default ProfileImage;