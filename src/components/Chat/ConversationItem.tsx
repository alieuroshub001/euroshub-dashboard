// components/Chat/ConversationItem.tsx
"use client"
import React from 'react';
import { Users, ChevronRight } from 'lucide-react';
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

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onClick
}) => {
  const getDisplayName = () => {
    if (conversation.isGroup) {
      return conversation.groupName || 'Group Chat';
    }
    return conversation.participants[0]?.name || 'Unknown';
  };

  const getLastMessage = () => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const prefix = conversation.lastMessage.senderId === '1' ? 'You: ' : '';
    
    if (conversation.lastMessage.type === 'image') {
      return `${prefix}Sent an image`;
    } else if (conversation.lastMessage.type === 'file') {
      return `${prefix}Sent a file`;
    }
    
    return `${prefix}${conversation.lastMessage.content}`;
  };

  const getTimestamp = () => {
    if (!conversation.lastMessage) return '';
    
    const now = new Date();
    const messageDate = new Date(conversation.lastMessage.timestamp);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div
      className={`flex items-center p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
        isActive 
          ? 'bg-blue-50 dark:bg-blue-900/20' 
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
      }`}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        {conversation.isGroup ? (
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Users size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <ProfileImage 
            userName={conversation.participants[0]?.name || 'Unknown'} 
            size="lg"
          />
        )}
        
        {!conversation.isGroup && conversation.participants[0]?.status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        )}
      </div>
      
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-800 dark:text-white truncate">
            {getDisplayName()}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getTimestamp()}
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {getLastMessage()}
          </p>
          
          {conversation.unreadCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
      
      <ChevronRight size={16} className="text-gray-400 ml-2 flex-shrink-0" />
    </div>
  );
};

export default ConversationItem;