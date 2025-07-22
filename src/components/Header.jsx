import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Image, Modal, Button } from "react-bootstrap";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import { useLanguage } from "../context/LanguageContext";
import { useStaticText, TranslatedText } from "../components/TranslationHelper";
import SifLogo from "../assets/common/sif-logo.svg";
import UpjLogo from "../assets/common/upj-logo.svg";
import transleteIcon from "../assets/common/translete-flag.svg";
import BackIcon from "../assets/common/back-icon.png";
import "../style/components/Header.css";

function BackButton({ onClick, layout }) {
  const { getText } = useStaticText();
  
  return (
    <Col 
      md={layout === "home" ? 1 : 4} 
      sm={2} 
      xs={2}
      className="d-flex justify-content-start align-items-center ps-4"
    >
      <Image 
        src={BackIcon} 
        alt={getText('back')}
        width={30} 
        onClick={onClick} 
        style={{ cursor: "pointer" }} 
        title={getText('back')}
      />
    </Col>
  );
}

function LogoIcons({ layout }) {
  return (
    <Col 
      md={layout === "home" ? 6 : 4} 
      sm={layout === "home" ? 6 : 4} 
      xs={layout === "home" ? 6 : 4}
      className="d-flex justify-content-start align-items-center"
    >
      <Image src={UpjLogo} alt="UPJ Logo" className="me-3" />
      <Image src={SifLogo} alt="SIF Logo" />
    </Col>
  );
}

function TextHeader({ layout, showTextHeader }) {
  return (
    <Col 
      md={4} 
      sm={8} 
      xs={8}
      className="d-flex justify-content-center align-items-center mx-auto text-center"
    >
      <h2 className="fw-bold text-white">
        <TranslatedText originalLang="id">
          {showTextHeader}
        </TranslatedText>
      </h2>
    </Col>
  );
}

function ProfileIcons({ 
  layout, 
  userPhoto, 
  handleProfileClick, 
  handlePhotoError,
  handleTranslateClick 
}) {
  const { isTranslating } = useLanguage();
  const { getText } = useStaticText();

  return (
    <Col 
      md={layout === "home" ? 6 : 4} 
      sm={layout === "home" ? 6 : 2} 
      xs={layout === "home" ? 6 : 2}
      className="d-flex justify-content-end align-items-center"
    >
      {/* Translate Icon with Click Handler */}
      <div className="position-relative me-3">
        <Image 
          src={transleteIcon} 
          alt={getText('changeLanguage')}
          width={45} 
          onClick={handleTranslateClick}
          style={{ 
            cursor: "pointer",
            opacity: isTranslating ? 0.6 : 1,
            transition: "opacity 0.3s ease"
          }}
          title={getText('changeLanguage')}
        />
        {isTranslating && (
          <div 
            className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '50%' }}
          >
            <div className="spinner-border spinner-border-sm text-light"></div>
          </div>
        )}
      </div>

      {/* Profile Image */}
      <Image 
        src={userPhoto} 
        alt={getText('profile')}
        width={45} 
        height={45} 
        className="rounded-circle" 
        onClick={handleProfileClick} 
        onError={handlePhotoError} 
        style={{ cursor: "pointer" }}
        title={getText('profile')}
      />
    </Col>
  );
}

function LanguageModal({ show, onHide }) {
  const { currentLanguage, switchLanguage, isTranslating } = useLanguage();
  const { getText } = useStaticText();

  const languages = [
    { 
      code: 'id', 
      name: getText('indonesian'),
      flag: '🇮🇩',
      description: 'Bahasa Indonesia'
    },
    { 
      code: 'en', 
      name: getText('english'),
      flag: '🇺🇸',
      description: 'English Language'
    }
  ];

  const handleLanguageSelect = (langCode) => {
    switchLanguage(langCode);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <TranslatedText originalLang="id">
            {getText('changeLanguage')}
          </TranslatedText>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-grid gap-3">
          {languages.map(lang => (
            <Button
              key={lang.code}
              variant={currentLanguage === lang.code ? "primary" : "outline-secondary"}
              className="d-flex align-items-center justify-content-start p-3"
              onClick={() => handleLanguageSelect(lang.code)}
              disabled={isTranslating}
            >
              <span className="fs-4 me-3">{lang.flag}</span>
              <div className="text-start">
                <div className="fw-bold">{lang.name}</div>
                <small className="text-muted">{lang.description}</small>
              </div>
              {currentLanguage === lang.code && (
                <span className="ms-auto">
                  <i className="bi bi-check-circle-fill text-success"></i>
                </span>
              )}
            </Button>
          ))}
        </div>
        
        {isTranslating && (
          <div className="mt-3 text-center">
            <div className="spinner-border spinner-border-sm me-2"></div>
            <small className="text-muted">
              <TranslatedText originalLang="id">
                {getText('translating')}
              </TranslatedText>
            </small>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}

function Header({ 
  layout, 
  showTextHeader, 
  showBackIcon = false, 
  showLogoIcon = true, 
  showIcons = true 
}) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? "/profile" : "/login");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleTranslateClick = () => {
    setShowLanguageModal(true);
  };

  const handleLanguageModalClose = () => {
    setShowLanguageModal(false);
  };

  return (
    <>
      <Row className={`py-4 px-2 d-flex align-items-center ${layout}-layout`}>
        {showBackIcon && (
          <BackButton layout={layout} onClick={handleBackClick} />
        )}
        
        {showLogoIcon && <LogoIcons layout={layout} />}
        
        {showTextHeader && (
          <TextHeader showTextHeader={showTextHeader} layout={layout} />
        )}
        
        {showIcons && (
          <ProfileIcons 
            layout={layout} 
            isLoggedIn={isLoggedIn} 
            userPhoto={userPhoto} 
            handleProfileClick={handleProfileClick} 
            handlePhotoError={handlePhotoError}
            handleTranslateClick={handleTranslateClick}
          />
        )}
      </Row>

      {/* Language Selection Modal */}
      <LanguageModal 
        show={showLanguageModal}
        onHide={handleLanguageModalClose}
      />
    </>
  );
}

export default Header;