import React, { useState } from 'react';
import { useAppStore } from '../store';

const SubmitResponseScreen: React.FC = () => {
  const [responseId, setResponseId] = useState('');
  const [content, setContent] = useState('');
  const [message, setMessage] = useState('');
  const userApiKey = useAppStore((state) => state.userApiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    if (!responseId || !content) {
      setMessage('Please fill out all fields.');
      return;
    }

    const responseData = {
      responseId,
      content,
      docId: 'doc-from-frontend-test',
    };

    try {
      const response = await fetch('http://localhost:8080/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userApiKey}`,
        },
        body: JSON.stringify(responseData),
      });

      if (response.ok) {
        const result = await response.json();
        setMessage(`Response submitted successfully! Response ID: ${result.response.responseId}`);
        setResponseId('');
        setContent('');
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.message || 'Something went wrong'}`);
      }
    } catch (error) {
      setMessage(`Error: ${(error as Error).message}`);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 lg:p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Submit New Response</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="responseId" className="block text-sm font-medium text-gray-700">
            Response ID
          </label>
          <input
            id="responseId"
            type="text"
            value={responseId}
            onChange={(e) => setResponseId(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Response
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows={4}
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Submit Response
        </button>
      </form>
      {message && (
        <p className="mt-4 text-center text-sm text-gray-600 bg-gray-100 p-3 rounded-md">
          {message}
        </p>
      )}
    </div>
  );
};

export default SubmitResponseScreen;