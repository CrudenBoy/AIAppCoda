
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Slide, Section } from '../types';
import LoadingIcon from './LoadingIcon';

interface SlideViewerProps {
  slide: Slide | null;
  currentSection: Section | null; 
  currentSlideNumber: number;
  totalSlides: number;
  isLoadingSlides: boolean; 
  onNext: () => void;
  onPrev: () => void;
}

const SlideViewer: React.FC<SlideViewerProps> = ({ 
    slide, 
    currentSection, 
    currentSlideNumber, 
    totalSlides, 
    isLoadingSlides, 
    onNext, 
    onPrev 
}) => {
  
  const [showDialogue, setShowDialogue] = useState(false);

  if (isLoadingSlides && !slide && !currentSection) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg h-full min-h-[400px]">
        <LoadingIcon size="w-16 h-16" />
        <p className="mt-4 text-gray-600">Processing presentation data...</p>
      </div>
    );
  }

  if (!slide || !currentSection) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg h-full min-h-[400px]">
        <p className="text-gray-500 text-lg">No slide to display. Upload CSV and images to get started.</p>
      </div>
    );
  }
  
  const dialogueToDisplay: string = currentSection.dialogue || "No detailed dialogue available for this section.";



return (
  <div className="slide-container">
    <h2 className="text-[20px] font-bold text-gray-800 mb-1">Section: {slide.title}</h2> {/* Adjusted size */}
    <p className="text-sm text-gray-500 mb-4">Slide {currentSlideNumber} of {totalSlides}</p>
    <div className="flex flex-1"> {/* Changed to Tailwind flex */}
      {/* Image Column */}
      {slide.imageUrl && slide.imageUrl.trim() !== "" ? (
        <div className="w-1/4 border-r border-gray-300 pr-4 mr-4"> {/* Set width to 25% */}
          <img
            src={slide.imageUrl}
            alt={`Slide image for ${currentSection?.title || 'current slide'}`}
            className="w-full h-full object-cover rounded-lg" // Tailwind for image styling
          />
        </div>
      ) : null}
      {/* Text Column */}
      <div className={slide.imageUrl && slide.imageUrl.trim() !== "" ? "w-3/4 pl-4" : "w-full"}> {/* Set width to 75% and padding */}
        <h3 className="text-xl font-semibold mb-2 text-gray-800">Key Points:</h3>
        <div className="prose max-w-none markdown-content text-gray-700 mb-4 text-lg whitespace-pre-line"> {/* Increased to text-lg, added whitespace-pre-line */}
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {slide.slideText}
          </ReactMarkdown>
        </div>

        <button
          onClick={() => setShowDialogue(!showDialogue)}
          className="text-sm text-indigo-600 hover:text-indigo-800 underline mb-3"
        >
          {showDialogue ? "Hide" : "Show"} AI Presenter Dialogue
        </button>

        {showDialogue && (
          <div className="prose prose-sm sm:prose max-w-none text-gray-700 mt-2 pt-3 border-t border-gray-300">
            {/* Removed redundant H3, button acts as toggle/label now */}
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {dialogueToDisplay}
              </ReactMarkdown>
            </div>
          </div>
        )}
        {totalSlides > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
            <button
              onClick={onPrev}
              disabled={currentSlideNumber <= 1 || isLoadingSlides}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150"
            >
              Previous
            </button>
            <span className="text-gray-600">{currentSlideNumber} / {totalSlides}</span>
            <button
              onClick={onNext}
              disabled={currentSlideNumber >= totalSlides || isLoadingSlides}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-150"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);
};

export default SlideViewer;
