import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Image,
  Modal,
  Form,
} from "react-bootstrap";
import { LogOut, UserPen } from "lucide-react";
import { setLocalStorageItem } from "../utils/localStorageUtil";
import useAuth from "../hooks/useAuth";
import useUserPhoto from "../hooks/useUserPhoto";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CustomToast from "../components/CustomToast";
import {
  validateUsername,
  hasChanges,
  validatePhoto,
} from "../utils/formValidationUtil";
import "../style/routes/Profile.css";

// Import Firebase modules
import { database, storage } from "../firebaseConfig";
import { ref as databaseRef, set } from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

function Profile() {
  const { user, logout, updateUserData } = useAuth();
  const [userData, setUserData] = useState(user);
  const [userPhoto, handlePhotoError] = useUserPhoto(userData);
  const [show, setShow] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");
  const [previewPhoto, setPreviewPhoto] = useState(userData.photoURL);

  // Form states for username and photo
  const [newUsername, setNewUsername] = useState(user?.displayName || "");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [usernameError, setUsernameError] = useState(null);
  const [photoError, setPhotoError] = useState(null);

  const handleClose = () => {
    setShow(false);
    setSelectedPhoto(null);
    setPreviewPhoto(userData.photoURL);
    setUsernameError(null);
    setPhotoError(null);
  };

  const handleShowModalEdit = () => setShow(true);

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
    const validationError = validatePhoto(file, userData.photoURL);

    if (validationError) {
      setPhotoError(validationError);
      return;
    }

    setPhotoError(null); // Clear any previous errors
    setSelectedPhoto(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadPhoto = async (file, userId) => {
    try {
      const fileRef = storageRef(
        storage,
        `profilePhotos/${userId}/${file.name}`
      );
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading file: ", error);
      throw error;
    }
  };

  const deletePreviousPhoto = async (photoURL) => {
    try {
      const photoRef = storageRef(storage, photoURL);
      await deleteObject(photoRef);
    } catch (error) {
      console.error("Error deleting previous photo: ", error);
    }
  };

  const updateUserPhotoURL = async (userId, downloadURL) => {
    try {
      const dbRef = databaseRef(database, `users/${userId}`);
      await set(dbRef, { photoURL: downloadURL });
    } catch (error) {
      console.error("Error updating user data: ", error);
      throw error;
    }
  };

  const handleSaveChanges = async (event) => {
    event.preventDefault();

    const usernameValidation = validateUsername(newUsername);
    if (usernameValidation) {
      setUsernameError(usernameValidation);
      return;
    }

    if (photoError) {
      return; // Prevent save if there's an error with the photo
    }

    let updatedUserData = {
      ...userData,
      displayName: newUsername,
    };

    if (!hasChanges(userData.displayName, newUsername) && !selectedPhoto) {
      setUsernameError("Tidak ada perubahan yang dilakukan.");
      return;
    }

    try {
      if (selectedPhoto) {
        // If there's a previous photo, delete it
        if (userData.photoURL) {
          await deletePreviousPhoto(userData.photoURL);
        }
        const downloadURL = await uploadPhoto(selectedPhoto, userData.uid);
        updatedUserData.photoURL = downloadURL;
        await updateUserPhotoURL(userData.uid, downloadURL);
      }

      await updateUserData(updatedUserData);
      setLocalStorageItem("user", updatedUserData);
      setUserData(updatedUserData);

      toggleShowToast("Data profil berhasil diperbarui!", "success");

      // Reload the page after any changes
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      toggleShowToast("Gagal memperbarui profil. Coba lagi nanti.", "danger");
    }

    handleClose();
  };

  return (
    <Container fluid id="profile-container">
      <Header layout="profile" showTextHeader="PROFILE" showBackIcon={true} />
      <Row className="d-flex justify-content-center py-2 ">
        <Col md={3} className="d-flex align-items-center ">
          <Card id="profile-card">
            <Card.Body id="profile-card-content" className="text-center">
              <div className="profile-info py-3">
                <Image
                  id="img-profile"
                  src={userData?.photoURL || userPhoto}
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
          <Card id="profile-card-Achievement">
            <Card.Body id="profile-card-Achievement-content">
              <div className="text-white">
                <h4 className="fw-bold">Badge</h4>
              </div>
              <div className="text-white">
                <h4 className="fw-bold">Achievement</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveChanges} noValidate>
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

            <Form.Group controlId="formProfilePhoto" className="mb-3">
              <Form.Label>Profile Photo</Form.Label>
              <div className="mb-3">
                <Image
                  src={previewPhoto}
                  alt="Preview"
                  width={100}
                  className="img-thumbnail"
                />
              </div>
              <Form.Control
                type="file"
                accept="image/png, image/jpg, image/jpeg"
                onChange={handlePhotoChange}
                isInvalid={!!photoError}
              />
              <Form.Control.Feedback type="invalid">
                {photoError}
              </Form.Control.Feedback>
            </Form.Group>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
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
