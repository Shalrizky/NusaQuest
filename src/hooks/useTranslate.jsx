// hooks/useTranslate.js
import { useState, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const useTranslate = () => {
  const { currentLanguage, translationCache, setTranslationCache, setIsTranslating } = useLanguage();
  const [error, setError] = useState(null);
  
  const pendingRequests = useRef(new Map());
  const requestQueue = useRef([]);
  const isProcessingQueue = useRef(false);
  const debounceTimers = useRef(new Map());

  // Debounce function
  const debounce = useCallback((key, func, delay = 100) => {
    if (debounceTimers.current.has(key)) {
      clearTimeout(debounceTimers.current.get(key));
    }
    
    return new Promise((resolve, reject) => {
      const timer = setTimeout(async () => {
        try {
          const result = await func();
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          debounceTimers.current.delete(key);
        }
      }, delay);
      
      debounceTimers.current.set(key, timer);
    });
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.current.length === 0) {
      return;
    }

    isProcessingQueue.current = true;
    
    try {
      while (requestQueue.current.length > 0) {
        const { resolve, reject, text, fromLang, toLang, cacheKey } = requestQueue.current.shift();
        
        try {
          if (translationCache.has(cacheKey)) {
            resolve(translationCache.get(cacheKey));
            continue;
          }

          console.log('🔄 Processing queued translation:', { text, fromLang, toLang });

          const response = await fetch(
            `https://api.fasturl.link/tool/translate?text=${encodeURIComponent(text)}&target=${toLang}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            if (response.status === 429) {
              requestQueue.current.unshift({ resolve, reject, text, fromLang, toLang, cacheKey });
              console.warn('⚠️ Rate limited, waiting 2 seconds...');
              await new Promise(r => setTimeout(r, 2000));
              continue;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log('📋 API response:', data);

          let translatedText = null;
          
          // Check multiple possible response formats
          if (data && data.status === 200 && data.result && data.result.translatedText) {
            translatedText = data.result.translatedText;
          } else if (data && data.translatedText) {
            translatedText = data.translatedText;
          } else if (data && data.translation) {
            translatedText = data.translation;
          } else if (data && data.text) {
            translatedText = data.text;
          } else if (typeof data === 'string') {
            translatedText = data;
          } else if (data && data.data && data.data.translatedText) {
            translatedText = data.data.translatedText;
          }

          if (translatedText && translatedText.trim() !== '') {
            console.log('✅ Translation successful:', translatedText);
            
            // Save to cache
            setTranslationCache(prev => new Map(prev.set(cacheKey, translatedText)));
            
            // Remove from pending requests
            pendingRequests.current.delete(cacheKey);
            
            resolve(translatedText);
          } else {
            throw new Error(`Invalid response format. Expected translation but got: ${JSON.stringify(data)}`);
          }

          // Add small delay between requests to avoid rate limiting
          if (requestQueue.current.length > 0) {
            await new Promise(r => setTimeout(r, 300));
          }

        } catch (err) {
          console.error('❌ Translation error:', err);
          pendingRequests.current.delete(cacheKey);
          reject(err);
        }
      }
    } finally {
      isProcessingQueue.current = false;
      setIsTranslating(false);
    }
  }, [translationCache, setTranslationCache, setIsTranslating]);

  const translateText = useCallback(async (text, fromLang = 'id', toLang = 'en') => {
    if (!text || text.trim() === '') return text;

    const cacheKey = `${text}_${fromLang}_${toLang}`;

    // Check cache first
    if (translationCache.has(cacheKey)) {
      console.log('📦 Using cached translation:', translationCache.get(cacheKey));
      return translationCache.get(cacheKey);
    }

    // Check if request is already pending
    if (pendingRequests.current.has(cacheKey)) {
      console.log('⏳ Translation already pending, waiting for result...');
      return pendingRequests.current.get(cacheKey);
    }

    // Create promise for this translation
    const translationPromise = new Promise((resolve, reject) => {
      // Add to queue with debouncing
      const debouncedAdd = () => {
        requestQueue.current.push({
          resolve,
          reject,
          text,
          fromLang,
          toLang,
          cacheKey
        });

        setIsTranslating(true);
        processQueue();
      };

      debounce(cacheKey, debouncedAdd, 50).catch(reject);
    });

    pendingRequests.current.set(cacheKey, translationPromise);

    try {
      const result = await translationPromise;
      return result;
    } catch (err) {
      console.error('❌ Translation failed:', err);
      setError(err.message);
      pendingRequests.current.delete(cacheKey);
      return text; 
    }
  }, [translationCache, setTranslationCache, setIsTranslating, debounce, processQueue]);

  const translateToCurrentLanguage = useCallback(async (text, originalLang = 'id') => {
    if (currentLanguage === originalLang) {
      return text; // No translation needed
    }
    return await translateText(text, originalLang, currentLanguage);
  }, [currentLanguage, translateText]);

  const translateFromCurrentLanguage = useCallback(async (text, targetLang = 'en') => {
    if (currentLanguage === targetLang) {
      return text; // No translation needed
    }
    return await translateText(text, currentLanguage, targetLang);
  }, [currentLanguage, translateText]);

  // Utility function to preload common translations
  const preloadTranslations = useCallback(async (texts, fromLang = 'id', toLang = 'en') => {
    console.log('📚 Preloading translations...');
    const promises = texts.map(text => translateText(text, fromLang, toLang));
    
    try {
      await Promise.allSettled(promises);
      console.log('✅ Preload completed');
    } catch (err) {
      console.warn('⚠️ Some preloads failed:', err);
    }
  }, [translateText]);

  // Clear all pending requests (useful for cleanup)
  const clearPendingRequests = useCallback(() => {
    pendingRequests.current.clear();
    requestQueue.current = [];
    debounceTimers.current.forEach(timer => clearTimeout(timer));
    debounceTimers.current.clear();
    isProcessingQueue.current = false;
  }, []);

  return {
    translateText,
    translateToCurrentLanguage,
    translateFromCurrentLanguage,
    preloadTranslations,
    clearPendingRequests,
    error,
    clearError: () => setError(null),
    // Debug info
    debugInfo: {
      pendingRequests: pendingRequests.current.size,
      queueLength: requestQueue.current.length,
      isProcessing: isProcessingQueue.current
    }
  };
};

export default useTranslate;