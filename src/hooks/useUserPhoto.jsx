import { useState, useEffect } from 'react';
import defaultProfileIcon from '../assets/common/icon-profile.svg'; 

const useUserPhoto = (user) => {
  const [userPhoto, setUserPhoto] = useState(
    user?.firebasePhotoURL || user?.googlePhotoURL || defaultProfileIcon
  );
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    if (photoLoadError || (!user?.firebasePhotoURL && !user?.googlePhotoURL)) {
      setUserPhoto(defaultProfileIcon);
    } else {
      setUserPhoto(user.firebasePhotoURL || user.googlePhotoURL);
    }
  }, [user?.firebasePhotoURL, user?.googlePhotoURL, photoLoadError]);

  const handlePhotoError = () => {
    if (!photoLoadError) {
      setPhotoLoadError(true);
      console.error("Failed to load user photo, using default.");
    }
  };

  return [userPhoto, handlePhotoError];
};

export default useUserPhoto;
