import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import useTranslate from '../hooks/useTranslate';

export const TranslatedText = ({ 
  children, 
  originalLang = 'id', 
  fallback = null 
}) => {
  const { currentLanguage } = useLanguage();
  const { translateToCurrentLanguage } = useTranslate();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const doTranslation = async () => {
      if (currentLanguage === originalLang) {
        setTranslatedText(children);
        return;
      }

      setIsLoading(true);
      try {
        const result = await translateToCurrentLanguage(children, originalLang);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(fallback || children);
      } finally {
        setIsLoading(false);
      }
    };

    if (children && typeof children === 'string') {
      doTranslation();
    }
  }, [children, currentLanguage, originalLang, translateToCurrentLanguage, fallback]);

  if (isLoading) {
    return <span className="text-muted">...</span>;
  }

  return <>{translatedText}</>;
};

export const staticTexts = {
  id: {
    welcome: 'Selamat Datang',
    login: 'Masuk',
    logout: 'Keluar',
    profile: 'Profil',
    home: 'Beranda',
    back: 'Kembali',
    loading: 'Memuat...',
    error: 'Terjadi kesalahan',
    success: 'Berhasil',
    language: 'Bahasa',
    indonesian: 'Bahasa Indonesia',
    english: 'Bahasa Inggris',
    changeLanguage: 'Ubah Bahasa',
    translating: 'Menerjemahkan...',
  },
  en: {
    welcome: 'Welcome',
    login: 'Login',
    logout: 'Logout',
    profile: 'Profile',
    home: 'Home',
    back: 'Back',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    language: 'Language',
    indonesian: 'Indonesian',
    english: 'English',
    changeLanguage: 'Change Language',
    translating: 'Translating...',
  }
};

export const useStaticText = () => {
  const { currentLanguage } = useLanguage();
  
  const getText = (key) => {
    return staticTexts[currentLanguage]?.[key] || staticTexts.id[key] || key;
  };

  return { getText, texts: staticTexts[currentLanguage] };
};

export const LanguageSelector = ({ showFlag = true, className = '' }) => {
  const { currentLanguage, switchLanguage, isTranslating } = useLanguage();
  const { getText } = useStaticText();
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { code: 'id', name: getText('indonesian'), flag: '🇮🇩' },
    { code: 'en', name: getText('english'), flag: '🇺🇸' }
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`position-relative ${className}`}>
      <button
        className="btn btn-link p-0 d-flex align-items-center"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isTranslating}
        style={{ textDecoration: 'none' }}
      >
        {showFlag && <span className="me-2">{currentLang?.flag}</span>}
        <span className="text-white small">{currentLang?.name}</span>
        {isTranslating && <span className="ms-2 spinner-border spinner-border-sm"></span>}
      </button>

      {showDropdown && (
        <div 
          className="dropdown-menu show position-absolute"
          style={{ top: '100%', right: 0, zIndex: 1050 }}
        >
          {languages.map(lang => (
            <button
              key={lang.code}
              className={`dropdown-item ${currentLanguage === lang.code ? 'active' : ''}`}
              onClick={() => {
                switchLanguage(lang.code);
                setShowDropdown(false);
              }}
            >
              {showFlag && <span className="me-2">{lang.flag}</span>}
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {showDropdown && (
        <div 
          className="position-fixed w-100 h-100"
          style={{ top: 0, left: 0, zIndex: 1040 }}
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};  