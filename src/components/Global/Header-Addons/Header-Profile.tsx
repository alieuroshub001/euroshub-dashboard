// components/Global/Header-Addons/Header-Profile.tsx
"use client"
import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';

interface HeaderProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
  userRole: string;
  profileImage?: string;
}

const HeaderProfile: React.FC<HeaderProfileProps> = ({ 
  isOpen, 
  onClose, 
  userName, 
  userEmail, 
  userRole, 
  profileImage 
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{userName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
      </div>
      <div className="py-2">
        <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <User size={16} className="mr-3 text-gray-500" />
          My Profile
        </button>
        <button className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Settings size={16} className="mr-3 text-gray-500" />
          Settings
        </button>
      </div>
      <div className="py-2 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut size={16} className="mr-3" />
          Sign out
        </button>
      </div>
    </div>
  );
};

export default HeaderProfile;