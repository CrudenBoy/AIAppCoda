import React, { useRef, useState } from "react";
import { Section } from "../types";
import { parseCsvToSections } from "../utils/parser";

interface FileUploadProps {
  onPresentationDataReady: (sections: Section[], imageFileMap: Record<string, File>) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onPresentationDataReady,
  disabled = false,
}) => {
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // Handle CSV file upload and parsing
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParseError(null);
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setCsvFileName("");
      return;
    }
    setCsvFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const sections = parseCsvToSections(text);
        onPresentationDataReady(sections, {}); // Pass empty imageFileMap for now
      } catch (err: any) {
        setParseError(err.message || "Failed to parse CSV file.");
      }
    };
    reader.onerror = () => {
      setParseError("Could not read the CSV file.");
    };
    reader.readAsText(file);
  };

  // Reset all state and input fields
  const handleReset = () => {
    setCsvFileName("");
    setParseError(null);
    if (csvInputRef.current) {
      csvInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow-md w-full max-w-2xl mx-auto mb-6">
      <h2 className="text-xl font-bold mb-4 text-green-700">
        1. Upload Your Presentation CSV
      </h2>
      <div className="mb-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvFileChange}
          disabled={disabled}
          ref={csvInputRef}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 disabled:opacity-50"
          aria-label="Upload CSV file"
        />
        {csvFileName && (
          <p className="text-xs text-gray-600 mt-1">Selected: {csvFileName}</p>
        )}
        {parseError && (
          <p className="text-xs text-red-600 mt-1">{parseError}</p>
        )}
      </div>
      <button
        onClick={handleReset}
        className="text-xs text-blue-600 underline hover:text-blue-800"
        type="button"
        disabled={disabled}
      >
        Reset
      </button>
    </div>
  );
};

export default FileUpload;