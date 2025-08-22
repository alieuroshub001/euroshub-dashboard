import { IUserProfile } from "@/types/modules/profile";
import { Save, ExternalLink } from "lucide-react";
import { useState } from "react";

// SocialLinks.tsx
export const SocialLinks: React.FC<SectionProps> = ({
  profileData,
  currentUser,
  isOwnProfile,
  editMode,
  onSave,
  loading,
  canViewField,
  canEditField
}) => {
  const [formData, setFormData] = useState({
    linkedin: profileData.socialLinks?.linkedin || '',
    github: profileData.socialLinks?.github || '',
    twitter: profileData.socialLinks?.twitter || '',
    portfolio: profileData.socialLinks?.portfolio || ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const updatedData: Partial<IUserProfile> = {
      socialLinks: {
        linkedin: formData.linkedin || undefined,
        github: formData.github || undefined,
        twitter: formData.twitter || undefined,
        portfolio: formData.portfolio || undefined
      }
    };
    onSave(updatedData);
  };

  const socialPlatforms = [
    { 
      key: 'linkedin', 
      label: 'LinkedIn', 
      placeholder: 'https://linkedin.com/in/username',
      icon: '💼'
    },
    { 
      key: 'github', 
      label: 'GitHub', 
      placeholder: 'https://github.com/username',
      icon: '🐙'
    },
    { 
      key: 'twitter', 
      label: 'Twitter', 
      placeholder: 'https://twitter.com/username',
      icon: '🐦'
    },
    { 
      key: 'portfolio', 
      label: 'Portfolio/Website', 
      placeholder: 'https://yourwebsite.com',
      icon: '🌐'
    }
  ];

  if (!canViewField('socialLinks')) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Social links are not available.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Social Links
        </h2>
        
        {editMode && canEditField('socialLinks') && (
          <button
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save size={16} className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {socialPlatforms.map((platform) => (
          <div key={platform.key} className="space-y-2">
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <span className="text-lg mr-2">{platform.icon}</span>
              {platform.label}
            </label>
            
            {editMode && canEditField('socialLinks') ? (
              <input
                type="url"
                value={formData[platform.key as keyof typeof formData]}
                onChange={(e) => handleInputChange(platform.key, e.target.value)}
                placeholder={platform.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={loading}
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                {formData[platform.key as keyof typeof formData] ? (
                  <a
                    href={formData[platform.key as keyof typeof formData]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                  >
                    {formData[platform.key as keyof typeof formData]}
                    <ExternalLink size={14} className="ml-1" />
                  </a>
                ) : (
                  <span className="text-gray-900 dark:text-white">Not specified</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};