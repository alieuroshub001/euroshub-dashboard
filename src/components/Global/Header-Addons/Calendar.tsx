// components/Global/Header-Addons/Calendar.tsx
"use client"
import React from 'react';
import { X } from 'lucide-react';

interface CalendarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ isOpen, onClose }) => {
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-white">Calendar</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-center text-sm font-medium text-gray-800 dark:text-white mb-4">
          {formattedDate}
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              className={`h-8 w-8 text-xs rounded-lg transition-colors ${
                day === currentDate.getDate()
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;