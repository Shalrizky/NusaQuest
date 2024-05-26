import useAuth from "../../lib/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Row, Col } from "react-bootstrap";
import { UserRound } from "lucide-react";
import ImageLoader from "./ImageLoader";
import SifLogo from "../../assets/common/sif-logo.png";
import UpjLogo from "../../assets/common/upj-logo.png";
import transleteIcon from "../../assets/common/translete-icon.png";

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
      <ImageLoader
        srcList={[backIcon, UpjLogo, SifLogo, transleteIcon, UserRound]}
      >
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
          <img
            src={transleteIcon}
            alt="Translate Icon"
            width={51}
            height={51}
            className="pt-1"
          />
          {isLoggedIn ? ( // Cek jika pengguna sudah login
            <img
              src={user.photoURL || UserRound} // Gunakan foto profil pengguna jika tersedia, jika tidak, gunakan gambar avatar default
              alt="User Avatar"
              width={40}
              className="pt-1 rounded-circle"
              onClick={handleProfileClick}
              style={{ cursor: "pointer" }}
            />
          ) : (
            <div // Tampilan ikon profil default jika pengguna belum login
              className="ms-4"
              onClick={handleProfileClick}
              style={{
                backgroundColor: "#fff",
                borderRadius: "50%",
                padding: "4px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              <UserRound
                fill="#D8D8D4"
                strokeWidth={0}
                width={40}
                height={40}
              />
            </div>
          )}
        </Col>
      </ImageLoader>
    </Row>
  );
}

export default Header;
