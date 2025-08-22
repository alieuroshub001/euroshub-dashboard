// app/profile/[id]/page.tsx
"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Profile, { 
  ProfileHeader, 
  BasicInformation, 
  ContactInformation,
  ProfessionalDetails,
  AddressInformation,
  EmergencyContact,
  SkillsCertifications,
  SocialLinks,
  ActivityLog,
  AdminActions
} from '@/components/Profile';
import { UserRole } from '@/types/common';
import { IUserProfile } from '@/types/modules/profile';

// Mock data - in a real app, this would come from your API
const mockProfileData: IUserProfile = {
  _id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'employee' as UserRole,
  profileImage: null,
  phone: '+1234567890',
  bio: 'Software developer with 5+ years of experience in React and Node.js',
  dateOfBirth: new Date('1990-01-01'),
  isActive: true,
  emailVerified: true,
  department: 'Engineering',
  position: 'Senior Software Engineer',
  employeeId: 'EMP-12345',
  dateOfJoining: new Date('2020-01-15'),
  createdAt: new Date('2020-01-15'),
  updatedAt: new Date('2023-12-01'),
  address: {
    street: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    zipCode: '94105'
  },
  emergencyContact: {
    name: 'Jane Doe',
    relationship: 'spouse',
    phone: '+1987654321',
    email: 'jane.doe@example.com'
  },
  skills: ['React', 'Node.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
  certifications: [
    {
      name: 'AWS Certified Solutions Architect',
      issuer: 'Amazon Web Services',
      issueDate: new Date('2022-05-15'),
      expiryDate: new Date('2025-05-15'),
      certificateUrl: 'https://aws.amazon.com/certification'
    }
  ],
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    portfolio: 'https://johndoe.dev'
  }
};

// Mock current user - in a real app, this would come from your authentication context
const mockCurrentUser = {
  id: '1',
  role: 'employee' as UserRole,
  name: 'John Doe',
  email: 'john.doe@example.com'
};

export default function ProfilePage() {
  const params = useParams();
  const profileId = params.id as string;
  const [profileData, setProfileData] = useState<IUserProfile>(mockProfileData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if this is the current user's own profile
  const isOwnProfile = profileId === mockCurrentUser.id;

  // In a real app, you would fetch the profile data based on the ID
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Simulate API call
        // const response = await fetch(`/api/profile/${profileId}`);
        // const data = await response.json();
        // setProfileData(data);
        
        // Using mock data for demonstration
        setTimeout(() => {
          setProfileData(mockProfileData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError('Failed to load profile');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId]);

  const handleProfileUpdate = async (updatedData: Partial<IUserProfile>) => {
    try {
      // In a real app, you would make an API call to update the profile
      // await fetch(`/api/profile/${profileId}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedData)
      // });
      
      // For demonstration, just update the local state
      setProfileData(prev => ({ ...prev, ...updatedData }));
    } catch (err) {
      console.error('Error updating profile:', err);
      throw new Error('Failed to update profile');
    }
  };

  const handleAdminAction = async (action: string, data: any) => {
    try {
      // In a real app, you would make an API call for admin actions
      // await fetch(`/api/admin/${profileId}`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ action, ...data })
      // });
      
      console.log('Admin action:', action, data);
      // You might want to refresh the profile data after admin actions
    } catch (err) {
      console.error('Error performing admin action:', err);
      throw new Error('Failed to perform admin action');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Profile
          currentUser={mockCurrentUser}
          profileData={profileData}
          isOwnProfile={isOwnProfile}
          onProfileUpdate={handleProfileUpdate}
          onAdminAction={handleAdminAction}
        />
      </div>
    </div>
  );
}