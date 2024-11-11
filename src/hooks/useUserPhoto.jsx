import { useState, useEffect } from 'react';
import defaultProfileIcon from '../assets/common/icon-profile.svg';

const useUserPhoto = (user) => {
  // Inisialisasi dengan foto user jika ada, jika tidak, pakai default
  const [userPhoto, setUserPhoto] = useState(
    user?.firebasePhotoURL || user?.googlePhotoURL || defaultProfileIcon
  );
  const [photoLoadError, setPhotoLoadError] = useState(false);

  useEffect(() => {
    // Tetapkan gambar profil yang sesuai atau gunakan default jika ada error
    if (photoLoadError || (!user?.firebasePhotoURL && !user?.googlePhotoURL)) {
      setUserPhoto(defaultProfileIcon);
    } else {
      setUserPhoto(user.firebasePhotoURL || user.googlePhotoURL);
    }
  }, [user?.firebasePhotoURL, user?.googlePhotoURL, photoLoadError]);

  const handlePhotoError = () => {
    if (!photoLoadError) {
      setPhotoLoadError(true);
      setUserPhoto(defaultProfileIcon);  // Set langsung ke gambar default
      console.error("Failed to load user photo, using default.");
    }
  };

  return [userPhoto, handlePhotoError];
};

export default useUserPhoto;
