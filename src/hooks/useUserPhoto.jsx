import { useState, useEffect } from 'react';
import defaultProfileIcon from '../assets/common/icon-profile.svg'; 

const useUserPhoto = (user) => {
  const [userPhoto, setUserPhoto] = useState(user?.photoURL || defaultProfileIcon);
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    if (photoLoadError || !user?.photoURL) {
      setUserPhoto(defaultProfileIcon);
    } else if (user.photoURL !== userPhoto) {
      setUserPhoto(user.photoURL);
    }
  }, [user, photoLoadError, userPhoto]);

  const handlePhotoError = () => {
    if (!photoLoadError) {
      setPhotoLoadError(true);
      console.error("Failed to load user photo, using default.");
    }
  };

  return [userPhoto, handlePhotoError];
};

export default useUserPhoto;
