
import { Section } from '../types';
import { CSV_EXPECTED_COLUMNS } from '../constants';

export const parseCsvToSections = (csvContent: string): Section[] => {
  const sections: Section[] = [];
  const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    throw new Error("CSV_TOO_SHORT: CSV file is too short. It must contain a header row and at least one data row.");
  }

  let rawHeaderLine = lines[0].trim();
  if (rawHeaderLine.charCodeAt(0) === 0xFEFF) {
    rawHeaderLine = rawHeaderLine.substring(1);
  }

  let headerLineForParsing = rawHeaderLine;
  if (headerLineForParsing.startsWith('"') && headerLineForParsing.endsWith('"')) {
    const unwrapped = headerLineForParsing.substring(1, headerLineForParsing.length - 1);
    if (!unwrapped.includes('"')) { 
        headerLineForParsing = unwrapped;
    }
  }

  const parseCsvRow = (rowString: string): string[] => {
    // Regex to split CSV by commas, respecting quoted fields.
    // It matches:
    // (?:^|,)  - a non-capturing group for start of line or a comma
    // (         - start capturing group for the field content
    //   "(?:[^"]| "")*" - a quoted field: starts with ", then non-" or escaped "" zero or more times, ends with "
    //   |       - OR
    //   [^,]*)   - an unquoted field: any character except comma zero or more times
    // )         - end capturing group
    const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(rowString)) !== null) {
      // If the quoted group (index 1) is defined, use it and replace escaped quotes
      // Otherwise, use the unquoted group (index 2)
      const field = match[1] !== undefined ? match[1].replace(/""/g, '"') : match[2];
      matches.push(field.trim());
    }
    return matches;
  };
  
  const headers = parseCsvRow(headerLineForParsing).map(h => h.trim().toLowerCase());
  console.log("Parsed CSV Headers:", headers); // Log headers
  
  const expectedSectionHeader = CSV_EXPECTED_COLUMNS[0].toLowerCase();
  const expectedDialogueHeader = CSV_EXPECTED_COLUMNS[1].toLowerCase(); // New: Dialogue
  const expectedSlideTextHeader = CSV_EXPECTED_COLUMNS[2].toLowerCase();
  const expectedKnowledgeBaseHeader = CSV_EXPECTED_COLUMNS[3].toLowerCase(); // New: Knowledge Base
  const expectedImageHeader = CSV_EXPECTED_COLUMNS[4].toLowerCase();

  const titleIndex = headers.findIndex(h => h === expectedSectionHeader);
  const dialogueIndex = headers.findIndex(h => h === expectedDialogueHeader);
  const slideTextIndex = headers.findIndex(h => h === expectedSlideTextHeader);
  const knowledgeBaseIndex = headers.findIndex(h => h === expectedKnowledgeBaseHeader);
  const imageIndex = headers.findIndex(h => h === expectedImageHeader);

  console.log("Header Indices - Section:", titleIndex, "Dialogue:", dialogueIndex, "Slide Text:", slideTextIndex, "Knowledge Base:", knowledgeBaseIndex, "Image:", imageIndex); // Log indices

  if (titleIndex === -1 || dialogueIndex === -1 || slideTextIndex === -1 || knowledgeBaseIndex === -1 || imageIndex === -1) {
    const foundHeadersString = parseCsvRow(rawHeaderLine).join(', ');
    const expectedHeadersString = CSV_EXPECTED_COLUMNS.join("', '");
    
    let missingOrWrong = [];
    if (titleIndex === -1) missingOrWrong.push(`'${CSV_EXPECTED_COLUMNS[0]}'`);
    if (dialogueIndex === -1) missingOrWrong.push(`'${CSV_EXPECTED_COLUMNS[1]}'`);
    if (slideTextIndex === -1) missingOrWrong.push(`'${CSV_EXPECTED_COLUMNS[2]}'`);
    if (knowledgeBaseIndex === -1) missingOrWrong.push(`'${CSV_EXPECTED_COLUMNS[3]}'`);
    if (imageIndex === -1) missingOrWrong.push(`'${CSV_EXPECTED_COLUMNS[4]}'`);
    
    const problemDetails = missingOrWrong.length > 0 ? `Missing or incorrect: ${missingOrWrong.join(', ')}.` : "Ensure column names and order are exact.";
    const errorMessage = `CSV_HEADER_MISMATCH: CSV column headers are incorrect. Expected: '${expectedHeadersString}'. Found: '${foundHeadersString}'. ${problemDetails} Please correct the headers.`;
    throw new Error(errorMessage);
  }

  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvRow(lines[i]);
    console.log(`Parsed Row ${i+1}:`, row); // Log each parsed row
    const maxIndex = Math.max(titleIndex, dialogueIndex, slideTextIndex, knowledgeBaseIndex, imageIndex);
    if (row.length > maxIndex) {
      const title = row[titleIndex];
      const dialogue = row[dialogueIndex];
      const slideText = row[slideTextIndex];
      const knowledgeBase = row[knowledgeBaseIndex];
      const imageFilename = row.length > imageIndex ? (row[imageIndex] || null) : null;
      
      console.log(`Row ${i+1} Mapped Data - Title: "${title}", Dialogue: "${dialogue}", Slide Text: "${slideText}", Knowledge Base: "${knowledgeBase}", Image: "${imageFilename}"`); // Log mapped data
      
      if (title && dialogue && slideText && knowledgeBase) {
        sections.push({
          id: `section-${Date.now()}-${i}`,
          title,
          dialogue,
          slideText,
          knowledgeBase,
          imageFilename: imageFilename ? imageFilename.trim() : null,
        });
      } else {
         console.warn(`Skipping CSV row ${i+1} due to missing mandatory fields (Section, Dialogue, Slide Text, or Knowledge Base): "${lines[i]}"`);
      }
    } else {
      console.warn(`Skipping malformed CSV row ${i+1} (not enough columns based on header indices): "${lines[i]}"`);
    }
  }

  if (sections.length === 0 && lines.length > 1) {
      throw new Error("CSV_NO_VALID_SECTIONS: No valid sections were parsed. Check if all data rows were malformed or missing 'Section', 'Dialogue', 'Slide Text', 'Knowledge Base'.");
  }
  
  return sections;
};
