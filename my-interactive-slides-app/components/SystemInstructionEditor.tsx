
import React from 'react';

interface SystemInstructionEditorProps {
  instruction: string;
  onInstructionChange: (instruction: string) => void;
  disabled?: boolean;
}

const SystemInstructionEditor: React.FC<SystemInstructionEditorProps> = ({ instruction, onInstructionChange, disabled }) => {
  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">AI System Instructions</h3>
      <p className="text-sm text-gray-600 mb-2">Define the AI's tone and behavior.</p>
      <textarea
        value={instruction}
        onChange={(e) => onInstructionChange(e.target.value)}
        disabled={disabled}
        rows={4}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder="e.g., You are a friendly assistant that explains complex topics simply."
      />
    </div>
  );
};

export default SystemInstructionEditor;
    