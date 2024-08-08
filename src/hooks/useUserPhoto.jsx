import { useState, useEffect } from 'react';

const useUserPhoto = (user, defaultPhoto) => {
  const [userPhoto, setUserPhoto] = useState(user?.photoURL || defaultPhoto);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    if (user && user.photoURL && !photoLoadError) {
      if (user.photoURL !== userPhoto) {
        setUserPhoto(user.photoURL);
      }
    } else {
      if (userPhoto !== defaultPhoto) {
        setUserPhoto(defaultPhoto);
      }
    }
  }, [user, photoLoadError, defaultPhoto, userPhoto]);

  const handlePhotoError = () => {
    if (!photoLoadError) {
      setPhotoLoadError(true);
      setUserPhoto(defaultPhoto);
      console.error("Failed to load user photo, using default.");
    }
  };

  return [userPhoto, handlePhotoError];
};

export default useUserPhoto;
