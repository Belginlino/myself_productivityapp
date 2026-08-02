export interface SpeechRecognitionResultHandler {
  onResult: (text: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = navigator.language || 'en-US';
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(handlers: SpeechRecognitionResultHandler) {
    if (!this.recognition) {
      if (handlers.onError) {
        handlers.onError('Speech Recognition is not supported in this browser/device.');
      }
      return;
    }

    if (this.isListening) {
      this.stopListening();
    }

    let finalTranscript = '';

    this.recognition.onresult = (event: any) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      const currentText = finalTranscript || interimTranscript;
      handlers.onResult(currentText.trim());
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      if (handlers.onError) {
        handlers.onError(event.error || 'Failed to recognize speech.');
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (handlers.onEnd) {
        handlers.onEnd();
      }
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      this.isListening = false;
      if (handlers.onError) {
        handlers.onError(err.message || 'Error starting microphone.');
      }
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore
      }
      this.isListening = false;
    }
  }
}

export const speechService = new SpeechRecognitionService();
