import { UserRole } from "@/types/common";
import { IUserProfile } from "@/types/modules/profile";

// ActivityLog.tsx
export const ActivityLog: React.FC<{
  profileData: IUserProfile;
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
}> = ({ profileData, currentUser }) => {
  // Mock activity data - in real app, this would come from API
  const activities = [
    {
      id: 1,
      type: 'profile_update',
      description: 'Updated profile information',
      timestamp: new Date('2024-01-15T10:30:00'),
      details: 'Changed phone number and address'
    },
    {
      id: 2,
      type: 'skill_added',
      description: 'Added new skill: React',
      timestamp: new Date('2024-01-14T15:20:00'),
      details: null
    },
    {
      id: 3,
      type: 'certification_added',
      description: 'Added AWS Solutions Architect certification',
      timestamp: new Date('2024-01-12T09:15:00'),
      details: 'Issued by Amazon Web Services'
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'profile_update':
        return '👤';
      case 'skill_added':
        return '🎯';
      case 'certification_added':
        return '🏆';
      default:
        return '📝';
    }
  };

  const canViewActivity = currentUser.role === 'superadmin' || 
                         currentUser.role === 'admin' || 
                         (currentUser.role === 'hr' && currentUser.id !== profileData._id);

  if (!canViewActivity && currentUser.id !== profileData._id) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Activity log is not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Activity Log
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.description}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.timestamp.toLocaleString()}
                  </p>
                </div>
                {activity.details && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {activity.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {activities.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};