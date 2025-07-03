
export const stripMarkdownForTTS = (markdownText: string): string => {
  if (!markdownText) return "";

  let plainText = markdownText;

  // Remove HTML tags (just in case, though Gemini is prompted not to use them)
  plainText = plainText.replace(/<[^>]*>/g, '');

  // Remove headings (e.g., #, ##, ###) - keep the text
  plainText = plainText.replace(/^#+\s+/gm, '');

  // Remove bold and italics markers (*, _, **, __) - keep the text
  plainText = plainText.replace(/(\*\*|__)(.*?)\1/g, '$2'); // **bold** or __bold__
  plainText = plainText.replace(/(\*|_)(.*?)\1/g, '$2');   // *italic* or _italic_

  // Remove strikethrough (~~text~~) - keep the text
  plainText = plainText.replace(/~~(.*?)~~/g, '$1');

  // Handle links: [text](url) -> text
  plainText = plainText.replace(/\[(.*?)\]\(.*?\)/g, '$1');
  
  // Handle images: ![alt text](url) -> alt text (or empty if alt text is not useful for speech)
  plainText = plainText.replace(/!\[(.*?)\]\(.*?\)/g, '$1'); 

  // Remove list markers (*, -, 1.) - keep the text, ensure space after marker is handled
  plainText = plainText.replace(/^\s*[-*+]\s+/gm, ''); // Unordered list item
  plainText = plainText.replace(/^\s*\d+\.\s+/gm, ''); // Ordered list item

  // Remove blockquotes (>) - keep the text
  plainText = plainText.replace(/^>\s+/gm, '');

  // Remove inline code backticks - keep the code content
  plainText = plainText.replace(/`([^`]+)`/g, '$1');

  // Remove fenced code blocks (```...```)
  plainText = plainText.replace(/```[\s\S]*?\n([\s\S]*?)\n```/g, '$1'); 
  plainText = plainText.replace(/```(.*?)```/g, '$1'); 

  // Remove horizontal rules (---, ***, ___)
  plainText = plainText.replace(/^\s*([-*_]){3,}\s*$/gm, '');

  plainText = plainText.replace(/\n\s*\n/g, '. '); 
  plainText = plainText.replace(/\n/g, ' '); 

  plainText = plainText.replace(/\s{2,}/g, ' ');
  plainText = plainText.trim();

  return plainText;
};

export const MAX_TTS_CHUNK_LENGTH = 200; // Max characters per chunk

export const chunkTextForTTS = (text: string): string[] => {
  if (!text) return [];
  if (text.length <= MAX_TTS_CHUNK_LENGTH) return [text];

  const chunks: string[] = [];
  let remainingText = text;

  while (remainingText.length > 0) {
    if (remainingText.length <= MAX_TTS_CHUNK_LENGTH) {
      chunks.push(remainingText);
      break;
    }

    let currentChunk = remainingText.substring(0, MAX_TTS_CHUNK_LENGTH);
    let lastBreakPoint = -1;

    // Try to find a sentence-ending punctuation mark
    const sentenceEndings = ['.', '!', '?'];
    for (const punc of sentenceEndings) {
      const point = currentChunk.lastIndexOf(punc);
      if (point > lastBreakPoint) {
        lastBreakPoint = point;
      }
    }

    // If no sentence ending, try to find a comma or colon
    if (lastBreakPoint === -1) {
      const midPunctuation = [',', ':', ';'];
        for (const punc of midPunctuation) {
            const point = currentChunk.lastIndexOf(punc);
            if (point > lastBreakPoint) {
                lastBreakPoint = point;
            }
        }
    }
    
    // If still no good break, try the last space
    if (lastBreakPoint === -1) {
      lastBreakPoint = currentChunk.lastIndexOf(' ');
    }

    // If no space (very long word or no spaces in chunk), force break at MAX_TTS_CHUNK_LENGTH
    if (lastBreakPoint === -1 || lastBreakPoint === 0) { // lastBreakPoint === 0 means break is at the start, not useful
      chunks.push(currentChunk);
      remainingText = remainingText.substring(MAX_TTS_CHUNK_LENGTH);
    } else {
      // Ensure the breakpoint is not too small, aim for reasonable chunk sizes
      // If lastBreakPoint is too early (e.g. < half of MAX_TTS_CHUNK_LENGTH), consider breaking at MAX_TTS_CHUNK_LENGTH or last space
      if (lastBreakPoint < MAX_TTS_CHUNK_LENGTH / 2 && currentChunk.length === MAX_TTS_CHUNK_LENGTH) {
          const lastSpaceFallback = currentChunk.lastIndexOf(' ');
          if (lastSpaceFallback > 0) {
            chunks.push(currentChunk.substring(0, lastSpaceFallback + 1));
            remainingText = remainingText.substring(lastSpaceFallback + 1);
          } else {
            chunks.push(currentChunk);
            remainingText = remainingText.substring(MAX_TTS_CHUNK_LENGTH);
          }
      } else {
        chunks.push(remainingText.substring(0, lastBreakPoint + 1));
        remainingText = remainingText.substring(lastBreakPoint + 1);
      }
    }
  }
  return chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
};
