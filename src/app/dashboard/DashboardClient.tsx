"use client"
import Header from '@/components/Global/Header/Header';
import Sidebar from '@/components/Global/Sidebar/Sidebar';
import { useState } from 'react';

interface DashboardClientProps {
  children: React.ReactNode;
  userRole: 'superadmin' | 'admin' | 'client' | 'hr' | 'employee';
  userName: string;
  userEmail: string;
  profileImage?: string;
}

export default function DashboardClient({ 
  children, 
  userRole, 
  userName, 
  userEmail, 
  profileImage 
}: DashboardClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userData = {
    userRole,
    userName,
    userEmail,
    profileImage
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        {...userData}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          {...userData}
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}