/**
 * SM-2 lite item mastery hook.
 * Stores per-item accuracy history in localStorage (keyed by exerciseType+itemId).
 * Returns: { getWeight, recordAttempt, getAllMastery }
 */
import { useCallback } from 'react';
import { sm2Weight } from './audioEngine';

const STORAGE_KEY = 'gospian_item_mastery';

function loadStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch { return {}; }
}
function saveStore(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

export function useItemMastery() {
  const recordAttempt = useCallback((exerciseType, itemId, correct) => {
    const store = loadStore();
    const key = `${exerciseType}__${itemId}`;
    const history = store[key] || [];
    history.push(correct ? 100 : 0);
    if (history.length > 20) history.splice(0, history.length - 20);
    store[key] = history;
    saveStore(store);
  }, []);

  const getWeight = useCallback((exerciseType, itemId) => {
    const store = loadStore();
    const key = `${exerciseType}__${itemId}`;
    return sm2Weight(store[key] || []);
  }, []);

  const getAllMastery = useCallback(() => {
    const store = loadStore();
    return Object.entries(store).map(([key, history]) => {
      const [exerciseType, itemId] = key.split('__');
      const recent = history.slice(-10);
      const accuracy = recent.length ? recent.reduce((a,b)=>a+b,0)/recent.length : 0;
      return { exerciseType, itemId, accuracy, attempts: history.length };
    });
  }, []);

  const getAttempts = useCallback((exerciseType, itemId) => {
    const store = loadStore();
    const key = `${exerciseType}__${itemId}`;
    return (store[key] || []).length;
  }, []);

  const getDueItems = useCallback((exerciseType) => {
    const store = loadStore();
    return Object.entries(store)
      .filter(([key]) => key.startsWith(`${exerciseType}__`))
      .map(([key, history]) => {
        const itemId = key.replace(`${exerciseType}__`, '');
        const recent = history.slice(-5);
        const accuracy = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
        return { itemId, accuracy, attempts: history.length };
      })
      .filter(item => item.accuracy < 80)
      .sort((a, b) => a.accuracy - b.accuracy);
  }, []);

  return { recordAttempt, getWeight, getAllMastery, getAttempts, getDueItems };
}