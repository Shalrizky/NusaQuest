import React from "react";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useAuth from "../../lib/hooks/useAuth";
import useUserPhoto from "../../lib/hooks/useUserPhoto";
import { UserRound } from "lucide-react";
import SifLogo from "../../assets/common/sif-logo.png";
import UpjLogo from "../../assets/common/upj-logo.png";
import transleteIcon from "../../assets/common/translete-icon.png";
import BackIcon from "../../assets/common/back-icon.png";
import "../../style/components/Header.css";

function Header({
  layout,
  profileText,
  showLogos = true,
  showBackIcon = false,
  showIcons = true,
}) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [userPhoto, handlePhotoError] = useUserPhoto(user, UserRound);

  const handleProfileClick = () => {
    navigate(isLoggedIn ? "/profile" : "/login");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <Row className={`py-4 px-2 d-flex align-items-center ${layout}-layout`}>
      {showBackIcon && (
        <Col
          md={layout === "lobby" ? 2 : 1}
          sm={1}
          xs={1}
          className="d-flex justify-content-start align-items-center ps-4"
          style={{ cursor: "pointer" }}
        >
          <img
            src={BackIcon}
            alt="Back Icon"
            width={30}
            onClick={handleBackClick}
          />
          {layout === "lobby" && showIcons && (
            <>
              <img
                src={transleteIcon}
                alt="Translate Icon"
                width={50}
                className="ms-3"
              />
              {isLoggedIn ? (
                <img
                  src={userPhoto}
                  alt="Profile icon"
                  width={45}
                  className="rounded-circle ms-3"
                  onClick={handleProfileClick}
                  onError={handlePhotoError}
                  style={{ cursor: "pointer" }}
                />
              ) : (
                <div
                  id="default-profile-icon"
                  onClick={handleProfileClick}
                  style={{ cursor: "pointer" }}
                >
                  <UserRound
                    fill="#D8D8D4"
                    strokeWidth={0}
                    width={50}
                    height={30}
                    className="ms-3"
                  />
                </div>
              )}
            </>
          )}
        </Col>
      )}
      {showLogos && (
        <Col
          md={layout === "profile" ? 3 : 4}
          sm={layout === "profile" ? 3 : 4}
          xs={layout === "profile" ? 3 : 4}
          className="d-flex justify-content-start align-items-center"
        >
          <img src={UpjLogo} alt="UPJ Logo" className="me-4" />
          <img src={SifLogo} alt="SIF Logo" />
        </Col>
      )}
      <Col
        md={layout === "profile" ? 5 : 4}
        sm={layout === "profile" ? 5 : 4}
        xs={layout === "profile" ? 5 : 4}
        className="d-flex justify-content-center align-items-center"
      >
        <h2 className="fw-bold text-white">{profileText}</h2>
      </Col>
      {showIcons && layout !== "lobby" && (
        <Col
          md={layout === "profile" ? 3 : 4}
          sm={layout === "profile" ? 3 : 4}
          xs={layout === "profile" ? 3 : 4}
          className="d-flex justify-content-end align-items-center"
        >
          <img
            src={transleteIcon}
            alt="Translate Icon"
            width={50}
            className="me-3"
          />
          {isLoggedIn ? (
            <img
              src={userPhoto}
              alt="Profile icon"
              width={45}
              className="rounded-circle"
              onClick={handleProfileClick}
              onError={handlePhotoError}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div
              id="default-profile-icon"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            >
              <UserRound
                fill="#D8D8D4"
                strokeWidth={0}
                width={50}
                height={30}
              />
            </div>
          )}
        </Col>
      )}
    </Row>
  );
}

export default Header;
