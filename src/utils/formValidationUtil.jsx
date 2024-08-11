export const validateUsername = (username) => {
   const allowedChars = /^[a-zA-Z0-9_.\- ]+$/;
 
   if (!username || username.trim() === "") {
     return "Username tidak boleh kosong.";
   }
   
   if (!allowedChars.test(username)) {
     return "Username hanya boleh mengandung huruf, angka, titik, garis bawah, atau tanda hubung.";
   }
 
   if (username.length > 50) {
     return "Username tidak boleh lebih dari 50 karakter.";
   }
 
   return null;
 };
 
 export const hasChanges = (currentData, newData) => {
   return currentData !== newData;
 };
 
 export const validatePhoto = (file) => {
   const validExtensions = ["image/png", "image/jpg", "image/jpeg"];
   const maxSizeMB = 5;
   const maxSizeBytes = maxSizeMB * 1024 * 1024;
 
   if (file) {
     if (!validExtensions.includes(file.type)) {
       return "Format file harus PNG, JPG, atau JPEG.";
     }
     if (file.size > maxSizeBytes) {
       return `Ukuran file maksimal adalah ${maxSizeMB}MB.`;
     }
   }
   return null;
 };
 