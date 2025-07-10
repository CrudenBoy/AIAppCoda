
import React from 'react';
import type { ScreenView } from '../App';
// FIx: Import Task and ResponseEntry types
import type { Slide, Task, ResponseEntry } from '../types';

interface MainMenuScreenProps {
  onSummarizePresentation: () => void;
  navigateTo: (screen: ScreenView) => void;
  isAdminAuthenticated: boolean;
  handleOpenAdminScreen: () => void;
  slidesAvailable: boolean;
  isApiKeySet: boolean;
  openApiKeyModal: () => void;
  slides: Slide[];
  onStartPresentation: () => void;
  tasks: Task[];
  responses: ResponseEntry[];
}

const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onSummarizePresentation,
  navigateTo,
  isAdminAuthenticated,
  handleOpenAdminScreen,
  slidesAvailable,
  isApiKeySet,
  openApiKeyModal,
  slides,
  onStartPresentation,
  tasks,
  responses,
}) => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Welcome to the AI Presenter App</h2>
        <p className="text-gray-600 mt-2">
          {isApiKeySet ?
            "Upload your content, manage tasks, and view AI-generated responses." :
            "Please set your Gemini API Key to enable AI features."
          }
        </p>
         {!isApiKeySet && (
            <button
                onClick={openApiKeyModal}
                className="mt-3 px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 transition duration-150"
            >
                Set Gemini API Key
            </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={onStartPresentation}
          disabled={slides.length === 0}
          className="w-full px-4 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-gray-400 transition duration-150"
        >
          Go to Presentation Screen
        </button>
        <button
          onClick={onSummarizePresentation}
          disabled={!slidesAvailable}
          className="w-full px-4 py-3 bg-cyan-600 text-white font-semibold rounded-md hover:bg-cyan-700 disabled:bg-gray-400 transition duration-150"
        >
          Summarize Full Presentation
        </button>
        <button
          onClick={() => navigateTo('submitTask')}
          disabled={!isApiKeySet}
          className="w-full px-4 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition duration-150"
        >
          Submit New Task
        </button>
        <button
          onClick={() => navigateTo('submitResponse')}
          disabled={!isApiKeySet}
          className="w-full px-4 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 disabled:bg-gray-400 transition duration-150"
        >
          Submit Response
        </button>
      </div>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
         <button
            onClick={handleOpenAdminScreen} // Consider if admin needs separate handling for local use
            className="w-full max-w-xs mx-auto block px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 transition duration-150"
        >
            {isAdminAuthenticated ? "Access Settings" : "Settings Login"} 
        </button>
      </div>
    </div>
  );
};

export default MainMenuScreen;