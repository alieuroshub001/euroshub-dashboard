// app/chat/page.tsx
"use client"
import React, { useState } from 'react';
import Header from '@/components/Global/Header/Header';
import Sidebar from '@/components/Global/Sidebar/Sidebar';
import { ChatMain } from '@/components/Chat';

const ChatPage: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Example user data
  const userData = {
    userRole: 'admin' as const,
    userName: 'John Doe',
    userEmail: 'john.doe@company.com'
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
        
        {/* Chat main component */}
        <main className="flex-1 overflow-hidden">
          <ChatMain />
        </main>
      </div>
    </div>
  );
};

export default ChatPage;