// components/Leaves/Leaves.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { UserRole } from '@/types/common';
import { ILeaveWithDetails, LeaveStatus, LeaveType, ILeaveFilter } from '@/types/modules/leaves';
import { canPerformLeaveAction } from '@/types/modules/leaves/permission';

// Component imports
import LeavesHeader from './LeavesHeader';
import LeavesList from './sections/LeavesList';
import LeaveForm from './sections/LeaveForm';
import LeaveStats from './sections/LeaveStats';
import LeaveBalance from './sections/LeaveBalance';
import LeavePolicies from './sections/LeavePolicies';
import LeaveCalendar from './sections/LeaveCalendar';
import LeaveApprovals from './sections/LeaveApprovals';

interface LeavesProps {
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
    employeeId?: string;
  };
  leaves: ILeaveWithDetails[];
  loading?: boolean;
  onLeaveAction?: (action: string, leaveId: string, data?: any) => Promise<void>;
  onCreateLeave?: (leaveData: any) => Promise<void>;
  onUpdateLeave?: (leaveId: string, leaveData: any) => Promise<void>;
  onDeleteLeave?: (leaveId: string) => Promise<void>;
}

const Leaves: React.FC<LeavesProps> = ({
  currentUser,
  leaves: initialLeaves,
  loading = false,
  onLeaveAction,
  onCreateLeave,
  onUpdateLeave,
  onDeleteLeave
}) => {
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [leaves, setLeaves] = useState<ILeaveWithDetails[]>(initialLeaves);
  const [selectedLeave, setSelectedLeave] = useState<ILeaveWithDetails | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState<ILeaveFilter>({
    page: 1,
    limit: 10,
    employeeId: currentUser.role === 'employee' ? [currentUser.id] : undefined
  });

  // Role-based tab configuration
  const roleTabConfig = {
    superadmin: ['my-leaves', 'all-leaves', 'approvals', 'stats', 'balance', 'calendar', 'policies'],
    admin: ['my-leaves', 'all-leaves', 'approvals', 'stats', 'balance', 'calendar', 'policies'],
    hr: ['my-leaves', 'all-leaves', 'approvals', 'stats', 'balance', 'calendar'],
    employee: ['my-leaves', 'balance', 'calendar'],
    client: []
  };

  const availableTabs = roleTabConfig[currentUser.role] || [];

  const tabs = [
    { id: 'my-leaves', label: 'My Leaves', icon: 'User' },
    { id: 'all-leaves', label: 'All Leaves', icon: 'Users' },
    { id: 'approvals', label: 'Approvals', icon: 'CheckSquare' },
    { id: 'stats', label: 'Statistics', icon: 'BarChart3' },
    { id: 'balance', label: 'Leave Balance', icon: 'Clock' },
    { id: 'calendar', label: 'Calendar', icon: 'Calendar' },
    { id: 'policies', label: 'Policies', icon: 'FileText' }
  ].filter(tab => availableTabs.includes(tab.id));

  // Set default tab based on role
  useEffect(() => {
    if (!availableTabs.includes(activeTab)) {
      setActiveTab(availableTabs[0] || 'my-leaves');
    }
  }, [currentUser.role]);

  const handleLeaveAction = async (action: string, leaveId: string, data?: any) => {
    if (!onLeaveAction) return;

    try {
      await onLeaveAction(action, leaveId, data);
      // Refresh leaves list or update specific leave
      if (action === 'delete') {
        setLeaves(prev => prev.filter(leave => leave._id !== leaveId));
      } else {
        // In a real app, you would refetch or update the specific leave
        console.log(`Leave ${action} completed for ${leaveId}`);
      }
    } catch (error) {
      console.error('Leave action failed:', error);
    }
  };

  const handleCreateLeave = async (leaveData: any) => {
    if (!onCreateLeave) return;

    try {
      await onCreateLeave(leaveData);
      setShowCreateForm(false);
      // In a real app, you would refetch the leaves list
    } catch (error) {
      console.error('Create leave failed:', error);
    }
  };

  const handleUpdateLeave = async (leaveId: string, leaveData: any) => {
    if (!onUpdateLeave) return;

    try {
      await onUpdateLeave(leaveId, leaveData);
      setSelectedLeave(null);
    } catch (error) {
      console.error('Update leave failed:', error);
    }
  };

  const getFilteredLeaves = () => {
    let filteredLeaves = leaves;

    switch (activeTab) {
      case 'my-leaves':
        filteredLeaves = leaves.filter(leave => leave.employeeId === currentUser.id);
        break;
      case 'approvals':
        filteredLeaves = leaves.filter(leave => 
          leave.status === 'pending' && 
          canPerformLeaveAction(currentUser.role, 'approve', false)
        );
        break;
      default:
        filteredLeaves = leaves;
    }

    // Apply additional filters
    if (filters.status?.length) {
      filteredLeaves = filteredLeaves.filter(leave => 
        filters.status!.includes(leave.status)
      );
    }

    if (filters.type?.length) {
      filteredLeaves = filteredLeaves.filter(leave => 
        filters.type!.includes(leave.type)
      );
    }

    if (filters.search) {
      filteredLeaves = filteredLeaves.filter(leave =>
        leave.employeeDetails.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        leave.reason.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    return filteredLeaves;
  };

  const renderSection = () => {
    const sectionProps = {
      currentUser,
      leaves: getFilteredLeaves(),
      loading,
      onLeaveAction: handleLeaveAction,
      onCreateLeave: handleCreateLeave,
      onUpdateLeave: handleUpdateLeave,
      filters,
      onFiltersChange: setFilters
    };

    switch (activeTab) {
      case 'my-leaves':
      case 'all-leaves':
        return (
          <LeavesList
            {...sectionProps}
            showAllLeaves={activeTab === 'all-leaves'}
            onLeaveSelect={setSelectedLeave}
            onCreateNew={() => setShowCreateForm(true)}
          />
        );
      case 'approvals':
        return <LeaveApprovals {...sectionProps} />;
      case 'stats':
        return <LeaveStats {...sectionProps} />;
      case 'balance':
        return <LeaveBalance {...sectionProps} />;
      case 'calendar':
        return <LeaveCalendar {...sectionProps} />;
      case 'policies':
        return <LeavePolicies {...sectionProps} />;
      default:
        return <LeavesList {...sectionProps} />;
    }
  };

  if (currentUser.role === 'client') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You don't have permission to access the leaves module.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <LeavesHeader
        currentUser={currentUser}
        onCreateNew={() => setShowCreateForm(true)}
        canCreate={canPerformLeaveAction(currentUser.role, 'create', true)}
        pendingCount={leaves.filter(l => l.status === 'pending' && l.employeeId === currentUser.id).length}
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
                  flex items-center px-4 md:px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }
                `}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 md:p-6">
          {renderSection()}
        </div>
      </div>

      {/* Create Leave Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <LeaveForm
              currentUser={currentUser}
              onSubmit={handleCreateLeave}
              onCancel={() => setShowCreateForm(false)}
              loading={loading}
            />
          </div>
        </div>
      )}

      {/* Edit Leave Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <LeaveForm
              currentUser={currentUser}
              leave={selectedLeave}
              onSubmit={(data) => handleUpdateLeave(selectedLeave._id, data)}
              onCancel={() => setSelectedLeave(null)}
              loading={loading}
              isEditing
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;