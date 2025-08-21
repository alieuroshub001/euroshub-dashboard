// components/Chat/ChatMain.tsx
"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Search, MoreVertical } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  profileImage?: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
}

interface Conversation {
  id: string;
  participants: User[];
  isGroup: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage?: Message;
  unreadCount: number;
}

const ChatMain: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Sample data - replace with actual API calls
  useEffect(() => {
    // Mock conversations data
    const mockConversations: Conversation[] = [
      {
        id: '1',
        participants: [
          {
            id: '2',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'developer',
            status: 'online',
            profileImage: ''
          }
        ],
        isGroup: false,
        lastMessage: {
          id: '101',
          content: 'Hey, how are you?',
          senderId: '2',
          timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          isRead: true,
          type: 'text'
        },
        unreadCount: 0
      },
      {
        id: '2',
        participants: [
          {
            id: '3',
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            role: 'designer',
            status: 'away',
            profileImage: ''
          }
        ],
        isGroup: false,
        lastMessage: {
          id: '102',
          content: 'I sent the design files',
          senderId: '3',
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          isRead: false,
          type: 'text'
        },
        unreadCount: 2
      },
      {
        id: '3',
        participants: [
          {
            id: '4',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'project manager',
            status: 'offline',
            lastSeen: '2 hours ago',
            profileImage: ''
          },
          {
            id: '5',
            name: 'Lisa Brown',
            email: 'lisa@example.com',
            role: 'developer',
            status: 'online',
            profileImage: ''
          }
        ],
        isGroup: true,
        groupName: 'Project Alpha Team',
        lastMessage: {
          id: '103',
          content: 'Meeting at 3 PM tomorrow',
          senderId: '4',
          timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
          isRead: true,
          type: 'text'
        },
        unreadCount: 0
      }
    ];

    setConversations(mockConversations);
    
    // Set first conversation as active by default
    if (mockConversations.length > 0 && !activeConversation) {
      setActiveConversation(mockConversations[0]);
    }
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;
    
    // Mock messages data - replace with API call
    const mockMessages: Message[] = [
      {
        id: '1',
        content: 'Hey there! How is the project going?',
        senderId: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        isRead: true,
        type: 'text'
      },
      {
        id: '2',
        content: 'It\'s going well! I just finished the backend API.',
        senderId: '1', // current user
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
        isRead: true,
        type: 'text'
      },
      {
        id: '3',
        content: 'That\'s great! Can you share the documentation?',
        senderId: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        isRead: true,
        type: 'text'
      },
      {
        id: '4',
        content: 'Sure, I\'ll send it over shortly.',
        senderId: '1', // current user
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        isRead: true,
        type: 'text'
      },
      {
        id: '5',
        content: 'Thanks! Looking forward to it.',
        senderId: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        isRead: true,
        type: 'text'
      }
    ];

    setMessages(mockMessages);
  }, [activeConversation]);

  const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' = 'text', attachments?: string[]) => {
    if (!content.trim() && (!attachments || attachments.length === 0)) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      senderId: '1', // Current user ID - replace with actual user ID
      timestamp: new Date(),
      isRead: false,
      type,
      attachments
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Update last message in conversation
    if (activeConversation) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === activeConversation.id 
            ? { ...conv, lastMessage: newMessage } 
            : conv
        )
      );
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    
    // Mark messages as read when selecting conversation
    if (conversation.unreadCount > 0) {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversation.id 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (conv.isGroup) {
      return conv.groupName?.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      return conv.participants[0].name.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

  return (
    <div className="flex h-full bg-white dark:bg-gray-800">
      {/* Chat sidebar */}
      <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden`}>
        <ChatSidebar
          conversations={filteredConversations}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={handleSelectConversation}
          activeConversationId={activeConversation?.id}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            <ChatHeader 
              conversation={activeConversation}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <MessageList 
              messages={messages}
              currentUserId="1" // Replace with actual current user ID
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMain;