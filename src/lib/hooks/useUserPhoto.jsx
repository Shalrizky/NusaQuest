// hooks/useUserPhoto.js
import { useState, useEffect } from 'react';

const useUserPhoto = (user, defaultPhoto) => {
  const [userPhoto, setUserPhoto] = useState(defaultPhoto);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    if (user && user.photoURL && !photoLoadError) {
      setUserPhoto(user.photoURL);
    } else {
      setUserPhoto(defaultPhoto);
    }
  }, [user, photoLoadError, defaultPhoto]);

  const handlePhotoError = () => {
    setPhotoLoadError(true);
    setUserPhoto(defaultPhoto);
    console.error("Failed to load user photo, using default.");
  };

  return [userPhoto, handlePhotoError];
};

export default useUserPhoto;
