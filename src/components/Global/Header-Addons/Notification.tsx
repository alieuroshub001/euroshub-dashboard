// components/Global/Header-Addons/Notification.tsx
"use client"
import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationItem {
  id: number;
  text: string;
  time: string;
  read: boolean;
}

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

const Notification: React.FC<NotificationProps> = ({ isOpen, onClose, notifications }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full font-medium">
                {unreadCount} new
              </span>
            )}
            <button 
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              <p className="text-sm text-gray-800 dark:text-white">{notification.text}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            No notifications
          </div>
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default Notification;