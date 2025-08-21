"use client"
import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Menu
} from 'lucide-react';
import Notification from '@/components/Global/Header-Addons/Notification';
import ThemeButton from '@/components/Global/Header-Addons/ThemeButton';
import CalendarComponent from '@/components/Global/Header-Addons/Calendar';
import HeaderProfile from '@/components/Global/Header-Addons/Header-Profile';
import ProfileImage from '@/components/Global/Header-Addons/Profile-Image';

interface HeaderProps {
  userRole: 'superadmin' | 'admin' | 'client' | 'hr' | 'employee';
  userName: string;
  userEmail: string;
  profileImage?: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  userRole, 
  userName, 
  userEmail, 
  profileImage,
  isMobileOpen,
  setIsMobileOpen
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Sample notifications data
  const notifications = [
    { id: 1, text: 'New task assigned to you', time: '10 mins ago', read: false },
    { id: 2, text: 'Project deadline approaching', time: '1 hour ago', read: false },
    { id: 3, text: 'New message from John', time: '2 hours ago', read: true },
    { id: 4, text: 'Your leave request was approved', time: '1 day ago', read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsProfileOpen(false);
    setIsCalendarOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
    setIsNotificationOpen(false);
    setIsCalendarOpen(false);
  };

  const handleCalendarClick = () => {
    setIsCalendarOpen(!isCalendarOpen);
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
  };

  const closeAllDropdowns = () => {
    setIsNotificationOpen(false);
    setIsProfileOpen(false);
    setIsCalendarOpen(false);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 px-4 lg:px-6 flex items-center justify-between">
        {/* Left section - Mobile hamburger and breadcrumbs */}
        <div className="flex items-center flex-1">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 mr-2"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          {/* You can add breadcrumbs or page title here */}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Dark Mode Toggle */}
          <ThemeButton />

          {/* Calendar */}
          <div className="relative">
            <button
              onClick={handleCalendarClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Calendar"
            >
              <Calendar size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            <CalendarComponent isOpen={isCalendarOpen} onClose={closeAllDropdowns} />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-600 dark:text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            
            <Notification 
              isOpen={isNotificationOpen} 
              onClose={closeAllDropdowns} 
              notifications={notifications} 
            />
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={handleProfileClick}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
            >
              <ProfileImage 
                userName={userName} 
                profileImage={profileImage} 
                size="md" 
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</p>
              </div>
            </button>

            <HeaderProfile 
              isOpen={isProfileOpen} 
              onClose={closeAllDropdowns}
              userName={userName}
              userEmail={userEmail}
              userRole={userRole}
              profileImage={profileImage}
            />
          </div>
        </div>
      </header>

      {/* Overlay for dropdowns */}
      {(isNotificationOpen || isProfileOpen || isCalendarOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeAllDropdowns}
        />
      )}
    </>
  );
};

export default Header;