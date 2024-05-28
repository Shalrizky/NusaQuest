import useAuth from "../../lib/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { UserRound } from "lucide-react";
import SifLogo from "../../assets/common/sif-logo.png";
import UpjLogo from "../../assets/common/upj-logo.png";
import transleteIcon from "../../assets/common/translete-icon.png";
import "../../style/components/Header.css";

function Header({ layout, backIcon, profileText }) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const handleProfileClick = () => {
    if (isLoggedIn) {
      navigate("/profile");
    } else {
      navigate("/login");
    }
  };

  const handleBackClick = () => {
    navigate("/");
  };

  return (
    <Row className="py-4 px-2 d-flex align-items-center ">
      {layout === "profile" && backIcon && (
        <Col
          md={1}
          sm={1}
          xs={1}
          className="ps-4 d-flex justify-content-start align-items-center"
          style={{ cursor: "pointer" }}
        >
          <img
            src={backIcon}
            alt="Back Icon"
            width={30}
            onClick={handleBackClick}
          />
        </Col>
      )}

      <Col
        md={layout === "profile" ? 3 : 4}
        sm={layout === "profile" ? 3 : 4}
        xs={4}
        className="d-flex justify-content-start align-items-center"
      >
        <img src={UpjLogo} alt="UPJ Logo" className="me-4" />
        <img src={SifLogo} alt="SIF Logo" />
      </Col>

      <Col
        md={4}
        sm={4}
        xs={layout === "profile" ? 3 : 4}
        className="d-flex justify-content-center align-items-center"
      >
        <h2 className="fw-bold text-white">{profileText}</h2>
      </Col>

      <Col
        md={4}
        sm={4}
        xs={4}
        className="d-flex justify-content-end align-items-center"
      >
        <img src={transleteIcon} alt="Translate Icon" width={50} />
        {isLoggedIn ? (
          <img
            src={user.photoURL || UserRound}
            alt="Profile icon"
            width={45}
            className="rounded-circle ms-4"
            onClick={handleProfileClick}
            style={{ cursor: "pointer" }}
          />
        ) : (
          <div
            className="ms-4"
            id="default-profile-icon"
            onClick={handleProfileClick}
          >
            <UserRound fill="#D8D8D4" strokeWidth={0} width={50} height={30} />
          </div>
        )}
      </Col>
    </Row>
  );
}

export default Header;
