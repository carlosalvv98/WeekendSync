import { useState, useCallback } from 'react';

const useUndoRedo = (initialState) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  // Add new state to history
  const setState = useCallback((newState) => {
    setHistory(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.slice(0, currentIndex + 1);
      // Add new state and limit history to 50 items
      return [...newHistory, newState].slice(-50);
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  // Undo last action
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  // Redo previously undone action
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, history.length]);

  // Can we undo/redo?
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    state: history[currentIndex],
    setState,
    undo,
    redo,
    canUndo,
    canRedo
  };
};

export default useUndoRedo;