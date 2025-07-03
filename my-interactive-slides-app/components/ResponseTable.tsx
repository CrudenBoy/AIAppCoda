
import React, { useState } from 'react';
import { ResponseEntry } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Modal from './Modal'; // Re-use Modal for full text view

interface ResponseTableProps {
  responses: ResponseEntry[];
  onDownloadResponses: () => void;
}

const ResponseTable: React.FC<ResponseTableProps> = ({ responses, onDownloadResponses }) => {
  const [selectedResponseText, setSelectedResponseText] = useState<string | null>(null);
  const [isViewTextModalOpen, setIsViewTextModalOpen] = useState(false);

  const viewFullText = (text: string) => {
    setSelectedResponseText(text);
    setIsViewTextModalOpen(true);
  };
  
  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white shadow">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-700">Saved Responses</h3>
        {responses.length > 0 && (
          <button
            onClick={onDownloadResponses}
            className="px-3 py-1 text-xs bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition duration-150"
            title="Download responses as CSV"
          >
            Download Responses
          </button>
        )}
      </div>
      {responses.length === 0 ? (
        <p className="text-sm text-gray-500">No responses saved yet. Use "Save" buttons in the chat window.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 tracking-wider">Type</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 tracking-wider">Text Snippet</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 tracking-wider">Keywords</th>
                <th scope="col" className="px-4 py-2 text-left font-medium text-gray-500 tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {responses.map((response) => (
                <tr key={response.id}>
                  <td className="px-4 py-2 whitespace-nowrap">{response.type}</td>
                  <td 
                    className="px-4 py-2 max-w-xs cursor-pointer hover:text-blue-600" 
                    title="Click to view full text"
                    onClick={() => viewFullText(response.text)}
                  >
                    {truncateText(response.text.replace(/(\r\n|\n|\r)/gm," ").replace(/\s\s+/g, ' '), 100)}
                  </td>
                  <td className="px-4 py-2 italic max-w-xs">{response.keywords || 'N/A'}</td>
                  <td className="px-4 py-2 whitespace-nowrap">{new Date(response.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
       <Modal isOpen={isViewTextModalOpen} onClose={() => setIsViewTextModalOpen(false)} title="Full Response Text">
        {selectedResponseText ? (
            <div className="prose prose-sm max-w-none max-h-[60vh] overflow-y-auto">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedResponseText}</ReactMarkdown>
            </div>
        ): <p>No text to display.</p>}
      </Modal>
    </div>
  );
};

export default ResponseTable;
