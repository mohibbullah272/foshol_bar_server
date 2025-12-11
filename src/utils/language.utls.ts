export interface LanguageDetection {
    language: 'bangla' | 'english' | 'mixed';
    confidence: number;
    banglaPercentage: number;
    englishPercentage: number;
  }
  
  export const detectLanguage = (text: string): LanguageDetection => {
    const banglaRegex = /[\u0980-\u09FF]/g;
    const englishRegex = /[A-Za-z]/g;
    
    const totalChars = text.length || 1; // Avoid division by zero
    
    const banglaMatches = text.match(banglaRegex) || [];
    const englishMatches = text.match(englishRegex) || [];
    
    const banglaPercentage = (banglaMatches.length / totalChars) * 100;
    const englishPercentage = (englishMatches.length / totalChars) * 100;
    
    let language: 'bangla' | 'english' | 'mixed' = 'mixed';
    let confidence = 0;
    
    if (banglaPercentage > 70) {
      language = 'bangla';
      confidence = banglaPercentage / 100;
    } else if (englishPercentage > 70) {
      language = 'english';
      confidence = englishPercentage / 100;
    } else {
      language = 'mixed';
      confidence = Math.max(banglaPercentage, englishPercentage) / 100;
    }
    
    return {
      language,
      confidence,
      banglaPercentage,
      englishPercentage
    };
  };
  
  export const isMostlyBangla = (text: string): boolean => {
    const detection = detectLanguage(text);
    return detection.language === 'bangla' && detection.confidence > 0.6;
  };
  
  export const isMostlyEnglish = (text: string): boolean => {
    const detection = detectLanguage(text);
    return detection.language === 'english' && detection.confidence > 0.6;
  };