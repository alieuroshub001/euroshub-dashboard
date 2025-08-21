// components/Chat/MessageBubble.tsx
"use client"
import React from 'react';
import { Check, CheckCheck, ImageIcon, FileText } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
  attachments?: string[];
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = () => {
    if (message.type === 'image') {
      return (
        <div className="max-w-xs">
          <div className="bg-black bg-opacity-5 dark:bg-opacity-20 rounded-lg overflow-hidden">
            <img 
              src={message.attachments?.[0] || '/placeholder-image.jpg'} 
              alt="Shared content" 
              className="w-full h-auto object-cover"
            />
          </div>
          {message.content && (
            <p className="mt-2 text-sm text-gray-800 dark:text-white">{message.content}</p>
          )}
        </div>
      );
    }
    
    if (message.type === 'file') {
      return (
        <div className="flex items-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <FileText size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 truncate">
              {message.attachments?.[0]?.split('/').pop() || 'file'}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Click to download</p>
          </div>
        </div>
      );
    }
    
    return <p className="text-sm text-gray-800 dark:text-white">{message.content}</p>;
  };

  return (
    <div className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwnMessage ? 'ml-12' : 'mr-12'}`}>
        <div
          className={`rounded-lg p-3 ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-bl-none'
          }`}
        >
          {renderMessageContent()}
        </div>
        
        <div className={`flex items-center mt-1 text-xs ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          <span className={isOwnMessage ? 'text-gray-500 dark:text-gray-400' : 'text-gray-500 dark:text-gray-400'}>
            {formatTime(new Date(message.timestamp))}
          </span>
          
          {isOwnMessage && (
            <span className="ml-1">
              {message.isRead ? (
                <CheckCheck size={14} className="text-blue-500" />
              ) : (
                <Check size={14} className="text-gray-400" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;