import React from 'react';
import type { Task } from '../types';
import type { ScreenView } from '../App';
import TaskList from '../components/TaskList';
import HamburgerMenu from '../components/HamburgerMenu';

interface TasksScreenProps {
  tasks: Task[];
  onDownloadTasks: () => void;
  navigation: {
    navigateTo: (screen: ScreenView) => void;
    openApiKeyModal: () => void;
    handleOpenAdminScreen: () => void;
  };
  onEditTask: (task: Task) => void;
  isApiKeySet: boolean; // New prop
}

const TasksScreen: React.FC<TasksScreenProps> = ({ tasks, onDownloadTasks, navigation, onEditTask, isApiKeySet }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-300 rounded-t-lg">
        <HamburgerMenu currentScreen="tasks" navigation={navigation} />
        <h2 className="text-2xl font-semibold text-gray-800">Manage Tasks</h2>
        {!isApiKeySet && (
            <button onClick={navigation.openApiKeyModal} className="text-xs bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-2 rounded">
                Set API Key
            </button>
        )}
      </div>
      <div className="p-4">
        {!isApiKeySet && tasks.length === 0 && (
            <p className="text-center text-gray-500 mb-4">Please set your Gemini API Key to enable task creation and keyword generation.</p>
        )}
        <TaskList tasks={tasks} onDownloadTasks={onDownloadTasks} onEditTask={onEditTask} />
      </div>
    </div>
  );
};

export default TasksScreen;