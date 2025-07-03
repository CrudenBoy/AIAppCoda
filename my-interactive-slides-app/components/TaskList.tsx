
import React from 'react';
import { Task, TaskPriority } from '../types';

interface TaskListProps {
  tasks: Task[];
  onDownloadTasks: () => void;
  onEditTask: (task: Task) => void; // New prop for editing
}

const priorityLabel = (priority: TaskPriority | null): string => {
  if (!priority) return 'N/A';
  switch (priority) {
    case '1': return 'High';
    case '2': return 'Medium';
    case '3': return 'Low';
    default: return 'N/A';
  }
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onDownloadTasks, onEditTask }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Tasks</h3>
        {tasks.length > 0 && (
          <button
            onClick={onDownloadTasks}
            className="px-3 py-1 text-xs bg-sky-500 text-white rounded-md hover:bg-sky-600 transition duration-150"
            title="Download tasks as CSV"
          >
            Download Tasks
          </button>
        )}
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-gray-500">No tasks created yet. Use the "Add Task" button in the chat window (Presentation Screen).</p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-y-auto pr-1"> {/* Increased max-h */}
          {tasks.map((task) => (
            <li key={task.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm">
              <div className="flex justify-between items-start">
                <p className="text-sm text-yellow-800 font-medium flex-grow mr-2">{task.description}</p>
                <button
                  onClick={() => onEditTask(task)}
                  className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold py-1 px-2 rounded"
                >
                  Edit
                </button>
              </div>
              <div className="mt-2 text-xs text-yellow-700 space-y-1">
                <div className="flex justify-between">
                  <span>Priority: <span className="font-semibold">{priorityLabel(task.priority)}</span></span>
                  <span>Due: <span className="font-semibold">{task.dueDate ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString() : 'N/A'}</span></span>
                </div>
                <div>
                  Assigned To: <span className="font-semibold">{task.personResponsible || 'N/A'}</span>
                </div>
                {task.keywords && (
                  <div>
                    Keywords: <span className="font-semibold italic">{task.keywords}</span>
                  </div>
                )}
                <div>
                  Created: {new Date(task.createdAt).toLocaleDateString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskList;
