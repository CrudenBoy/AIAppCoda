
import React, { useState, useEffect } from 'react';
import type { ScreenView } from '../App';
import SystemInstructionEditor from '../components/SystemInstructionEditor';
import HamburgerMenu from '../components/HamburgerMenu';

interface AdminScreenProps {
  masterApiKey: string;
  ttsVoices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  onSelectedVoiceURIChange: (uri: string) => void;
  isSpeaking: boolean;
  presentationMode: 'off' | 'playing' | 'paused';
  currentTTSType: 'presentation' | 'chat' | null;
  navigation: {
    navigateTo: (screen: ScreenView) => void;
    openApiKeyModal: () => void;
    handleOpenAdminScreen: () => void;
  };
  currentAdminPassword?: string;
  onAdminPasswordChange: (newPass: string) => void;
  isApiKeySet: boolean;
}

const AdminScreen: React.FC<AdminScreenProps> = ({
  masterApiKey,
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

  // State for system instructions
  const [dialogueInstruction, setDialogueInstruction] = useState('');
  const [presentationInstruction, setPresentationInstruction] = useState('');

  // State for API interactions
  const [isLoading, setIsLoading] = useState(true); // Start with loading true to fetch initial data
  const [saveStatus, setSaveStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isApiKeySet) {
        setIsLoading(false);
        setSaveStatus({ type: 'error', message: 'Set API Key to load settings.' });
        return;
      }
      setIsLoading(true);
      setSaveStatus(null);
      try {
        const response = await fetch('/api/presentation/settings', {
          headers: {
            'Authorization': `Bearer ${masterApiKey}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setDialogueInstruction(data.dialogueInstruction || '');
        setPresentationInstruction(data.presentationInstruction || '');
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load settings. Please try again.';
        setSaveStatus({ type: 'error', message: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isApiKeySet, masterApiKey]);

  const handleSave = async () => {
    if (!isApiKeySet) {
        setSaveStatus({ type: 'error', message: 'Set API Key to save instructions.' });
        return;
    }
    setIsLoading(true);
    setSaveStatus(null);
    try {
        const response = await fetch('/api/presentation/settings', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${masterApiKey}`,
            },
            body: JSON.stringify({
                dialogueInstruction,
                presentationInstruction,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred.' }));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        setSaveStatus({ type: 'success', message: 'Settings saved successfully!' });
        setTimeout(() => setSaveStatus(null), 5000); // Clear message after 5 seconds
    } catch (error) {
        console.error("Failed to save settings:", error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to save settings. Please try again.';
        setSaveStatus({ type: 'error', message: errorMessage });
    } finally {
        setIsLoading(false);
    }
  };

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
        <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Global AI System Prompts</h3>
            
            {saveStatus && (
                <div className={`p-3 mb-4 rounded-md text-sm ${saveStatus.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {saveStatus.message}
                </div>
            )}
            
            {isLoading && !saveStatus && <p className="text-blue-500">Loading settings...</p>}

            {!isApiKeySet && (
                <div className="p-3 mb-4 rounded-md text-sm bg-red-100 text-red-800">
                    Set API Key to load and save instructions.
                </div>
            )}

            <div className="mt-4">
                <h4 className="text-md font-semibold mb-2 text-gray-600">Slide Dialogue System Instruction</h4>
                <p className="text-xs text-gray-500 mb-2">This instruction guides the AI in generating the main dialogue or speech for each slide.</p>
                <SystemInstructionEditor
                    instruction={dialogueInstruction}
                    onInstructionChange={setDialogueInstruction}
                    disabled={isLoading || isSpeaking || !isApiKeySet}
                />
            </div>

            <div className="mt-6">
                <h4 className="text-md font-semibold mb-2 text-gray-600">Slide Key Points System Instruction</h4>
                <p className="text-xs text-gray-500 mb-2">This instruction guides the AI in generating a concise, bulleted list of key points from the main slide dialogue. Be very specific about the desired output format (e.g., use hyphens, plain text only).</p>
                <SystemInstructionEditor
                    instruction={presentationInstruction}
                    onInstructionChange={setPresentationInstruction}
                    disabled={isLoading || isSpeaking || !isApiKeySet}
                />
            </div>

            <button
                onClick={handleSave}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition duration-150 flex items-center"
                disabled={isLoading || isSpeaking || !isApiKeySet}
            >
                {isLoading && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {isLoading ? 'Please wait...' : 'Save All System Instructions'}
            </button>
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
