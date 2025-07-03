
import React, { useState } from 'react';
import type { ScreenView } from '../App';
import SystemInstructionEditor from '../components/SystemInstructionEditor';
import HamburgerMenu from '../components/HamburgerMenu';

interface AdminScreenProps {
  chatSystemInstruction: string;
  onChatSystemInstructionChange: (instruction: string) => void;
  onSaveChatSystemInstruction: () => void;
  slideSystemInstruction: string;
  onSlideSystemInstructionChange: (instruction: string) => void;
  onSaveSlideSystemInstruction: () => void;
  ttsVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onSelectedVoiceURIChange: (uri: string) => void;
  isSpeaking: boolean;
  presentationMode: 'off' | 'playing' | 'paused';
  currentTTSType: 'presentation' | 'chat' | null;
  navigation: {
    navigateTo: (screen: ScreenView) => void;
    openApiKeyModal: () => void;
  };
  currentAdminPassword?: string;
  onAdminPasswordChange: (newPass: string) => void;
  isApiKeySet: boolean;
}

const AdminScreen: React.FC<AdminScreenProps> = ({
  chatSystemInstruction,
  onChatSystemInstructionChange,
  onSaveChatSystemInstruction,
  slideSystemInstruction,
  onSlideSystemInstructionChange,
  onSaveSlideSystemInstruction,
  ttsVoices,
  selectedVoiceURI,
  onSelectedVoiceURIChange,
  isSpeaking,
  presentationMode,
  currentTTSType,
  navigation,
  onAdminPasswordChange,
  isApiKeySet
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMessage(null);
    if (!newPassword) {
        setPasswordChangeMessage({type: 'error', text: 'New password cannot be empty.'});
        return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage({type: 'error', text: 'Passwords do not match.'});
      return;
    }
    onAdminPasswordChange(newPassword); 
    setPasswordChangeMessage({type: 'success', text: 'Local access password updated successfully!'});
    setNewPassword('');
    setConfirmPassword('');
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
        <HamburgerMenu currentScreen="admin" navigation={navigation} />
        <h2 className="text-2xl font-semibold text-gray-800">App Settings</h2> 
        {!isApiKeySet && (
            <button onClick={navigation.openApiKeyModal} className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded">
                Set API Key
            </button>
        )}
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Chatbot System Instruction</h3>
          <SystemInstructionEditor
            instruction={chatSystemInstruction}
            onInstructionChange={onChatSystemInstructionChange}
            disabled={isSpeaking || !isApiKeySet}
          />
          <button
              onClick={onSaveChatSystemInstruction}
              className="mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150"
              disabled={isSpeaking || !isApiKeySet}
          >
              Save Chatbot System Instructions
          </button>
          {!isApiKeySet && <p className="text-xs text-red-500 mt-1">Set API Key to save instructions and enable AI features.</p>}
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">Slide Key Points System Instruction</h3>
           <p className="text-xs text-gray-500 mb-2">This instruction guides the AI in generating key bullet points from your slide dialogue. Be very specific about the desired output format (e.g., use hyphens, plain text only).</p>
          <SystemInstructionEditor
            instruction={slideSystemInstruction}
            onInstructionChange={onSlideSystemInstructionChange}
            disabled={isSpeaking || !isApiKeySet}
          />
          <button
              onClick={onSaveSlideSystemInstruction}
              className="mt-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150"
              disabled={isSpeaking || !isApiKeySet}
          >
              Save Slide Key Points Instructions
          </button>
          {!isApiKeySet && <p className="text-xs text-red-500 mt-1">Set API Key to save instructions and enable AI features.</p>}
        </div>

        {ttsVoices.length > 0 && (
          <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Presenter Voice</h3>
            <label htmlFor="tts-voice-admin" className="block text-sm font-medium text-gray-700 mb-1">Select Voice:</label>
            <select
              id="tts-voice-admin"
              value={selectedVoiceURI || ""}
              onChange={(e) => onSelectedVoiceURIChange(e.target.value)}
              disabled={isSpeaking || (presentationMode === 'playing' && currentTTSType === 'presentation') || currentTTSType === 'chat'} // Disable if any TTS is active
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm disabled:bg-gray-100"
            >
              {ttsVoices.map(voice => (
                <option key={voice.voiceURI} value={voice.voiceURI}>
                  {voice.name} ({voice.lang}) {voice.localService ? "[Local]" : "[Online]"}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Change Settings Access Password</h3>
            <p className="text-xs text-gray-500 mb-2">This password protects access to this settings screen on this browser.</p>
            <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                    <label htmlFor="new-password_admin" className="block text-sm font-medium text-gray-700">New Password:</label>
                    <input 
                        type="password"
                        id="new-password_admin"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="confirm-password_admin" className="block text-sm font-medium text-gray-700">Confirm New Password:</label>
                    <input 
                        type="password"
                        id="confirm-password_admin"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                        required
                    />
                </div>
                 {passwordChangeMessage && (
                    <p className={`text-sm ${passwordChangeMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {passwordChangeMessage.text}
                    </p>
                )}
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Change Password
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;
