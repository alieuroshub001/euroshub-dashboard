// components/Leaves/sections/LeaveForm.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  X, 
  Calendar, 
  Clock, 
  FileText, 
  User, 
  AlertTriangle,
  Upload,
  Trash2
} from 'lucide-react';
import { UserRole } from '@/types/common';
import { ILeaveWithDetails, LeaveType, LeaveDuration } from '@/types/modules/leaves';
import { canUseLeaveType } from '@/types/modules/leaves/permission';

interface LeaveFormProps {
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  leave?: ILeaveWithDetails;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEditing?: boolean;
}

const LeaveForm: React.FC<LeaveFormProps> = ({
  currentUser,
  leave,
  onSubmit,
  onCancel,
  loading = false,
  isEditing = false
}) => {
  const [formData, setFormData] = useState({
    type: (leave?.type as LeaveType) || 'vacation',
    startDate: leave?.startDate ? new Date(leave.startDate).toISOString().split('T')[0] : '',
    endDate: leave?.endDate ? new Date(leave.endDate).toISOString().split('T')[0] : '',
    duration: (leave?.duration as LeaveDuration) || 'full_day',
    totalHours: leave?.totalHours || undefined,
    reason: leave?.reason || '',
    isEmergency: leave?.isEmergency || false,
    contactDuringLeave: {
      phone: leave?.contactDuringLeave?.phone || '',
      email: leave?.contactDuringLeave?.email || '',
      address: leave?.contactDuringLeave?.address || ''
    },
    delegatedTo: leave?.delegatedTo || '',
    delegationNotes: leave?.delegationNotes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<File[]>([]);
  const [totalDays, setTotalDays] = useState(0);

  // Calculate total days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      let calculatedDays = diffDays;
      if (formData.duration === 'half_day') {
        calculatedDays = diffDays * 0.5;
      }
      
      setTotalDays(calculatedDays);
    }
  }, [formData.startDate, formData.endDate, formData.duration]);

  const availableLeaveTypes = [
    { value: 'vacation', label: 'Vacation', description: 'Planned time off for rest and recreation' },
    { value: 'sick', label: 'Sick Leave', description: 'Time off due to illness or medical appointments' },
    { value: 'personal', label: 'Personal Leave', description: 'Personal matters that require time off' },
    { value: 'maternity', label: 'Maternity Leave', description: 'Time off for childbirth and bonding' },
    { value: 'paternity', label: 'Paternity Leave', description: 'Time off for new fathers' },
    { value: 'bereavement', label: 'Bereavement Leave', description: 'Time off due to death of family member' },
    { value: 'emergency', label: 'Emergency Leave', description: 'Unexpected urgent situations' },
    { value: 'other', label: 'Other', description: 'Other types of leave' }
  ].filter(type => canUseLeaveType(currentUser.role, type.value));

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as object,
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.type) {
      newErrors.type = 'Leave type is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (startDate > endDate) {
        newErrors.endDate = 'End date must be after start date';
      }

      // Check if start date is in the past (except for sick leave and emergency)
      if (!isEditing && !['sick', 'emergency'].includes(formData.type)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);
        
        if (startDate < today) {
          newErrors.startDate = 'Start date cannot be in the past for this leave type';
        }
      }
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    if (formData.duration === 'hours' && (!formData.totalHours || formData.totalHours <= 0)) {
      newErrors.totalHours = 'Total hours is required for hourly leave';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const submitData = {
      ...formData,
      totalDays,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      attachments: attachments // In a real app, you'd upload these first
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission failed:', error);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Leave Request' : 'Apply for Leave'}
          </h2>
        </div>
        
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Leave Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Leave Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            {availableLeaveTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.type && <p className="text-sm text-red-600 dark:text-red-400">{errors.type}</p>}
          
          {/* Show description for selected type */}
          {formData.type && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {availableLeaveTypes.find(t => t.value === formData.type)?.description}
            </p>
          )}
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.startDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.startDate}</p>}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.endDate && <p className="text-sm text-red-600 dark:text-red-400">{errors.endDate}</p>}
          </div>
        </div>

        {/* Duration Type */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Duration Type *
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'full_day', label: 'Full Day' },
              { value: 'half_day', label: 'Half Day' },
              { value: 'hours', label: 'Hours' }
            ].map((option) => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  value={option.value}
                  checked={formData.duration === option.value}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>

          {/* Hours input for hourly duration */}
          {formData.duration === 'hours' && (
            <div className="mt-2">
              <input
                type="number"
                placeholder="Total hours"
                value={formData.totalHours || ''}
                onChange={(e) => handleInputChange('totalHours', parseFloat(e.target.value) || undefined)}
                className={`w-32 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.totalHours ? 'border-red-500' : 'border-gray-300'
                }`}
                min="0.5"
                step="0.5"
                disabled={loading}
              />
              {errors.totalHours && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.totalHours}</p>}
            </div>
          )}

          {/* Total Days Display */}
          {totalDays > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock size={14} />
              <span>Total: {totalDays} day{totalDays !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason *
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Please provide a detailed reason for your leave request..."
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.reason ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.reason && <p className="text-sm text-red-600 dark:text-red-400">{errors.reason}</p>}
        </div>

        {/* Emergency Leave */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isEmergency"
            checked={formData.isEmergency}
            onChange={(e) => handleInputChange('isEmergency', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="isEmergency" className="text-sm text-gray-700 dark:text-gray-300">
            This is an emergency leave request
          </label>
        </div>

        {formData.isEmergency && (
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="text-orange-600 dark:text-orange-400 mt-0.5" size={20} />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200">
                  Emergency Leave Notice
                </h4>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  Emergency leaves may be approved with less advance notice. Please ensure you provide adequate documentation and contact information.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information During Leave */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Contact Information During Leave
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.contactDuringLeave.phone}
                onChange={(e) => handleInputChange('contactDuringLeave.phone', e.target.value)}
                placeholder="Emergency contact number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                type="email"
                value={formData.contactDuringLeave.email}
                onChange={(e) => handleInputChange('contactDuringLeave.email', e.target.value)}
                placeholder="Alternative email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Address During Leave
            </label>
            <input
              type="text"
              value={formData.contactDuringLeave.address}
              onChange={(e) => handleInputChange('contactDuringLeave.address', e.target.value)}
              placeholder="Where you'll be staying during leave"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>
        </div>

        {/* Work Delegation */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Work Delegation
          </h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Delegate Work To
            </label>
            <input
              type="text"
              value={formData.delegatedTo}
              onChange={(e) => handleInputChange('delegatedTo', e.target.value)}
              placeholder="Name or ID of colleague who will handle your responsibilities"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Delegation Notes
            </label>
            <textarea
              value={formData.delegationNotes}
              onChange={(e) => handleInputChange('delegationNotes', e.target.value)}
              placeholder="Provide details about tasks to be delegated and any special instructions..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </div>
        </div>

        {/* File Attachments */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Supporting Documents
          </h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Attachments
            </label>
            <div className="flex items-center space-x-4">
              <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <Upload size={16} className="mr-2" />
                Upload Files
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  disabled={loading}
                />
              </label>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
              </span>
            </div>
          </div>

          {/* Display uploaded files */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploaded Files:</h4>
              <div className="space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                      disabled={loading}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leave Balance Warning (if applicable) */}
        {currentUser.role === 'employee' && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <Calendar className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Leave Balance Information
                </h4>
                <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                  This request will use {totalDays} day{totalDays !== 1 ? 's' : ''} from your {formData.type} leave balance.
                  Please check your leave balance to ensure you have sufficient days available.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {loading 
              ? 'Processing...' 
              : isEditing 
                ? 'Update Leave Request' 
                : 'Submit Leave Request'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default LeaveForm;