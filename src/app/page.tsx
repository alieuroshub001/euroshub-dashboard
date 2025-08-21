"use client"
import React, { useState } from 'react';
import Header from '@/components/Global/Header/Header';
import Sidebar from '@/components/Global/Sidebar/Sidebar';

const DashboardLayout: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Example user data
  const userData = {
    userRole: 'admin' as const,
    userName: 'John Doe',
    userEmail: 'john.doe@company.com'
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
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
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
            
            {/* Your page content goes here */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Projects</h3>
                <p className="text-gray-600">Manage your projects and track progress.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tasks</h3>
                <p className="text-gray-600">View and manage your assigned tasks.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Team</h3>
                <p className="text-gray-600">Collaborate with your team members.</p>
              </div>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;