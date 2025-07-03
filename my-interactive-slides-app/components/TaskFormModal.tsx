
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import type { Task, TaskPriority, TaskFormData } from '../types';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: TaskFormData) => void;
  initialData?: Partial<TaskFormData>; // Changed from initialDescription
  existingTask?: Task | null; // To support editing
}

const TaskFormModal: React.FC<TaskFormModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = {},
  existingTask = null
}) => {
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>('2');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [personResponsible, setPersonResponsible] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setDescription(existingTask.description);
        setPriority(existingTask.priority);
        setDueDate(existingTask.dueDate);
        setPersonResponsible(existingTask.personResponsible);
      } else {
        setDescription(initialData.description || '');
        setPriority(initialData.priority || '2'); // Default to Medium if no initialData for priority
        setDueDate(initialData.dueDate || null);
        setPersonResponsible(initialData.personResponsible || '');
      }
    }
  }, [isOpen, initialData, existingTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Task description cannot be empty.");
      return;
    }
    onSubmit({
      description: description.trim(),
      priority,
      dueDate,
      personResponsible: personResponsible ? personResponsible.trim() : null,
    });
    onClose(); 
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={existingTask ? "Edit Task" : "Add New Task"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter task details..."
            required
          />
        </div>

        <div>
          <label htmlFor="task-priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority || ''}
            onChange={(e) => setPriority(e.target.value as TaskPriority | null)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="1">High</option>
            <option value="2">Medium</option>
            <option value="3">Low</option>
            <option value="">Not Set</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-due-date" className="block text-sm font-medium text-gray-700">
            Due Date (Optional)
          </label>
          <input
            type="date"
            id="task-due-date"
            value={dueDate || ''}
            onChange={(e) => setDueDate(e.target.value || null)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="task-person" className="block text-sm font-medium text-gray-700">
            Person Responsible (Optional)
          </label>
          <input
            type="text"
            id="task-person"
            value={personResponsible || ''}
            onChange={(e) => setPersonResponsible(e.target.value)}
            placeholder="e.g., John Doe"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {existingTask ? "Update Task" : "Add Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskFormModal;
