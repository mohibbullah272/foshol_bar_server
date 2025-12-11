import { ValidationFunction } from "../types/chatbot.types";


export const validateMessage: ValidationFunction = (input) => {
  if (typeof input !== 'string') {
    return 'Message must be a string';
  }
  
  const message = input.trim();
  
  if (message.length === 0) {
    return 'Message cannot be empty';
  }
  
  if (message.length > 1000) {
    return 'Message too long (max 1000 characters)';
  }
  
  // Check for harmful content
  const harmfulPatterns = [
    /script/i,
    /<.*>/,
    /eval\(/i,
    /alert\(/i,
    /drop table/i,
    /delete from/i
  ];
  
  if (harmfulPatterns.some(pattern => pattern.test(message))) {
    return 'Message contains invalid content';
  }
  
  return null;
};

export const validateSessionId: ValidationFunction = (input) => {
  if (!input) return null; // Session ID is optional
  
  if (typeof input !== 'string') {
    return 'Session ID must be a string';
  }
  
  if (input.length > 100) {
    return 'Session ID too long';
  }
  
  return null;
};