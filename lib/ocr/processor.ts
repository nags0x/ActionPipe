import { debounce } from 'lodash';

// Common error patterns
const ERROR_PATTERNS = {
  TYPE_ERROR: /TypeError:.*/i,
  REFERENCE_ERROR: /ReferenceError:.*/i,
  SYNTAX_ERROR: /SyntaxError:.*/i,
  RUNTIME_ERROR: /RuntimeError:.*/i,
  WEBPACK_ERROR: /ERROR in.*/i,
  VITE_ERROR: /Error:.*/i,
};

interface OCRRecord {
  text: string;
  timestamp: number;
}

let lastProcessedRecord: OCRRecord | null = null;

export function isErrorLike(text: string): boolean {
  return Object.values(ERROR_PATTERNS).some(pattern => pattern.test(text));
}

export function isNew(record: OCRRecord): boolean {
  if (!lastProcessedRecord) return true;
  return record.timestamp > lastProcessedRecord.timestamp;
}

export const processOCRRecord = debounce(async (record: OCRRecord) => {
  if (!isNew(record) || !isErrorLike(record.text)) {
    return null;
  }

  lastProcessedRecord = record;
  return {
    errorText: record.text,
    timestamp: record.timestamp,
  };
}, 500); // Debounce for 500ms

export async function summarizeError(errorText: string): Promise<string> {
  // TODO: Replace with actual OpenAI/LLM integration
  return `I found an error: ${errorText}. This typically means there's an issue with the code execution.`;
} 