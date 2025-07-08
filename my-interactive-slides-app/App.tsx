import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Slide, ChatMessage, Task, ResponseEntry, TaskFormData } from './types';
import { APP_TITLE, ADMIN_PASSWORD as INITIAL_ADMIN_PASSWORD, APP_VERSION } from './constants';
import Modal from './components/Modal';
import { useAppStore } from './store';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import TTSManager from './src/services/ttsManager';

// Screen Components
import MainMenuScreen from './screens/MainMenuScreen';
import {PresentationScreen} from './screens/PresentationScreen';
import TasksScreen from './screens/TasksScreen';
import ResponsesScreen from './screens/ResponsesScreen';
import AdminScreen from './screens/AdminScreen';
import TaskFormModal from './components/TaskFormModal';

export type ScreenView = 'mainMenu' | 'presentation' | 'tasks' | 'responses' | 'admin';


const App: React.FC = () => {
  const { globalError, setGlobalError, userApiKey, isApiKeySet } = useAppStore();

  const [currentScreen, setCurrentScreen] = useState<ScreenView>('mainMenu');

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [chatMessages] = useState<ChatMessage[]>([]);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>(INITIAL_ADMIN_PASSWORD);

  const [isLoadingSlides, setIsLoadingSlides] = useState(false);
  const [, setIsLoadingAction] = useState(false);
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const [presentationMode] = useState<'off' | 'playing' | 'paused'>('off');
  const [ttsVoices, setTtsVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string | null>(null);
  const ttsManager = useRef<TTSManager>(new TTSManager());


  const presentationModeRef = useRef(presentationMode);
  useEffect(() => { presentationModeRef.current = presentationMode; }, [presentationMode]);
  const currentSlideIndexRef = useRef(currentSlideIndex);
  useEffect(() => { currentSlideIndexRef.current = currentSlideIndex; }, [currentSlideIndex]);

  const [isTaskFormModalOpen, setIsTaskFormModalOpen] = useState(false);
  const [taskFormInitialData, setTaskFormInitialData] = useState<Partial<TaskFormData>>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [editableChatSummary, setEditableChatSummary] = useState<string>("");
  const [isChatSummaryModalOpen, setIsChatSummaryModalOpen] = useState(false);

  const [presentationSummaryText] = useState<string | null>(null);
  const [isPresentationSummaryModalOpen, setIsPresentationSummaryModalOpen] = useState(false);

  const [responseTableData, setResponseTableData] = useState<ResponseEntry[]>([]);

  
  useState<string | null>(null);


  useEffect(() => {
    const fetchContent = async () => {
      try {
        const queryParams = new URLSearchParams(window.location.search);
        const docId = queryParams.get('docId');

        if (docId) {
          setIsLoadingSlides(true);
          const apiUrl = `https://monkfish-app-pcc2z.ondigitalocean.app/api/app_content?docId=${docId}`;
          const response = await fetch(apiUrl);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `API call failed with status: ${response.status}` }));
            throw new Error(errorData.message);
          }
          
          const contentData = await response.json();
          if (contentData && Array.isArray(contentData) && contentData.length > 0) {
            const slidesData = contentData.map((item: any) => ({
              id: item.contentId,
              sectionId: item.contentId,
              title: item.title,
              dialogue: item.dialogue,
              slideText: item.presentationtext || '',
              knowledgeBase: item.knowledgeBase,
              imageFilename: item.imageFilename,
              imageUrl: item.imageFilename ? `https://your-image-url-prefix/${item.imageFilename}` : null,
            }));
            setSlides(slidesData);
            setIsLoadingSlides(false);
          } else {
            setIsLoadingSlides(false);
          }
        }
      } catch (error: any) {
        setGlobalError(error.message);
        setIsLoadingSlides(false);
      }
    };
    fetchContent();
  }, []);

  useEffect(() => {
    const populateVoiceList = () => {
      const voices = window.speechSynthesis.getVoices();
      setTtsVoices(voices);
      if (voices.length > 0 && !selectedVoiceURI) {
        const englishVoice = voices.find(voice => voice.lang.startsWith('en') && !voice.localService) ||
                             voices.find(voice => voice.lang.startsWith('en')) ||
                             voices[0];
        if (englishVoice) setSelectedVoiceURI(englishVoice.voiceURI);
      }
    };
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [selectedVoiceURI]);


  const reinitializeChat = useCallback(() => {
    // Chat session management is now backend-only. This function is stubbed.
    console.log("Chat re-initialization is disabled.");
  }, [chatMessages, setGlobalError]);

  useEffect(() => { reinitializeChat(); }, [reinitializeChat]);

  
  


  const handleNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prevIndex: number) => prevIndex + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const handlePrevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prevIndex: number) => prevIndex - 1);
    }
  }, [currentSlideIndex]);

  const handleOpenAdminScreen = () => {
    if (isAdminAuthenticated) {
      setCurrentScreen('admin');
    } else {
      setShowAdminPasswordModal(true);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setPasswordInput(e.target.value);

  const handleAdminPasswordSubmit = () => {
    if (passwordInput === adminPassword) {
      setIsAdminAuthenticated(true);
      setShowAdminPasswordModal(false);
      setPasswordInput("");
      setCurrentScreen('admin');
    } else {
      setGlobalError("Incorrect admin password.");
    }
  };
  const handleAdminModalClose = () => setShowAdminPasswordModal(false);

  const handleOpenTaskForm = (initialData?: Partial<TaskFormData>, taskToEdit?: Task) => {
    setTaskFormInitialData(initialData || {});
    setEditingTask(taskToEdit || null);
    setIsTaskFormModalOpen(true);
  };

  const handleTaskFormSubmit = async (taskData: TaskFormData) => {
    const queryParams = new URLSearchParams(window.location.search);
    const docId = queryParams.get('docId');
    if (!docId) return;
    setIsLoadingAction(true);
    try {
      const keywords = "Keywords disabled"; // Stubbed
      const taskId = editingTask?.id || `task-${Date.now()}`;
      const taskPayload = { docId, taskId, title: taskData.description.substring(0, 100), description: taskData.description };
      const response = await fetch('https://monkfish-app-pcc2z.ondigitalocean.app/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskPayload),
      });
      if (!response.ok) throw new Error('API call failed');
      const newTask: Task = { id: taskId, ...taskData, keywords, createdAt: new Date(), relatedSectionId: slides[currentSlideIndex]?.sectionId };
      setTasks((prev: Task[]) => editingTask ? prev.map((t: Task) => t.id === taskId ? newTask : t) : [...prev, newTask]);
    } catch (e: any) {
      setGlobalError(`Failed to save task: ${e.message}`);
    } finally {
      setIsLoadingAction(false);
      setIsTaskFormModalOpen(false);
    }
  };


  const handleSaveChatSummary = async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const docId = queryParams.get('docId');
    if (!docId) return;
    setIsLoadingAction(true);
    try {
      const keywords = "Keywords disabled"; // Stubbed
      const responseId = `resp-${Date.now()}`;
      const responsePayload = { docId, responseId, content: editableChatSummary, taskId: null };
      const response = await fetch('https://monkfish-app-pcc2z.ondigitalocean.app/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responsePayload),
      });
      if (!response.ok) throw new Error('API call failed');
      setResponseTableData((prev: ResponseEntry[]) => [...prev, { id: responseId, type: "Chat Summary", text: editableChatSummary, keywords, createdAt: new Date() }]);
      setIsChatSummaryModalOpen(false);
    } catch (e: any) {
      setGlobalError(`Failed to save summary: ${e.message}`);
    } finally {
      setIsLoadingAction(false);
    }
  };


  const handleSummarizePresentation = async () => {
    // This feature is temporarily disabled as it relies on frontend AI calls.
    setGlobalError("Presentation summarization is currently disabled.");
    console.log("Presentation summarization is disabled.");
  };

  const downloadTasks = useCallback(() => {
    const csvContent = "data:text/csv;charset=utf-8," + tasks.map((e: Task) => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tasks_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [tasks]);

  const downloadResponses = useCallback(() => {
    const csvContent = "data:text/csv;charset=utf-8," + responseTableData.map((e: ResponseEntry) => Object.values(e).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "responses_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [responseTableData]);

  const currentSectionForSlideViewer = slides[currentSlideIndex] || null;


const renderScreen = () => {
    const sharedScreenProps = {
      disabled: isLoadingSlides,
      slidesAvailable: slides.length > 0,
      isApiKeySet: isApiKeySet,
    };

    switch (currentScreen) {
      case 'presentation':
        return (
          <PresentationScreen
            currentSection={currentSectionForSlideViewer}
            onNextSlide={handleNextSlide}
            onPrevSlide={handlePrevSlide}
            onExit={() => setCurrentScreen('mainMenu')}
            ttsManager={ttsManager.current}
            isTTSSpeaking={isTTSSpeaking}
            setIsTTSSpeaking={setIsTTSSpeaking}
          />
        );
      case 'tasks':
        return (
          <TasksScreen
            tasks={tasks}
            onDownloadTasks={downloadTasks}
            navigation={{ navigateTo: setCurrentScreen, openApiKeyModal: () => {}, handleOpenAdminScreen }}
            onEditTask={handleOpenTaskForm}
            isApiKeySet={isApiKeySet}
          />
        );
      case 'responses':
        return (
          <ResponsesScreen
            responses={responseTableData}
            onDownloadResponses={downloadResponses}
            navigation={{ navigateTo: setCurrentScreen, openApiKeyModal: () => {}, handleOpenAdminScreen }}
            isApiKeySet={isApiKeySet}
          />
        );
      case 'admin':
        return (
          <AdminScreen
            masterApiKey={userApiKey || ''}
            ttsVoices={ttsVoices}
            selectedVoiceURI={selectedVoiceURI}
            onSelectedVoiceURIChange={setSelectedVoiceURI}
            isSpeaking={isTTSSpeaking}
            presentationMode={presentationMode}
            currentTTSType={null}
            navigation={{ navigateTo: setCurrentScreen, openApiKeyModal: () => {}, handleOpenAdminScreen }}
            onAdminPasswordChange={setAdminPassword}
            isApiKeySet={isApiKeySet}
          />
        );
      case 'mainMenu':
      default:
        return (
          <MainMenuScreen
            onSummarizePresentation={handleSummarizePresentation}
            navigateTo={setCurrentScreen}
            isAdminAuthenticated={isAdminAuthenticated}
            handleOpenAdminScreen={handleOpenAdminScreen}
            openApiKeyModal={() => {}}
            tasks={tasks}
            responses={responseTableData}
            {...sharedScreenProps}
            slides={slides}
            onStartPresentation={() => setCurrentScreen('presentation')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-900 bg-gray-100">
      <header className="bg-indigo-700 text-white p-4 shadow-md">
        <h1 className="text-2xl font-bold text-center">{APP_TITLE}</h1>
      </header>

      <main className="flex-grow container mx-auto p-4">
        {renderScreen()}
      </main>

      {globalError && (
        <div
          className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md shadow-lg z-[100] max-w-md cursor-pointer"
          role="alert"
          onClick={() => setGlobalError(null)}
        >
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{globalError}</span>
        </div>
      )}


      <Modal isOpen={showAdminPasswordModal} onClose={handleAdminModalClose} title="Admin Access">
        <div className="space-y-4">
          <p>Enter admin password to access settings.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={handlePasswordChange}
            className="w-full p-2 border rounded"
            onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAdminPasswordSubmit()}
          />
          <button onClick={handleAdminPasswordSubmit} className="w-full px-4 py-2 bg-indigo-600 text-white rounded">
            Unlock
          </button>
        </div>
      </Modal>

      <TaskFormModal
        isOpen={isTaskFormModalOpen}
        onClose={() => setIsTaskFormModalOpen(false)}
        onSubmit={handleTaskFormSubmit}
        initialData={taskFormInitialData}
        existingTask={editingTask}
      />
      
      <Modal isOpen={isChatSummaryModalOpen} onClose={() => setIsChatSummaryModalOpen(false)} title="Edit & Save Chat Summary">
          <textarea
            value={editableChatSummary}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditableChatSummary(e.target.value)}
            rows={10}
            className="w-full p-2 border rounded"
          />
          <button onClick={handleSaveChatSummary} className="px-4 py-2 bg-green-500 text-white rounded">
            Save Summary
          </button>
      </Modal>

       <Modal isOpen={isPresentationSummaryModalOpen} onClose={() => setIsPresentationSummaryModalOpen(false)} title="Full Presentation Summary">
        <div className="prose max-w-none max-h-[60vh] overflow-y-auto">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{presentationSummaryText}</ReactMarkdown>
        </div>
      </Modal>
      
      <footer className="text-center p-4 text-sm text-gray-500 border-t">
        &copy; {new Date().getFullYear()} {APP_TITLE}. All rights reserved. Version {APP_VERSION}
      </footer>
    </div>
  );
};

export default App;