import { useEffect, useCallback } from 'react';

const useKeyboardShortcuts = ({
  onNavigateMonth,
  onNavigateWeek,
  onViewChange,
  onToggleDarkMode,
  onUndo,
  onRedo,
  onCopyWeek,
  onClear,
  onShowShortcuts,
  canUndo,
  canRedo,
  currentView
}) => {
  const handleKeyPress = useCallback((e) => {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Command/Control + Key combinations
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          e.preventDefault();
          if (canUndo) onUndo();
          break;
        case 'y':
          e.preventDefault();
          if (canRedo) onRedo();
          break;
        default:
          break;
      }
      return;
    }

    // Single key shortcuts
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        onNavigateMonth('prev');
        break;
      case 'ArrowRight':
        e.preventDefault();
        onNavigateMonth('next');
        break;
      case 'ArrowUp':
        e.preventDefault();
        onNavigateWeek('prev');
        break;
      case 'ArrowDown':
        e.preventDefault();
        onNavigateWeek('next');
        break;
      case 'm':
      case 'M':
        if (currentView !== 'month') onViewChange('month');
        break;
      case 'w':
      case 'W':
        if (currentView !== 'week') onViewChange('week');
        break;
      case 'l':
      case 'L':
        if (currentView !== 'list') onViewChange('list');
        break;
      case 'd':
      case 'D':
        onToggleDarkMode();
        break;
      case 'c':
      case 'C':
        onCopyWeek();
        break;
      case 'Delete':
      case 'Backspace':
        onClear();
        break;
      case '?':
        onShowShortcuts();
        break;
      case 'Escape':
        // This will be handled by the component to close any open modal
        break;
      default:
        break;
    }
  }, [
    onNavigateMonth,
    onNavigateWeek,
    onViewChange,
    onToggleDarkMode,
    onUndo,
    onRedo,
    onCopyWeek,
    onClear,
    onShowShortcuts,
    canUndo,
    canRedo,
    currentView
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Return the shortcuts info for the help modal
  return {
    shortcuts: [
      {
        category: 'Navigation',
        items: [
          { key: '←/→', description: 'Previous/Next month' },
          { key: '↑/↓', description: 'Previous/Next week' },
          { key: 'Space', description: 'Quick select current day' },
          { key: 'Esc', description: 'Close any open modal' }
        ]
      },
      {
        category: 'Views & Mode',
        items: [
          { key: 'M', description: 'Month view' },
          { key: 'W', description: 'Week view' },
          { key: 'L', description: 'List view' },
          { key: 'D', description: 'Toggle dark mode' }
        ]
      },
      {
        category: 'Actions',
        items: [
          { key: 'Ctrl/⌘ + Z', description: 'Undo' },
          { key: 'Ctrl/⌘ + Y', description: 'Redo' },
          { key: 'C', description: 'Copy week availability' },
          { key: 'Delete', description: 'Clear selected dates' }
        ]
      }
    ]
  };
};

export default useKeyboardShortcuts;