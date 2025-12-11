import axios, { AxiosInstance } from 'axios';

// Configuration as pure functions
const getHeaders = () => ({
  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': process.env.FOSHOLBARI_WEBSITE || 'https://fosholbari.com',
  'X-Title': 'Foshol Bari AI Assistant' // Use simple ASCII title
});

const createClient = (): AxiosInstance => {
  const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  
  return axios.create({
    baseURL,
    headers: getHeaders(),
    timeout: 30000 // 30 seconds timeout
  });
};

// Single client instance (memoized)
let clientInstance: AxiosInstance | null = null;

export const getOpenRouterClient = (): AxiosInstance => {
  if (!clientInstance) {
    clientInstance = createClient();
  }
  return clientInstance;
};

// Request/Response types
interface OpenRouterRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
}



// Pure function to create request payload with Bangla-optimized model
export const AVAILABLE_MODELS = [
    'google/gemma-2-2b-it:free',
    'microsoft/phi-3-mini-128k-instruct:free',
    'qwen/qwen-2.5-coder-32b-instruct:free',
    'microsoft/phi-3.5-mini-instruct:free',
    'meta-llama/llama-3.2-1b-instruct:free',
    'meta-llama/llama-3.2-3b-instruct:free'
  ];
  
  // Function to get a working model
  export const getWorkingModel = (): string => {
    return AVAILABLE_MODELS[0]; // Default to first available
  };
  
  // Updated createRequestPayload function
  export const createRequestPayload = (
    prompt: string,
    model?: string
  ): OpenRouterRequest => {
    const selectedModel = model || getWorkingModel();
    
    return {
      model: selectedModel,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Always respond in Bangla language. Use Bengali script.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    };
  };