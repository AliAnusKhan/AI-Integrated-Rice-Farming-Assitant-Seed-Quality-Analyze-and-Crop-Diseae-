// src/hooks/useHistory.js

import { useEffect, useState, useCallback } from "react";
import { saveToHistory, subscribeToAllHistory } from "../services/historyService";

/**
 * Custom hook for managing history state
 * @param {string} userId - Current user's UID
 * @returns {object} - History state and functions
 */
export const useHistory = (userId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToAllHistory(
      userId,
      (data) => {
        setHistory(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [userId]);

  // Save to history helper
  const saveToHistoryFn = useCallback(async (category, result) => {
    if (!userId) {
      throw new Error("User must be logged in to save history");
    }
    return saveToHistory(userId, category, result);
  }, [userId]);

  return {
    history,
    loading,
    error,
    saveToHistory: saveToHistoryFn,
  };
};

/**
 * Custom hook for saving to history
 * @param {string} userId - Current user's UID
 * @returns {object} - Save function and state
 */
export const useSaveHistory = (userId) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const save = useCallback(async (category, result) => {
    if (!userId) {
      throw new Error("User must be logged in to save history");
    }

    setSaving(true);
    setError(null);

    try {
      const savedRecord = await saveToHistory(userId, category, result);
      setSaving(false);
      return savedRecord;
    } catch (err) {
      setError(err.message);
      setSaving(false);
      throw err;
    }
  }, [userId]);

  return {
    save,
    saving,
    error,
  };
};
