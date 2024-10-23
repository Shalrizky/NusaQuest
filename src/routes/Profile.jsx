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
  const [loadingAchievements, setLoadingAchievements] = useState(true);
  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [loading, setLoading] = useState(false);

  // useState pada Modal Edit Profile
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
    const fetchAchievements = async () => {
      try {
        const exists = await checkIfAchievementExists(user.uid);
        if (exists) {
          const achievements = await getUserAchievements(user.uid);
          setUserAchievements(achievements);
        } else {
          const achievements = await getUserAchievements(user.uid);
          setUserAchievements(achievements);
        }
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoadingAchievements(false);
      }
    };

    fetchAchievements();
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

    // Preview the photo first
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
        displayName: newUsername, // Perbarui username dengan yang baru
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

      // Simpan perubahan username dan photoURL ke Firebase Database
      await updateUserData(updatedUserData);

      // Perbarui di local storage dan state aplikasi
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
          <Card id="profile-card">
            <Card.Body id="profile-card-content" className="text-center">
              <div className="profile-info py-3">
                <Image
                  id="img-profile"
                  src={userPhoto}
                  className="mx-auto"
                  onError={handlePhotoError}
                  alt="Profile"
                  width={100}
                  height={100}
                />
                <div className="text-white w-100">
                  <h1>{userData?.displayName}</h1>
                  <p>{userData?.email}</p>
                </div>
              </div>
              <div className="d-grid gap-3">
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
          <Card id="profile-card-Achievement" className="w-100">
            <Card.Body id="profile-card-Achievement-content">
              {/* Your Badges Section */}
              <div className="text-white mb-4">
                <h4 className="fw-bold">Your Badges</h4>
              </div>

              {loadingAchievements ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : Object.keys(userAchievements).length === 0 ? (
                // Display "You don’t have any badges" if no badges exist
                <div className="text-white text-center">
                  <h5>You don’t have any badges</h5>
                </div>
              ) : (
                <div className="badge-container d-flex flex-wrap gap-4 align-items-center mb-4">
                  {Object.keys(userAchievements).map((game) =>
                    Object.keys(userAchievements[game]).map((topic) => {
                      const achievement = userAchievements[game][topic];
                      return (
                        <div
                          key={topic}
                          className="badge-item d-flex flex-column align-items-center"
                        >
                          {/* Badge (always displayed with tooltip) */}
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
                            <div className="badge-item">
                              <Image
                                src={achievement.badge.iconURL}
                                alt={achievement.badge.badgeName}
                                className="badge-image-profile"
                              />
                            </div>
                          </OverlayTrigger>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Your Achievements Section */}
              <div className="text-white mb-4 mt-5">
                <h4 className="fw-bold">Your Achievements</h4>
              </div>

              {loadingAchievements ? (
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              ) : Object.keys(userAchievements).length === 0 ||
                Object.keys(userAchievements).every((game) =>
                  Object.keys(userAchievements[game]).every(
                    (topic) => userAchievements[game][topic].totalWins < 5
                  )
                ) ? (
                // Display "You don’t have any achievements" if no achievements with wins exist
                <div className="text-white text-center">
                  <h5>You don’t have any achievements</h5>
                </div>
              ) : (
                <div className="achievement-container d-flex flex-wrap gap-4 align-items-center mb-4">
                  {Object.keys(userAchievements).map((game) =>
                    Object.keys(userAchievements[game]).map((topic) => {
                      const achievement = userAchievements[game][topic];

                      // Show achievements only if totalWins >= 5
                      if (achievement.totalWins >= 5) {
                        return (
                          <div
                            key={topic}
                            className="achievement-item d-flex flex-column align-items-center"
                          >
                            <div className="trophy-item mt-3">
                              <Image
                                src={achievement.achievement_trophy}
                                alt={achievement.achievement_name}
                                className="trophy-image-profile"
                              />
                              {/* Display the title of the achievement */}
                              <div className="text-white mt-2">
                                {achievement.achievement_name}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null; // If totalWins < 5, do not return anything
                    })
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal Section */}
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
