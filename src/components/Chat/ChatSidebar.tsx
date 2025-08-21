// components/Chat/ChatSidebar.tsx
"use client"
import React from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import ConversationItem from './ConversationItem';

interface Conversation {
  id: string;
  participants: any[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage?: any;
  unreadCount: number;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
  activeConversationId?: string;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  searchQuery,
  onSearchChange,
  onSelectConversation,
  activeConversationId,
  onToggleSidebar,
  isSidebarOpen
}) => {
  return (
    <div className="h-full flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chats</h2>
          <div className="flex space-x-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Plus size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      
      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isActive={conversation.id === activeConversationId}
              onClick={() => onSelectConversation(conversation)}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <MessageSquare size={48} className="mx-auto mb-2 opacity-50" />
            <p>No conversations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;