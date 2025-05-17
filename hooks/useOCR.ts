import { useState, useEffect } from 'react';
import { processOCRRecord, summarizeError } from '@/lib/ocr/processor';

interface OCRState {
  errorText: string | null;
  explanation: string | null;
  isProcessing: boolean;
}

export function useOCR() {
  const [state, setState] = useState<OCRState>({
    errorText: null,
    explanation: null,
    isProcessing: false,
  });

  useEffect(() => {
    // TODO: Replace with actual ScreenPipe integration
    const mockScreenPipe = {
      latestOCRRecord: {
        text: '',
        timestamp: Date.now(),
      },
    };

    const interval = setInterval(async () => {
      const record = mockScreenPipe.latestOCRRecord;
      if (!record.text) return;

      setState(prev => ({ ...prev, isProcessing: true }));

      try {
        const processed = await processOCRRecord(record);
        if (processed) {
          const explanation = await summarizeError(processed.errorText);
          setState({
            errorText: processed.errorText,
            explanation,
            isProcessing: false,
          });
        }
      } catch (error) {
        console.error('Error processing OCR:', error);
        setState(prev => ({ ...prev, isProcessing: false }));
      }
    }, 1000); // Poll every second

    return () => clearInterval(interval);
  }, []);

  return state;
} 