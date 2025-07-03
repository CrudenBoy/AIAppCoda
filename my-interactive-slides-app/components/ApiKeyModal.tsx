import React, { useState, useEffect } from 'react';
import Modal from './Modal'; // Assuming Modal component is in the same directory

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey?: string;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(currentApiKey || '');
    }
  }, [isOpen, currentApiKey]);

  const handleSaveClick = () => {
    if (apiKeyInput.trim()) {
      onSave(apiKeyInput.trim());
    } else {
      // Optionally, show an error message if the key is empty,
      // but onSave in App.tsx should also handle this.
      alert("API Key cannot be empty.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Set Gemini API Key">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Please enter your Google Gemini API Key. This key will be stored locally in your browser
          and used for all AI-powered features.
        </p>
        <div>
          <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-700">
            Gemini API Key
          </label>
          <input
            type="password" // Use password type to obscure the key
            id="api-key-input"
            value={apiKeyInput}
            onChange={(e) => setApiKeyInput(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your API Key"
          />
           <p className="text-xs text-gray-500 mt-1">
            You can obtain an API key from Google AI Studio.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save API Key
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ApiKeyModal;