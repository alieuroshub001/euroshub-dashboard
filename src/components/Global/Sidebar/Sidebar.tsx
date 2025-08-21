"use client"
import React, { useState, useEffect } from 'react';
import { 
  User, 
  FolderOpen, 
  CheckSquare, 
  Clock, 
  MessageSquare, 
  Calendar, 
  Activity, 
  Users, 
  BarChart3, 
  ChevronLeft,
  Menu
} from 'lucide-react';

interface SidebarProps {
  userRole: 'superadmin' | 'admin' | 'client' | 'hr' | 'employee';
  userName: string;
  userEmail: string;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface MenuItem {
  text: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  allowedRoles: ('superadmin' | 'admin' | 'client' | 'hr' | 'employee')[];
  href: string;
}

const menuItems: MenuItem[] = [
  {
    text: 'My Profile',
    icon: User,
    allowedRoles: ['superadmin', 'admin', 'client', 'hr', 'employee'],
    href: '/profile'
  },
  {
    text: 'Projects',
    icon: FolderOpen,
    allowedRoles: ['superadmin', 'admin', 'client', 'hr', 'employee'],
    href: '/projects'
  },
  {
    text: 'Tasks',
    icon: CheckSquare,
    allowedRoles: ['superadmin', 'admin', 'client', 'hr', 'employee'],
    href: '/tasks'
  },
  {
    text: 'Attendance',
    icon: Clock,
    allowedRoles: ['superadmin', 'admin', 'hr', 'employee'],
    href: '/attendance'
  },
  {
    text: 'Chat',
    icon: MessageSquare,
    allowedRoles: ['superadmin', 'admin', 'client', 'hr', 'employee'],
    href: '/chat'
  },
  {
    text: 'Leave',
    icon: Calendar,
    allowedRoles: ['superadmin', 'admin', 'hr', 'employee'],
    href: '/leave'
  },
  {
    text: 'Tracking',
    icon: Activity,
    allowedRoles: ['superadmin', 'admin', 'client', 'hr', 'employee'],
    href: '/tracking'
  },
  {
    text: 'User Management',
    icon: Users,
    allowedRoles: ['superadmin', 'admin', 'hr'],
    href: '/users'
  },
];

const Sidebar: React.FC<SidebarProps> = ({ userRole, userName, userEmail, isMobileOpen, setIsMobileOpen }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleDrawerToggle = () => {
    if (isMobile) {
      // On mobile, close the mobile sidebar
      setIsMobileOpen(false);
    } else {
      // On desktop, toggle the sidebar width
      setIsOpen(!isOpen);
    }
  };

  const handleNavigation = (href: string) => {
    // In a real app, you would use your router here
    console.log(`Navigating to: ${href}`);
    if (isMobile) {
      setIsMobileOpen(false);
    }
  };

  const drawerContent = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-gray-200">
        {(isOpen || isMobile) && (
          <div className="flex items-center text-xl font-semibold text-gray-800">
            <BarChart3 size={24} className="mr-3 text-blue-600" />
            ProjectHub
          </div>
        )}
        <button 
          onClick={handleDrawerToggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          aria-label={isMobile ? "Close sidebar" : "Toggle sidebar"}
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
      </div>
      
      {/* User Profile */}
      <div className={`p-4 border-b border-gray-200 ${(isOpen || isMobile) ? 'flex items-center' : 'flex flex-col items-center'}`}>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        {(isOpen || isMobile) && (
          <div className="ml-3 flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{userName}</div>
            <div className="text-xs text-gray-500 truncate">{userEmail}</div>
            <div className="text-xs text-blue-600 capitalize font-medium mt-1">{userRole}</div>
          </div>
        )}
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="px-3">
          {menuItems.map((item) => {
            if (!item.allowedRoles.includes(userRole)) return null;
            
            const IconComponent = item.icon;
            const showText = isOpen || isMobile;
            
            return (
              <button
                key={item.text}
                onClick={() => handleNavigation(item.href)}
                className={`
                  w-full flex items-center rounded-lg transition-all duration-200 mb-1
                  ${showText ? 'px-3 py-2.5 justify-start' : 'px-2 py-2.5 justify-center'} 
                  text-gray-700 hover:bg-gray-100 hover:text-gray-900 group
                `}
              >
                <IconComponent size={20} className="text-gray-500 group-hover:text-gray-700" />
                {showText && (
                  <span className="ml-3 text-sm font-medium">{item.text}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>      
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative h-screen bg-white border-r border-gray-200 z-40 
        transition-all duration-300 ease-in-out
        ${isMobile 
          ? (isMobileOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full') 
          : (isOpen ? 'w-64' : 'w-16')
        }
      `}>
        {(!isMobile || isMobileOpen) && drawerContent}
      </aside>
      
      {/* Mobile overlay */}
      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;