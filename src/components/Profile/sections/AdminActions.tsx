"use client";
import React, { useState } from 'react';
import { 
  Shield, 
  UserX, 
  UserCheck, 
  Mail, 
  Key, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

interface AdminActionsProps {
  profileData: IUserProfile;
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  onAdminAction?: (action: string, data: any) => void;
}

const AdminActions: React.FC<AdminActionsProps> = ({
  profileData,
  currentUser,
  onAdminAction
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>(profileData.role);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if current user has permission to perform admin actions
  const canPerformAdminActions = currentUser.role === 'superadmin' || currentUser.role === 'admin';
  const canChangeRoles = currentUser.role === 'superadmin' || 
    (currentUser.role === 'admin' && profileData.role !== 'superadmin');
  const canDeleteUser = currentUser.role === 'superadmin';

  if (!canPerformAdminActions) {
    return (
      <div className="text-center py-8">
        <Shield className="mx-auto text-gray-400" size={48} />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Access Denied
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          You don't have permission to access admin actions.
        </p>
      </div>
    );
  }

  const handleAction = async (action: string, data?: any) => {
    if (!onAdminAction) return;

    setLoading(true);
    try {
      await onAdminAction(action, { ...data, reason, targetUserId: profileData._id });
      setSelectedAction(null);
      setReason('');
    } catch (error) {
      console.error('Admin action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: UserRole[] = currentUser.role === 'superadmin' 
    ? ['superadmin', 'admin', 'hr', 'employee', 'client']
    : ['admin', 'hr', 'employee', 'client'];

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

  const ActionButton = ({ 
    action, 
    icon: Icon, 
    label, 
    description, 
    variant = 'default',
    disabled = false 
  }: {
    action: string;
    icon: React.ComponentType<any>;
    label: string;
    description: string;
    variant?: 'default' | 'danger' | 'warning' | 'success';
    disabled?: boolean;
  }) => {
    const baseClasses = "w-full text-left p-4 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
    const variantClasses = {
      default: "border-gray-200 hover:border-blue-300 hover:bg-blue-50 dark:border-gray-600 dark:hover:border-blue-400 dark:hover:bg-blue-900/20",
      success: "border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-600 dark:hover:border-green-400 dark:hover:bg-green-900/20",
      warning: "border-yellow-200 hover:border-yellow-300 hover:bg-yellow-50 dark:border-yellow-600 dark:hover:border-yellow-400 dark:hover:bg-yellow-900/20",
      danger: "border-red-200 hover:border-red-300 hover:bg-red-50 dark:border-red-600 dark:hover:border-red-400 dark:hover:bg-red-900/20"
    };

    return (
      <button
        onClick={() => setSelectedAction(action)}
        disabled={disabled}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        <div className="flex items-start space-x-3">
          <Icon size={20} className="mt-0.5 text-gray-500 dark:text-gray-400" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{label}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  const ConfirmationModal = () => {
    if (!selectedAction) return null;

    const actionConfig = {
      'change-role': {
        title: 'Change User Role',
        description: 'This will change the user\'s access permissions.',
        variant: 'warning' as const,
        showRoleSelector: true
      },
      'activate': {
        title: 'Activate User',
        description: 'This user will be able to access the system.',
        variant: 'success' as const
      },
      'deactivate': {
        title: 'Deactivate User',
        description: 'This user will not be able to access the system.',
        variant: 'warning' as const
      },
      'reset-password': {
        title: 'Reset Password',
        description: 'A password reset link will be sent to the user\'s email.',
        variant: 'default' as const
      },
      'verify-email': {
        title: 'Verify Email',
        description: 'Mark this user\'s email as verified.',
        variant: 'success' as const
      },
      'delete': {
        title: 'Delete User',
        description: 'This action cannot be undone. All user data will be permanently deleted.',
        variant: 'danger' as const
      }
    };

    const config = actionConfig[selectedAction as keyof typeof actionConfig];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-full ${
              config.variant === 'danger' ? 'bg-red-100 dark:bg-red-900' :
              config.variant === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
              config.variant === 'success' ? 'bg-green-100 dark:bg-green-900' :
              'bg-blue-100 dark:bg-blue-900'
            }`}>
              <AlertTriangle size={20} className={
                config.variant === 'danger' ? 'text-red-600 dark:text-red-400' :
                config.variant === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                config.variant === 'success' ? 'text-green-600 dark:text-green-400' :
                'text-blue-600 dark:text-blue-400'
              } />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {config.title}
            </h3>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {config.description}
          </p>

          {config.showRoleSelector && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role} disabled={role === profileData.role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                    {role === profileData.role ? ' (Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a reason for this action..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setSelectedAction(null)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={() => handleAction(selectedAction, config.showRoleSelector ? { newRole } : {})}
              disabled={loading}
              className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
                config.variant === 'danger' 
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Admin Actions
        </h2>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Current Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Role:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs capitalize ${getRoleColor(profileData.role)}`}>
              {profileData.role}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Account:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              profileData.isActive 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
            }`}>
              {profileData.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Email:</span>
            <span className={`ml-2 px-2 py-1 rounded text-xs ${
              profileData.emailVerified 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
            }`}>
              {profileData.emailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role Management */}
        {canChangeRoles && (
          <ActionButton
            action="change-role"
            icon={Shield}
            label="Change Role"
            description="Modify user's role and permissions"
            variant="warning"
          />
        )}

        {/* Account Status */}
        {profileData.isActive ? (
          <ActionButton
            action="deactivate"
            icon={UserX}
            label="Deactivate Account"
            description="Prevent user from accessing the system"
            variant="warning"
          />
        ) : (
          <ActionButton
            action="activate"
            icon={UserCheck}
            label="Activate Account"
            description="Allow user to access the system"
            variant="success"
          />
        )}

        {/* Email Verification */}
        {!profileData.emailVerified && (
          <ActionButton
            action="verify-email"
            icon={CheckCircle}
            label="Verify Email"
            description="Mark user's email as verified"
            variant="success"
          />
        )}

        {/* Password Reset */}
        <ActionButton
          action="reset-password"
          icon={Key}
          label="Reset Password"
          description="Send password reset link to user"
        />

        {/* Send Notification */}
        <ActionButton
          action="send-notification"
          icon={Mail}
          label="Send Notification"
          description="Send a custom notification to user"
        />

        {/* Delete User */}
        {canDeleteUser && (
          <ActionButton
            action="delete"
            icon={Trash2}
            label="Delete User"
            description="Permanently remove user and all data"
            variant="danger"
          />
        )}
      </div>

      {/* Warning for sensitive actions */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
          <div className="ml-3">
            <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Important Notice
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              All admin actions are logged and audited. Use these features responsibly and ensure you have proper authorization before making changes to user accounts.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Actions Log Preview */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Actions on This User
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          No recent actions recorded.
        </div>
        {/* In a real app, you would display actual audit log entries here */}
      </div>

      <ConfirmationModal />
    </div>
  );
};

export default AdminActions;