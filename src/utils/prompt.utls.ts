import { PromptFunction, SystemPreferences } from "../types/chatbot.types";
import { detectLanguage } from "./language.utls";

// Pure functions for prompt building
const buildSystemPrompt = (preferences: SystemPreferences): string => `
You are ${preferences.aiName}, a Bangla agriculture investment assistant for ${preferences.companyName}.

**Company Info:**
${preferences.companyDescription}

**Key Services:**
${preferences.services.slice(0, 3).map((service, index) => `${index + 1}. ${service}`).join('\n')}

**Investment Basics:**
- Minimum: ৫,০০০ টাকা
- Return: Up to 25% yearly
- Period: ৩-১২ মাস
- KYC: Required

**FAQ Highlights:**
- Platform: কৃষি বিনিয়োগ প্ল্যাটফর্ম
- Start: Select project → Complete KYC → Invest
- Updates: Dashboard → Overview section
- Profit: Automatic after project completion
- Safety: Verified farmers & projects
- Multiple: Yes, invest in multiple projects

**RULES:**
1. ALWAYS respond in BANGLA (বাংলা ভাষায়)
2. User may ask in English/Bangla, reply only in Bangla
3. Use only provided company info
4. Be helpful, use "আপনি" form
5. Add emojis 🌱💰 where appropriate
`;

const buildUserPrompt = (userMessage: string, userLanguage: string): string => {
    return `User query (${userLanguage}): "${userMessage}"
  
  Respond naturally in Bangla:`;
  };

  const buildContactInfo = (preferences: SystemPreferences): string => `
**Contact:**
Email: ${preferences.contactInfo.email}
Phone: ${preferences.contactInfo.phone}
Website: ${preferences.contactInfo.website}
`;

// Function to detect user language
export const detectUserLanguage = (message: string): 'bangla' | 'english' | 'mixed' => {
    const detection = detectLanguage(message);
    return detection.language;
  };
  
  // Enhanced prompt building with language context
  export const createChatPrompt: PromptFunction = (userMessage, preferences) => {
    const userLanguage = detectUserLanguage(userMessage);
    
    const systemPrompt = buildSystemPrompt(preferences);
    const contactInfo = buildContactInfo(preferences);
    const userPrompt = buildUserPrompt(userMessage, userLanguage);
    
    return `${systemPrompt}\n\n${contactInfo}\n\n${userPrompt}\n\nRemember: Answer in Bangla only.`;
  };
  
export const getSystemPreferences = (): SystemPreferences => ({
    companyName: process.env.FOSHOLBARI_COMPANY_NAME || 'ফসল বাড়ি',
    aiName: process.env.FOSHOLBARI_AI_NAME || 'ফসল মিত্র',
    companyDescription: process.env.FOSHOLBARI_COMPANY_DESCRIPTION || '',
    services: (process.env.FOSHOLBARI_SERVICES || '').split(','),
    agricultureGuidelines: (process.env.FOSHOLBARI_GUIDELINES || '').split(','),
    contactInfo: {
      email: process.env.FOSHOLBARI_CONTACT_EMAIL || 'support@fosholbari.com',
      phone: process.env.FOSHOLBARI_CONTACT_PHONE || '+৮৮০১৭০০-১২৩৪৫৬',
      website: process.env.FOSHOLBARI_WEBSITE || 'https://www.fosholbari.com'
    }
  });