
export interface Section {
  id: string;
  title: string; // From "Section" column
  dialogue: string; // From "Dialogue" column (for AI formatting & TTS)
  slideText: string; // Will store AI-generated Key Points. Original "Slide Text" CSV column will be phased out.
  knowledgeBase: string; // From "Knowledge Base" column (for Q&A)
  imageFilename: string | null; // From "Image" column (filename)
  formattedDialogue?: string; // AI-enhanced dialogue for presentation & TTS (being phased out for key points)
  keyPoints?: string; // AI-generated key points from Dialogue
  presentationtext?: string;
}

export interface Slide {
  id: string;
  sectionId: string;
  title: string;
  dialogue: string; // Added for PresentationScreen
  slideText: string; // Will display Section.keyPoints
  imageFilename: string | null; // Added for PresentationScreen
  imageUrl: string | null; // Resolved Object URL or data URL for the image
  // formattedDialogue will be accessed from the Section object via sectionId
}

export enum MessageRole {
  USER = "user",
  MODEL = "model",
  SYSTEM = "system" 
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: Date;
}

export type TaskPriority = '1' | '2' | '3';

export interface Task {
  id: string;
  description: string;
  priority: TaskPriority | null;
  dueDate: string | null; // Store as ISO string (YYYY-MM-DD)
  personResponsible: string | null;
  keywords: string; // Comma-separated string of keywords
  createdAt: Date;
  relatedSectionId?: string;
}

// Added TaskFormData interface
export interface TaskFormData {
  description: string;
  priority: TaskPriority | null;
  dueDate: string | null; // Store as ISO string (YYYY-MM-DD)
  personResponsible: string | null;
}

// For Gemini API Chat history
export interface GeminiHistoryEntry {
  role: "user" | "model";
  parts: { text: string }[];
}

export type ResponseEntryType = "Chat Summary" | "Full Discussion";

export interface ResponseEntry {
  id: string;
  type: ResponseEntryType;
  text: string;
  keywords: string; // Comma-separated string of keywords
  createdAt: Date;
}
