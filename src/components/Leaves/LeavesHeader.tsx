// components/Leaves/LeavesHeader.tsx
"use client";
import React from 'react';
import { Plus, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { UserRole } from '@/types/common';

interface LeavesHeaderProps {
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  onCreateNew: () => void;
  canCreate: boolean;
  pendingCount?: number;
}

const LeavesHeader: React.FC<LeavesHeaderProps> = ({
  currentUser,
  onCreateNew,
  canCreate,
  pendingCount = 0
}) => {
  const getRoleGreeting = () => {
    const timeOfDay = new Date().getHours() < 12 ? 'Good morning' : 
                     new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening';
    
    switch (currentUser.role) {
      case 'superadmin':
      case 'admin':
        return `${timeOfDay}, ${currentUser.name}. Manage all leave requests and policies.`;
      case 'hr':
        return `${timeOfDay}, ${currentUser.name}. Review and approve leave requests.`;
      case 'employee':
        return `${timeOfDay}, ${currentUser.name}. Manage your leave requests.`;
      default:
        return `${timeOfDay}, ${currentUser.name}.`;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Title and Description */}
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                Leave Management
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {getRoleGreeting()}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            {pendingCount > 0 && (
              <div className="flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle size={16} />
                <span>{pendingCount} pending request{pendingCount !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Clock size={16} />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          {canCreate && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus size={16} className="mr-2" />
              <span className="hidden sm:inline">Apply for Leave</span>
              <span className="sm:hidden">Apply</span>
            </button>
          )}
          
          {(currentUser.role === 'superadmin' || currentUser.role === 'admin' || currentUser.role === 'hr') && (
            <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
              <Calendar size={16} className="mr-2" />
              <span className="hidden sm:inline">Export Report</span>
              <span className="sm:hidden">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-specific quick actions */}
      {(currentUser.role === 'hr' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">24</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">This Month</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">5</div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-lg font-semibold text-green-600 dark:text-green-400">19</div>
              <div className="text-xs text-green-600 dark:text-green-400">Approved</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-lg font-semibold text-red-600 dark:text-red-400">2</div>
              <div className="text-xs text-red-600 dark:text-red-400">Urgent</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesHeader;