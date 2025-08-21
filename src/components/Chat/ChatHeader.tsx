// components/Chat/ChatHeader.tsx
"use client"
import React, { useState } from 'react';
import { Phone, Video, Info, MoreVertical, Menu, Users } from 'lucide-react';
import ProfileImage from '../Global/Header-Addons/Profile-Image';

interface Conversation {
  id: string;
  participants: any[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage?: any;
  unreadCount: number;
}

interface ChatHeaderProps {
  conversation: Conversation;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onToggleSidebar
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDisplayName = () => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Group Chat';
    }
    return conversation.participants[0]?.name || 'Unknown';
  };

  const getStatus = () => {
    if (conversation.isGroup) {
      return `${conversation.participants.length} members`;
    }
    
    const user = conversation.participants[0];
    if (!user) return '';
    
    if (user.status === 'online') {
      return 'Online';
    } else if (user.status === 'away') {
      return 'Away';
    } else {
      return user.lastSeen ? `Last seen ${user.lastSeen}` : 'Offline';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 mr-2"
        >
          <Menu size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="relative flex-shrink-0">
          {conversation.isGroup ? (
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Users size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          ) : (
            <ProfileImage 
              userName={conversation.participants[0]?.name || 'Unknown'} 
              size="md"
            />
          )}
          
          {!conversation.isGroup && conversation.participants[0]?.status === 'online' && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
          )}
        </div>
        
        <div className="ml-3">
          <h2 className="text-sm font-medium text-gray-800 dark:text-white">
            {getDisplayName()}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getStatus()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Phone size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Video size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <Info size={18} className="text-gray-600 dark:text-gray-400" />
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <MoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Mute notifications
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Clear chat
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                Delete conversation
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for dropdown menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatHeader;