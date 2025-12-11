export interface ChatRequest {
    message: string;
    sessionId?: string;
  }
  
  export interface ChatResponse {
    response: string;
    sessionId: string;
    timestamp: Date;
  }
  
  export interface SystemPreferences {
    companyName: string;
    aiName: string;
    companyDescription: string;
    services: string[];
    agricultureGuidelines: string[];
    contactInfo: {
      email: string;
      phone: string;
      website: string;
    };
  }
  
  export type PromptFunction = (userMessage: string, preferences: SystemPreferences) => string;
  export type ValidationFunction = (input: unknown) => string | null;