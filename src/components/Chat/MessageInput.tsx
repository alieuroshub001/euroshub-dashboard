// components/Chat/MessageInput.tsx
"use client"
import React, { useState, useRef } from 'react';
import { Send, Paperclip, Smile, Image, File } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string, type: 'text' | 'image' | 'file', attachments?: string[]) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, you would upload the file and get a URL
    // For now, we'll just use a placeholder
    const fileUrls = Array.from(files).map(file => URL.createObjectURL(file));
    
    onSendMessage('', 'file', fileUrls);
    e.target.value = ''; // Reset input
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real app, you would upload the image and get a URL
    // For now, we'll just use a placeholder
    const imageUrls = Array.from(files).map(file => URL.createObjectURL(file));
    
    onSendMessage('', 'image', imageUrls);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className="relative flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full pl-4 pr-10 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <button
              type="button"
              onClick={() => setIsPickerOpen(!isPickerOpen)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
            >
              <Smile size={18} />
            </button>
          </div>
        </div>
        
        <div className="ml-2 flex space-x-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
          >
            <Image size={18} />
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded transition-colors"
          >
            <File size={18} />
          </button>
          
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 bg-blue-600 text-white rounded-lg transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple
      />
      
      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageSelect}
        accept="image/*"
        className="hidden"
        multiple
      />
    </div>
  );
};

export default MessageInput;