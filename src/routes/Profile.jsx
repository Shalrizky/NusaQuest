import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Modal,
  Form,
  Spinner,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  updateUserData,
  uploadPhoto,
  deletePreviousPhoto,
} from "../services/userDataService";
import {
  checkIfAchievementExists,
  getUserAchievements,
} from "../services/achievementDataServices";
import { getPotionData } from "../services/itemsDataServices";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomToast from "../components/CustomToast";
import { setLocalStorageItem } from "../utils/localStorageUtil";
import { LogOut, UserPen, SaveAll } from "lucide-react";
import {
  validateUsername,
  hasChanges,
  validatePhoto,
} from "../utils/formValidationUtil";
import "../style/routes/Profile.css";

function Profile() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(user);
  const [userPhoto, handlePhotoError] = useUserPhoto(userData);
  const [userAchievements, setUserAchievements] = useState({});
  const [potionData, setPotionData] = useState(null);
  const [loading, setLoading] = useState(true); // Single loading state
  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [newUsername, setNewUsername] = useState(user?.displayName || "");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(userData.photoURL);
  const [usernameError, setUsernameError] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [hasChangesState, setHasChangesState] = useState(false);

  useEffect(() => {
    setHasChangesState(
      hasChanges(userData.displayName, newUsername) || selectedPhoto !== null
    );
  }, [newUsername, selectedPhoto, userData.displayName]);

  useEffect(() => {
    const fetchAchievementsAndPotion = async () => {
      try {
        const exists = await checkIfAchievementExists(user.uid);
        if (exists) {
          const achievements = await getUserAchievements(user.uid);
          setUserAchievements(achievements);
        }

        // Fetch potion data
        const potion = await getPotionData(user.uid);
        if (potion) {
          setPotionData(potion); // Set potion data to state
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false); // Stop loading once both data are fetched
      }
    };

    fetchAchievementsAndPotion();
  }, [user.uid]);

  const handleClose = () => {
    setShow(false);
    setSelectedPhoto(null);
    setPreviewPhoto(userData.photoURL);
    setUsernameError(null);
    setNewUsername(userData.displayName);
    setPhotoError(null);
  };

  const handleShowModalEdit = () => {
    setPreviewPhoto(userData.photoURL);
    setShow(true);
  };

  const toggleShowToast = (message, variant = "success") => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const handleLogOut = () => {
    logout();
  };

  const handleUsernameChange = (e) => {
    setNewUsername(e.target.value);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      setSelectedPhoto(null);
      setPreviewPhoto(userData.photoURL);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result);

      const validationError = validatePhoto(file);

      if (validationError) {
        setPhotoError(validationError);
        setSelectedPhoto(null);
      } else {
        setPhotoError(null);
        setSelectedPhoto(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();
    setLoading(true);

    const usernameValidation = validateUsername(newUsername);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      setLoading(false);
      return;
    }

    if (photoError) {
      setLoading(false);
      return;
    }

    try {
      const updatedUserData = {
        ...userData,
        displayName: newUsername,
      };

      if (selectedPhoto) {
        const isGooglePhoto = userData.photoURL?.startsWith(
          "https://lh3.googleusercontent.com/"
        );
        if (userData.photoURL && !isGooglePhoto) {
          await deletePreviousPhoto(userData.photoURL);
        }
        const { downloadURL } = await uploadPhoto(selectedPhoto, userData.uid);
        updatedUserData.photoURL = downloadURL;
      }

      await updateUserData(updatedUserData);
      setLocalStorageItem("user", updatedUserData);
      setUserData(updatedUserData);

      toggleShowToast("Profile updated successfully!", "success");

      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toggleShowToast(
        "Failed to update profile. Please try again later.",
        "danger"
      );
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Container fluid id="profile-container">
      <Header
        showTextHeader="PROFILE"
        showBackIcon={true}
        showLogoIcon={false}
      />
      <Row className="d-flex justify-content-center py-2 ">
        <Col md={3} className="d-flex align-items-center ">
          <Card className="profile-card">
            <Card.Body className="profile-card-content">
              <div className="profile-info text-center pb-3 d-flex justify-content-center align-items-center flex-column gap-3">
                <Image
                  className="user-img-profile"
                  src={userPhoto}
                  alt="Profile"
                  onError={handlePhotoError}
                  width={100}
                  height={100}
                />
                <div className="text-white w-100">
                  <h1>{userData?.displayName}</h1>
                  <p>{userData?.email}</p>
                </div>
              </div>
              <div className="d-grid justify-content-center align-items-center gap-3">
                <Button className="btn-edit" onClick={handleShowModalEdit}>
                  <UserPen /> Edit Profile
                </Button>
                <Button className="btn-logout" onClick={handleLogOut}>
                  <LogOut /> Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9} className="d-flex align-items-center">
          <Card className="profile-card-achievement">
            <Card.Body className="profile-card-achievement-content d-flex flex-column align-items-start">
              {loading ? (
                <Spinner
                  animation="border"
                  role="status"
                  style={{ color: "#fff" }}
                  className="m-auto"
                >
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : (
                <>
                  {/* Badges Section */}
                  <div className="text-white mb-3">
                    <h4 className="fw-bold">Your Badges</h4>
                  </div>
                  <div className="badge-container d-flex flex-wrap align-items-center justify-content-between">
                    {Object.keys(userAchievements).map((game) =>
                      Object.keys(userAchievements[game]).map((topic) => {
                        const achievement = userAchievements[game][topic];
                        return (
                          <div key={topic} className="badge-item">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip
                                  id={`tooltip-badge-${topic}`}
                                  className="custom-tooltip"
                                >
                                  {achievement.badge.badgeName}
                                </Tooltip>
                              }
                              container={document.body}
                            >
                              <Image
                                src={achievement.badge.iconURL}
                                alt={achievement.badge.badgeName}
                                className="badge-image-user"
                              />
                            </OverlayTrigger>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Achievements Section */}
                  <div className="text-white mb-3 mt-4">
                    <h4 className="fw-bold">Your Achievements</h4>
                  </div>

                  {Object.keys(userAchievements).length === 0 ||
                  Object.keys(userAchievements).every((game) =>
                    Object.keys(userAchievements[game]).every(
                      (topic) => userAchievements[game][topic].totalWins < 5
                    )
                  ) ? (
                    <div className="text-white text-center">
                      <h5>You don’t have any achievements</h5>
                    </div>
                  ) : (
                    <div className="achievement-container d-flex flex-wrap align-items-center justify-content-between">
                      {Object.keys(userAchievements).map((game) =>
                        Object.keys(userAchievements[game]).map((topic) => {
                          const achievement = userAchievements[game][topic];

                          if (achievement.totalWins >= 5) {
                            return (
                              <div key={topic} className="achievement-item">
                                <div className="trophy-item d-flex justify-content-center align-items-center gap-2">
                                  <Image
                                    src={achievement.achievement_trophy}
                                    alt={achievement.achievement_name}
                                    className="trophy-image-profile"
                                    width={70}
                                  />
                                  <div className="text-white fs-6">
                                    {achievement.achievement_name}
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          return null;
                        })
                      )}
                    </div>
                  )}

                  {/* Potion Section */}
                  <div className="text-white mb-3 mt-4">
                    <h4 className="fw-bold">Your Items</h4>
                  </div>
                  <div className="potion-container d-flex flex-wrap align-items-center justify-content-between">
                    <div className="potion-item">
                      <div className="potion-item d-flex justify-content-center align-items-center gap-2">
                        <Image
                          src={potionData.item_img}
                          alt={potionData.item_name}
                          className="potion-image-profile"
                          width={60}
                        />
                        <div className="text-white fs-6">
                          x{potionData.item_count} {potionData.item_name}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal
        id="modal-edit-profile"
        show={show}
        onHide={handleClose}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        backdrop="true"
      >
        <Modal.Header>
          <Modal.Title className="fw-bold text-center w-100">
            Edit Profile
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form
            onSubmit={handleSaveChanges}
            noValidate
            className="d-grid gap-2"
          >
            <Form.Group controlId="formUsername" className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter new username"
                value={newUsername}
                onChange={handleUsernameChange}
                isInvalid={!!usernameError}
              />
              <Form.Control.Feedback type="invalid">
                {usernameError}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="formProfilePhoto" className="mb-4">
              <Form.Label>Profile Photo</Form.Label>
              <div className="d-flex align-items-center">
                <Image
                  src={previewPhoto}
                  alt="Preview"
                  width={100}
                  className="me-3"
                  style={{
                    borderRadius: "100%",
                    width: "100px",
                    height: "100px",
                  }}
                />
                <Form.Control
                  type="file"
                  accept="image/png, image/jpg, image/jpeg"
                  onChange={handlePhotoChange}
                  isInvalid={!!photoError}
                />
              </div>
              <Form.Control.Feedback type="invalid" className="d-block mt-2">
                {photoError}
              </Form.Control.Feedback>
            </Form.Group>

            <Modal.Footer>
              <Button
                type="submit"
                className="btn-edit-profile text-center d-flex align-items-center justify-content-center gap-2"
                disabled={!hasChangesState || loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveAll /> Save Changes
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <CustomToast
        showToast={showToast}
        setShowToast={setShowToast}
        title={toastVariant === "success" ? "Berhasil!" : "Gagal"}
        body={toastMessage}
        bgColor={toastVariant}
        actionType={toastVariant}
      />

      <Footer textColor="#fff" />
    </Container>
  );
}

export default Profile;
