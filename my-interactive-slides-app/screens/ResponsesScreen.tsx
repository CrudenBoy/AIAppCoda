import React from 'react';
import type { ResponseEntry } from '../types';
import type { ScreenView } from '../App';
import ResponseTable from '../components/ResponseTable';
import HamburgerMenu from '../components/HamburgerMenu';

interface ResponsesScreenProps {
  responses: ResponseEntry[];
  onDownloadResponses: () => void;
  navigation: {
    navigateTo: (screen: ScreenView) => void;
    openApiKeyModal: () => void;
  };
  isApiKeySet: boolean; // New prop
}

const ResponsesScreen: React.FC<ResponsesScreenProps> = ({ responses, onDownloadResponses, navigation, isApiKeySet }) => {
  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
        <HamburgerMenu currentScreen="responses" navigation={navigation} />
        <h2 className="text-2xl font-semibold text-gray-800">View Saved Responses</h2>
        {!isApiKeySet && (
            <button onClick={navigation.openApiKeyModal} className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded">
                Set API Key
            </button>
        )}
      </div>
      <div className="p-4">
        {!isApiKeySet && responses.length === 0 && (
             <p className="text-center text-gray-500 mb-4">Please set your Gemini API Key to save discussions or summaries with keywords.</p>
        )}
        <ResponseTable responses={responses} onDownloadResponses={onDownloadResponses} />
      </div>
    </div>
  );
};

export default ResponsesScreen;