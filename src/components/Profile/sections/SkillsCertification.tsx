// SkillsCertifications.tsx
"use client";
import React, { useState } from 'react';
import { Save, Award, Plus, X, Calendar, ExternalLink } from 'lucide-react';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

interface SectionProps {
  profileData: IUserProfile;
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  isOwnProfile: boolean;
  editMode: boolean;
  onSave: (data: Partial<IUserProfile>) => void;
  loading: boolean;
  canViewField: (fieldName: string) => boolean;
  canEditField: (fieldName: string) => boolean;
}

export const SkillsCertifications: React.FC<SectionProps> = ({
  profileData,
  currentUser,
  isOwnProfile,
  editMode,
  onSave,
  loading,
  canViewField,
  canEditField
}) => {
  const [skills, setSkills] = useState<string[]>(profileData.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState(profileData.certifications || []);
  const [showAddCert, setShowAddCert] = useState(false);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const addCertification = () => {
    const newCert = {
      name: '',
      issuer: '',
      issueDate: new Date(),
      expiryDate: undefined,
      certificateUrl: ''
    };
    setCertifications([...certifications, newCert]);
    setShowAddCert(false);
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const updatedData: Partial<IUserProfile> = {
      skills,
      certifications
    };
    onSave(updatedData);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Skills & Certifications
        </h2>
        
        {editMode && (canEditField('skills') || canEditField('certifications')) && (
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

      {/* Skills Section */}
      {canViewField('skills') && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Skills</h3>
          
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >
                {skill}
                {editMode && canEditField('skills') && (
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <X size={14} />
                  </button>
                )}
              </span>
            ))}
            {skills.length === 0 && (
              <span className="text-gray-500 dark:text-gray-400 italic">No skills added</span>
            )}
          </div>

          {editMode && canEditField('skills') && (
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Certifications Section */}
      {canViewField('certifications') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Certifications</h3>
            {editMode && canEditField('certifications') && (
              <button
                onClick={addCertification}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus size={16} className="mr-1" />
                Add Certification
              </button>
            )}
          </div>

          {certifications.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Award className="mx-auto text-gray-400" size={48} />
              <p className="text-gray-500 dark:text-gray-400 mt-2">No certifications added</p>
            </div>
          ) : (
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Certification Name *
                      </label>
                      {editMode && canEditField('certifications') ? (
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <span className="text-gray-900 dark:text-white">{cert.name || 'Not specified'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Issuer *
                      </label>
                      {editMode && canEditField('certifications') ? (
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <span className="text-gray-900 dark:text-white">{cert.issuer || 'Not specified'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Issue Date *
                      </label>
                      {editMode && canEditField('certifications') ? (
                        <input
                          type="date"
                          value={new Date(cert.issueDate).toISOString().split('T')[0]}
                          onChange={(e) => updateCertification(index, 'issueDate', new Date(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <span className="text-gray-900 dark:text-white">
                            {new Date(cert.issueDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date
                      </label>
                      {editMode && canEditField('certifications') ? (
                        <input
                          type="date"
                          value={cert.expiryDate ? new Date(cert.expiryDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => updateCertification(index, 'expiryDate', e.target.value ? new Date(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <span className="text-gray-900 dark:text-white">
                            {cert.expiryDate ? new Date(cert.expiryDate).toLocaleDateString() : 'No expiry'}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Certificate URL
                      </label>
                      {editMode && canEditField('certifications') ? (
                        <input
                          type="url"
                          value={cert.certificateUrl || ''}
                          onChange={(e) => updateCertification(index, 'certificateUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      ) : (
                        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          {cert.certificateUrl ? (
                            <a
                              href={cert.certificateUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
                            >
                              View Certificate
                              <ExternalLink size={14} className="ml-1" />
                            </a>
                          ) : (
                            <span className="text-gray-900 dark:text-white">No URL provided</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {editMode && canEditField('certifications') && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm"
                      >
                        Remove Certification
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};