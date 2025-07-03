
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, MessageRole } from '../types'; // Ensure MessageRole is imported
import LoadingIcon from './LoadingIcon';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// SVG Icons for TTS
const SpeakerIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M7.25 8.25V5.75a.75.75 0 00-1.5 0V8.25H3a.75.75 0 000 1.5h2.75V12.5a.75.75 0 001.5 0V9.75H10a.75.75 0 000-1.5H7.25z" />
    <path fillRule="evenodd" d="M.75 4.75A.75.75 0 011.5 4h12.5a.75.75 0 01.75.75v10.5a.75.75 0 01-.75.75H1.5a.75.75 0 01-.75-.75V4.75zm.75 10.5V5.5h12.5v9.75H1.5zM12.5 8a.75.75 0 000 1.5h2.75a.75.75 0 000-1.5H12.5z" clipRule="evenodd" />
     <path d="M11 5.054a5.463 5.463 0 013.946 3.946.75.75 0 001.45-.399A6.963 6.963 0 0011.398 3.6a.75.75 0 00-.399 1.451z" />
    <path d="M11 7.523a2.477 2.477 0 011.752 1.752.75.75 0 001.449-.4A3.977 3.977 0 0011.4 7.073a.75.75 0 00-.4 1.45z" />
  </svg>
);

const PauseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M5.75 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z" />
    <path d="M14.25 4.5a.75.75 0 00-.75.75v10.5a.75.75 0 001.5 0V5.25a.75.75 0 00-.75-.75z" />
  </svg>
);

const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
  </svg>
);


interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onAddTask: () => void;
  onSummarizeAndEditChat: () => void;
  onSaveFullDiscussion: () => void;
  isLoadingResponse: boolean;
  currentSlideTitle?: string;
  disabled?: boolean;
  // TTS Props
  isSpeaking: boolean; // Global isSpeaking state
  speakingChatMessageId: string | null; // ID of the message currently being spoken/paused
  onSpeakMessage: (message: ChatMessage) => void; // Function to call to speak/pause/resume
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSendMessage,
  onAddTask,
  onSummarizeAndEditChat,
  onSaveFullDiscussion,
  isLoadingResponse,
  currentSlideTitle,
  disabled,
  isSpeaking,
  speakingChatMessageId,
  onSpeakMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (inputText.trim() && !isLoadingResponse) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col h-full">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">Chat</h3>
      {currentSlideTitle && <p className="text-sm text-gray-500 mb-3">Context: <span className="font-medium">{currentSlideTitle}</span></p>}
      
      <div className="flex-grow overflow-y-auto mb-4 pr-2 space-y-3 min-h-[200px] max-h-[400px] border border-gray-200 rounded-md p-3 bg-gray-50">
        {messages.map((msg) => {
          const isCurrentMessageSpeaking = msg.id === speakingChatMessageId && isSpeaking;
          const isCurrentMessagePaused = msg.id === speakingChatMessageId && !isSpeaking;

          return (
            <div
              key={msg.id}
              className={`flex ${msg.role === MessageRole.USER ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-xl shadow prose prose-sm relative group ${
                  msg.role === MessageRole.USER
                    ? 'bg-blue-500 text-white'
                    : msg.role === MessageRole.MODEL 
                    ? 'bg-gray-200 text-gray-800'
                    : 'bg-yellow-100 text-yellow-700 text-xs italic' 
                }`}
              >
                {msg.role === MessageRole.MODEL ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p> 
                )}
                {msg.role !== MessageRole.SYSTEM && (
                  <div className="flex justify-between items-center mt-1">
                    <span className={`text-xs ${msg.role === MessageRole.USER ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {msg.role === MessageRole.MODEL && msg.text.trim() !== "" && (
                       <button
                        onClick={() => onSpeakMessage(msg)}
                        disabled={isLoadingResponse || disabled}
                        className={`ml-2 p-1 rounded-full transition-opacity duration-150 
                                    ${isCurrentMessageSpeaking || isCurrentMessagePaused ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                    ${isCurrentMessageSpeaking ? 'bg-blue-500 text-white hover:bg-blue-600' : 
                                      isCurrentMessagePaused ? 'bg-green-500 text-white hover:bg-green-600' : 
                                      'bg-gray-300 text-gray-700 hover:bg-gray-400'}
                                    disabled:opacity-25 disabled:cursor-not-allowed`}
                        aria-label={isCurrentMessageSpeaking ? "Pause speech" : isCurrentMessagePaused ? "Resume speech" : "Speak message"}
                        title={isCurrentMessageSpeaking ? "Pause speech" : isCurrentMessagePaused ? "Resume speech" : "Speak message"}
                      >
                        {isCurrentMessageSpeaking ? <PauseIcon /> : isCurrentMessagePaused ? <PlayIcon /> : <SpeakerIcon />}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoadingResponse && (
          <div className="flex justify-start">
            <div className="max-w-[70%] p-3 rounded-xl shadow bg-gray-200 text-gray-800 flex items-center">
              <LoadingIcon size="w-5 h-5" color="text-gray-600" />
              <span className="ml-2 text-sm">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="mt-auto">
        <div className="flex items-center mb-3">
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={disabled ? "Load presentation or wait" : "Type your message..."}
            disabled={isLoadingResponse || disabled}
            className="flex-grow p-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-100"
            aria-label="Chat input"
          />
          <button
            onClick={handleSend}
            disabled={isLoadingResponse || !inputText.trim() || disabled}
            className="p-3 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150"
            aria-label="Send message"
          >
            Send
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={onAddTask}
            disabled={isLoadingResponse || disabled}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 text-sm"
          >
            Add Task
          </button>
          <button
            onClick={onSummarizeAndEditChat}
            disabled={isLoadingResponse || messages.filter(m=>m.role !== MessageRole.SYSTEM).length === 0 || disabled}
            className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 text-sm"
          >
            Summarize & Edit Chat
          </button>
          <button
            onClick={onSaveFullDiscussion}
            disabled={isLoadingResponse || messages.filter(m=>m.role !== MessageRole.SYSTEM).length === 0 || disabled}
            className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150 text-sm"
          >
            Save Full Discussion
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
