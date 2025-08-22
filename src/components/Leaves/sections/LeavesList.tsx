// components/Leaves/sections/LeavesList.tsx
"use client";
import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Edit3, 
  Trash2,
  Filter,
  Search,
  Plus,
  Eye,
  Download
} from 'lucide-react';
import { UserRole } from '@/types/common';
import { ILeaveWithDetails, LeaveType, LeaveStatus, ILeaveFilter } from '@/types/modules/leaves';
import { canPerformLeaveAction } from '@/types/modules/leaves/permission';

interface LeavesListProps {
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  leaves: ILeaveWithDetails[];
  loading: boolean;
  showAllLeaves?: boolean;
  onLeaveSelect: (leave: ILeaveWithDetails) => void;
  onCreateNew: () => void;
  onLeaveAction: (action: string, leaveId: string, data?: any) => Promise<void>;
  filters: ILeaveFilter;
  onFiltersChange: (filters: ILeaveFilter) => void;
}

const LeavesList: React.FC<LeavesListProps> = ({
  currentUser,
  leaves,
  loading,
  showAllLeaves = false,
  onLeaveSelect,
  onCreateNew,
  onLeaveAction,
  filters,
  onFiltersChange
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([]);

  const getStatusColor = (status: LeaveStatus) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      expired: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    };
    return colors[status];
  };

  const getStatusIcon = (status: LeaveStatus) => {
    const icons = {
      pending: <AlertCircle size={16} />,
      approved: <CheckCircle size={16} />,
      rejected: <XCircle size={16} />,
      cancelled: <XCircle size={16} />,
      expired: <Clock size={16} />
    };
    return icons[status];
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    const colors = {
      vacation: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      sick: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      maternity: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
      paternity: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
      bereavement: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
      emergency: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
      other: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300'
    };
    return colors[type];
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString();
    }
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  };

  const handleActionClick = async (action: string, leave: ILeaveWithDetails, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (action === 'edit') {
      onLeaveSelect(leave);
      return;
    }
    
    if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this leave request?')) {
        await onLeaveAction(action, leave._id);
      }
      return;
    }
    
    await onLeaveAction(action, leave._id);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedLeaves.length === 0) return;
    
    const confirmMessage = `Are you sure you want to ${action} ${selectedLeaves.length} leave request(s)?`;
    if (window.confirm(confirmMessage)) {
      for (const leaveId of selectedLeaves) {
        await onLeaveAction(action, leaveId);
      }
      setSelectedLeaves([]);
    }
  };

  const toggleLeaveSelection = (leaveId: string) => {
    setSelectedLeaves(prev => 
      prev.includes(leaveId) 
        ? prev.filter(id => id !== leaveId)
        : [...prev, leaveId]
    );
  };

  const FilterPanel = () => (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            multiple
            value={filters.status || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value as LeaveStatus);
              onFiltersChange({ ...filters, status: values });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Leave Type
          </label>
          <select
            multiple
            value={filters.type || []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions, option => option.value as LeaveType);
              onFiltersChange({ ...filters, type: values });
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
          >
            <option value="vacation">Vacation</option>
            <option value="sick">Sick</option>
            <option value="personal">Personal</option>
            <option value="maternity">Maternity</option>
            <option value="paternity">Paternity</option>
            <option value="bereavement">Bereavement</option>
            <option value="emergency">Emergency</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="space-y-2">
            <input
              type="date"
              value={filters.dateFrom ? new Date(filters.dateFrom).toISOString().split('T')[0] : ''}
              onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value ? new Date(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
            <input
              type="date"
              value={filters.dateTo ? new Date(filters.dateTo).toISOString().split('T')[0] : ''}
              onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value ? new Date(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <button
          onClick={() => onFiltersChange({ page: 1, limit: 10 })}
          className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 flex-1 sm:mr-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by employee name or reason..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium transition-colors ${
              showFilters 
                ? 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300'
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Filter size={16} className="mr-2" />
            Filters
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedLeaves.length > 0 && (currentUser.role === 'hr' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {selectedLeaves.length} selected
            </span>
            <button
              onClick={() => handleBulkAction('approve')}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Approve
            </button>
            <button
              onClick={() => handleBulkAction('reject')}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Reject
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {canPerformLeaveAction(currentUser.role, 'create', true) && (
            <button
              onClick={onCreateNew}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus size={16} className="mr-2" />
              <span className="hidden sm:inline">New Leave</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
          
          {(currentUser.role === 'hr' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <Download size={16} className="mr-2" />
              <span className="hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && <FilterPanel />}

      {/* Leave Cards */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No leave requests found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {showAllLeaves 
                ? "No leave requests match your current filters."
                : "You haven't submitted any leave requests yet."
              }
            </p>
            {canPerformLeaveAction(currentUser.role, 'create', true) && !showAllLeaves && (
              <button
                onClick={onCreateNew}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus size={16} className="mr-2" />
                Apply for Leave
              </button>
            )}
          </div>
        ) : (
          leaves.map((leave) => (
            <div
              key={leave._id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onLeaveSelect(leave)}
            >
              <div className="flex items-start space-x-4">
                {/* Selection Checkbox */}
                {(currentUser.role === 'hr' || currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
                  <div className="flex items-center pt-1">
                    <input
                      type="checkbox"
                      checked={selectedLeaves.includes(leave._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleLeaveSelection(leave._id);
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                )}

                {/* Avatar/Icon */}
                <div className="flex-shrink-0">
                  {leave.employeeDetails.profileImage ? (
                    <img
                      src={leave.employeeDetails.profileImage}
                      alt={leave.employeeDetails.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {showAllLeaves ? leave.employeeDetails.name : 'Leave Request'}
                        </h3>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getLeaveTypeColor(leave.type)}`}>
                          {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)}
                        </span>
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                          {getStatusIcon(leave.status)}
                          <span className="ml-1">{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                        </span>

                        {leave.isEmergency && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                            🚨 Emergency
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{formatDateRange(leave.startDate, leave.endDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{leave.totalDays} day{leave.totalDays !== 1 ? 's' : ''}</span>
                          </div>
                        </div>
                        
                        {leave.reason && (
                          <div className="flex items-start space-x-1">
                            <FileText size={14} className="mt-0.5 flex-shrink-0" />
                            <p className="line-clamp-2">{leave.reason}</p>
                          </div>
                        )}

                        {showAllLeaves && leave.employeeDetails.department && (
                          <div className="text-xs text-gray-500">
                            {leave.employeeDetails.department}
                          </div>
                        )}
                      </div>

                      {/* Review Info */}
                      {leave.reviewedBy && leave.reviewedAt && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          {leave.status === 'approved' ? 'Approved' : 'Reviewed'} by{' '}
                          {leave.reviewerDetails?.name || 'System'} on{' '}
                          {new Date(leave.reviewedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {/* View Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLeaveSelect(leave);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Edit Button */}
                      {canPerformLeaveAction(currentUser.role, 'update', leave.employeeId === currentUser.id, leave.status) && leave.canEdit && (
                        <button
                          onClick={(e) => handleActionClick('edit', leave, e)}
                          className="p-2 text-blue-400 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit3 size={16} />
                        </button>
                      )}

                      {/* Delete Button */}
                      {canPerformLeaveAction(currentUser.role, 'delete', leave.employeeId === currentUser.id, leave.status) && (
                        <button
                          onClick={(e) => handleActionClick('delete', leave, e)}
                          className="p-2 text-red-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}

                      {/* Approve/Reject Buttons */}
                      {leave.status === 'pending' && canPerformLeaveAction(currentUser.role, 'approve', false) && (
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => handleActionClick('approve', leave, e)}
                            className="p-2 text-green-400 hover:text-green-600"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={(e) => handleActionClick('reject', leave, e)}
                            className="p-2 text-red-400 hover:text-red-600"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {leaves.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6 rounded-b-lg">
          <div className="flex justify-between flex-1 sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              Previous
            </button>
            <button className="relative ml-3 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{leaves.length}</span> of{' '}
                <span className="font-medium">{leaves.length}</span> results
              </p>
            </div>
            
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeavesList;