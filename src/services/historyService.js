// src/services/historyService.js

import { ref, push, onValue, query, orderByChild, serverTimestamp, off } from "firebase/database";
import { realtimeDb } from "../firebase";

/**
 * Save analysis result to Firebase Realtime Database
 * @param {string} userId - Current user's UID
 * @param {string} category - 'seedAnalysis', 'diseaseDetections', or 'yieldPredictions'
 * @param {object} result - The analysis/prediction result data
 * @returns {Promise<object>} - The saved record with ID
 */
export const saveToHistory = async (userId, category, result) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!category || !result) {
    throw new Error("Category and result are required");
  }

  try {
    // Reference to user's specific category
    const historyRef = ref(realtimeDb, `users/${userId}/${category}`);
    
    console.log(`💾 Saving to ${category}...`);
    console.log(`📍 Path: users/${userId}/${category}`);
    console.log(`📦 Data:`, result);
    
    // Push new record with auto-generated ID and server timestamp
    const newRecordRef = await push(historyRef, {
      result,
      timestamp: serverTimestamp(), // Server-side timestamp
      createdAt: Date.now(), // Client-side fallback timestamp
    });

    console.log(`✅ Saved to ${category} with ID: ${newRecordRef.key}`);
    console.log(`📊 Total records should be visible now`);
    
    return { id: newRecordRef.key, ...result };
  } catch (error) {
    console.error(`❌ Error saving to ${category}:`, error);
    console.error(`🔍 Error details:`, error.message);
    throw error;
  }
};

/**
 * Subscribe to real-time history updates
 * @param {string} userId - Current user's UID
 * @param {string} category - 'seedAnalysis', 'diseaseDetections', or 'yieldPredictions'
 * @param {function} callback - Function to call with updated data
 * @returns {function} - Unsubscribe function
 */
export const subscribeToHistory = (userId, category, callback) => {
  if (!userId) {
    console.error("User ID is required for subscription");
    return () => {};
  }

  try {
    const historyRef = ref(realtimeDb, `users/${userId}/${category}`);
    
    // Order by createdAt for latest first (fallback since serverTimestamp can't be used directly)
    const historyQuery = query(historyRef, orderByChild("createdAt"));

    const unsubscribe = onValue(
      historyQuery,
      (snapshot) => {
        const data = snapshot.val();
        
        if (!data) {
          callback([]);
          return;
        }

        // Convert object to array and sort by timestamp (latest first)
        const historyArray = Object.entries(data)
          .map(([id, item]) => ({
            id,
            ...item,
            timestamp: item.timestamp || item.createdAt,
          }))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        callback(historyArray);
      },
      (error) => {
        console.error(`❌ Error fetching ${category}:`, error);
        callback([]);
      }
    );

    return () => off(historyRef); // Cleanup function
  } catch (error) {
    console.error(`❌ Error subscribing to ${category}:`, error);
    return () => {};
  }
};

/**
 * Subscribe to all history categories at once
 * @param {string} userId - Current user's UID
 * @param {function} callback - Function to call with merged history data
 * @returns {function} - Unsubscribe function
 */
export const subscribeToAllHistory = (userId, callback) => {
  if (!userId) {
    console.error("User ID is required for subscription");
    return () => {};
  }

  const categories = ['seedAnalysis', 'diseaseDetections', 'yieldPredictions'];
  const unsubscribes = [];
  
  // Use a ref-like object that persists across callbacks
  const allHistoryState = {
    seedAnalysis: [],
    diseaseDetections: [],
    yieldPredictions: [],
  };

  categories.forEach((category) => {
    const historyRef = ref(realtimeDb, `users/${userId}/${category}`);
    const historyQuery = query(historyRef, orderByChild("createdAt"));

    const unsub = onValue(
      historyQuery,
      (snapshot) => {
        const data = snapshot.val();
        console.log(`📦 ${category} snapshot:`, data);
        
        if (!data) {
          allHistoryState[category] = [];
        } else {
          // Convert object to array
          allHistoryState[category] = Object.entries(data)
            .map(([id, item]) => ({
              id,
              ...item,
              timestamp: item.timestamp || item.createdAt,
            }));
        }

        console.log(`✅ ${category} loaded:`, allHistoryState[category].length, 'records');

        // Merge all categories into single sorted array
        const mergedHistory = Object.entries(allHistoryState).flatMap(([cat, items]) =>
          items.map((item) => ({
            ...item,
            category: cat,
          }))
        ).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        console.log(`📊 Total merged history:`, mergedHistory.length, 'records');
        callback(mergedHistory);
      },
      (error) => {
        console.error(`❌ Error fetching ${category}:`, error);
        allHistoryState[category] = [];
        callback([]);
      }
    );
    
    unsubscribes.push(unsub);
  });

  // Return combined unsubscribe function
  return () => {
    console.log("🧹 Cleaning up history subscriptions");
    unsubscribes.forEach((unsub) => unsub());
  };
};

/**
 * Format timestamp to readable date/time
 * @param {number|object} timestamp - Firebase timestamp
 * @returns {string} - Formatted date string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Unknown date";

  // Handle Firebase server timestamp object
  if (typeof timestamp === 'object' && timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }

  // Handle numeric timestamp
  return new Date(timestamp).toLocaleString();
};

/**
 * Get category display name and icon color
 * @param {string} category - Category name
 * @returns {object} - Display configuration
 */
export const getCategoryConfig = (category) => {
  const config = {
    seedAnalysis: {
      label: "Seed Analysis",
      color: "green",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      textColor: "text-green-600 dark:text-green-400",
      badgeColor: "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400",
    },
    diseaseDetections: {
      label: "Disease Detection",
      color: "red",
      bgColor: "bg-red-100 dark:bg-red-900/30",
      textColor: "text-red-600 dark:text-red-400",
      badgeColor: "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400",
    },
    yieldPredictions: {
      label: "Yield Prediction",
      color: "yellow",
      bgColor: "bg-amber-100 dark:bg-amber-900/30",
      textColor: "text-amber-600 dark:text-amber-400",
      badgeColor: "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    },
  };

  return config[category] || {
    label: category,
    color: "blue",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    textColor: "text-blue-600 dark:text-blue-400",
    badgeColor: "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  };
};
