// src/services/storageService.js

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

/**
 * Upload image file to Firebase Storage
 * @param {File} file - Image file to upload
 * @param {string} userId - Current user's UID
 * @param {string} category - Category folder name
 * @returns {Promise<string>} - Download URL
 */
export const uploadImageToStorage = async (file, userId, category) => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    // Create unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${category}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExtension}`;

    // Create storage reference
    const storageRef = ref(storage, `users/${userId}/images/${fileName}`);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("✅ Image uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.warn("⚠️ Storage upload failed (CORS issue), using base64 fallback");
    console.warn("🔍 Error details:", error.message);
    console.warn("💡 To fix CORS: Run 'gsutil cors set cors.json gs://ai-integrated-rice-assistant.firebasestorage.app'");
    
    // Fallback: Convert to base64
    return convertToBase64(file);
  }
};

/**
 * Convert image file to base64 data URL
 * @param {File} file - Image file
 * @returns {Promise<string>} - Base64 data URL
 */
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
