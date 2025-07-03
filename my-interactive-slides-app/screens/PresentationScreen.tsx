import React from 'react';
import type { Slide } from '../types';
import { FaArrowLeft, FaArrowRight, FaPlay, FaPause, FaTimes } from 'react-icons/fa';
import TTSManager from '../src/services/ttsManager';

interface PresentationScreenProps {
  currentSection: Slide | null;
  onNextSlide: () => void;
  onPrevSlide: () => void;
  onExit: () => void;
  ttsManager: TTSManager | null;
  isTTSSpeaking: boolean;
  setIsTTSSpeaking: (isSpeaking: boolean) => void;
}

export const PresentationScreen: React.FC<PresentationScreenProps> = ({
  currentSection,
  onNextSlide,
  onPrevSlide,
  onExit,
  ttsManager,
  isTTSSpeaking,
  setIsTTSSpeaking,
}) => {
  if (!currentSection) {
    return <div>Loading...</div>;
  }

  const { title, imageFilename, slideText, dialogue } = currentSection;

  const handlePresentSlideButton = () => {
    if (!ttsManager) return;

    if (isTTSSpeaking) {
      ttsManager.pause();
      setIsTTSSpeaking(false);
    } else {
      if (dialogue) {
        ttsManager.speak(dialogue, () => {
          setIsTTSSpeaking(false);
        });
        setIsTTSSpeaking(true);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-200 p-4 rounded-lg shadow-inner">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
        <button onClick={onExit} className="text-gray-600 hover:text-red-500 transition-colors">
          <FaTimes size={24} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow flex items-center justify-center gap-4">
        {imageFilename && (
          <div className="w-1/2 h-full flex items-center justify-center bg-black rounded-lg p-2">
            <img src={imageFilename} alt={title} className="max-w-[50%] max-h-[50%] object-contain" />
          </div>
        )}
        <div className={`p-8 bg-white rounded-lg shadow-lg overflow-y-auto ${imageFilename ? 'w-1/2' : 'w-full'} h-full`}>
          <div className="prose max-w-none">
            <div>
              {slideText.split('\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="flex justify-center items-center gap-8 mt-4">
        <button onClick={onPrevSlide} className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
          <FaArrowLeft />
        </button>
        <button onClick={handlePresentSlideButton} className="p-4 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-transform transform hover:scale-110">
          {isTTSSpeaking ? <FaPause size={32} /> : <FaPlay size={32} />}
        </button>
        <button onClick={onNextSlide} className="p-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors">
          <FaArrowRight />
        </button>
      </div>
    </div>
  );
};

