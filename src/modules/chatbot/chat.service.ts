
import { v4 as uuidv4 } from 'uuid';
import { ChatRequest, ChatResponse } from '../../types/chatbot.types';
import { getSystemPreferences } from '../../utils/prompt.utls';
import { getOpenRouterClient } from '../../config/openRouterConfig';


const generateSessionId = (existingId?: string): string => {
  return existingId || uuidv4();
};





  


  const MISTRAL_MODEL = 'mistralai/mistral-7b-instruct:free';

  // Simple and reliable chat function
  export const processChat = async (request: ChatRequest): Promise<ChatResponse> => {
    try {
      // Generate session ID
      const sessionId = generateSessionId(request.sessionId);
      
      // Get system preferences
      const preferences = getSystemPreferences();
      
      // Create minimal prompt
      const prompt = `You are ${preferences.aiName}, assistant for ${preferences.companyName}.
      
  Always respond in Bangla language.
  
  Company info:
  - কৃষি বিনিয়োগ প্ল্যাটফর্ম
  - নূন্যতম বিনিয়োগ: ৫,০০০ টাকা
  - সর্বোচ্চ রিটার্ন: ২৫% বার্ষিক
  - যোগাযোগ: ${preferences.contactInfo.email}
  
  User: ${request.message}
  
  Answer in Bangla:`;
      
      console.log(`Prompt length: ${prompt.length} chars`);
      
      // Call OpenRouter API
      const client = getOpenRouterClient();
      
      const payload = {
        model: MISTRAL_MODEL,
        messages: [
          {
            role: 'system',
            content: 'Always respond in Bangla. Use Bengali script.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 250
      };
      
      console.log(`Using model: ${MISTRAL_MODEL}`);
      
      const response = await client.post('/chat/completions', payload);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('AI service returned empty response');
      }
      
      // Clean response
      let aiResponse = response.data.choices[0].message.content.trim();
      
      // Ensure Bangla response
      if (!/[\u0980-\u09FF]/.test(aiResponse)) {
        aiResponse = 'দুঃখিত, আমি এখন বাংলায় উত্তর দিতে পারছি না।';
      }
      
      return {
        response: aiResponse,
        sessionId,
        timestamp: new Date()
      };
      
    } catch (error: any) {
      console.error('Chat error:', error.response?.data || error.message);
      
      // Handle rate limiting (429 error)
      if (error.response?.status === 429) {
        return {
          response: 'দুঃখিত, অনেক অনুরোধ করা হচ্ছে। দয়া করে এক মিনিট পর আবার চেষ্টা করুন।',
          sessionId: request.sessionId || uuidv4(),
          timestamp: new Date()
        };
      }
      
      return {
        response: 'দুঃখিত, আমি এখনই উত্তর দিতে পারছি না। দয়া করে পরে আবার চেষ্টা করুন।',
        sessionId: request.sessionId || uuidv4(),
        timestamp: new Date()
      };
    }
  };
// Function to get AI introduction in Bangla
export const getAIIntroduction = (): string => {
  const preferences = getSystemPreferences();
  
  return `👋 Assalamualaikum! আমি ${preferences.aiName}, ${preferences.companyName}-এর আপনার ডিজিটাল বিনিয়োগ সহকারী। 



আমি আপনাকে সাহায্য করতে পারি:
🌾 কৃষি বিনিয়োগ সম্পর্কে নির্দেশনা
🏢 ${preferences.companyName}-এর সেবাসমূহ সম্পর্কে তথ্য
📞 যোগাযোগের বিশদ এবং সহায়তা

আজকে আমি আপনাকে কৃষি বিনিয়োগে কীভাবে সাহায্য করতে পারি? 💰`;
};