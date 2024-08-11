import { useState, useEffect } from 'react';

const useUserPhoto = (user, defaultPhoto) => {
  const [userPhoto, setUserPhoto] = useState(user?.photoURL || defaultPhoto);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    if (photoLoadError || !user?.photoURL) {
      setUserPhoto(defaultPhoto);
    } else if (user.photoURL !== userPhoto) {
      setUserPhoto(user.photoURL);
    }
  }, [user, photoLoadError, defaultPhoto, userPhoto]);

  const handlePhotoError = () => {
    if (!photoLoadError) {
      setPhotoLoadError(true);
      console.error("Failed to load user photo, using default.");
    }
  };

  return [userPhoto, handlePhotoError];
};

export default useUserPhoto;
