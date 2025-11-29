import { useEffect, useState, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

interface UseUnsavedChangesOptions {
  isDirty: boolean;
  onConfirmLeave?: () => void;
}

export function useUnsavedChanges({ isDirty, onConfirmLeave }: UseUnsavedChangesOptions) {
  const [showDialog, setShowDialog] = useState(false);
  
  // Block navigation when form is dirty
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Show dialog when blocker is triggered
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowDialog(true);
    }
  }, [blocker.state]);

  // Handle browser refresh/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const confirmLeave = useCallback(() => {
    onConfirmLeave?.();
    setShowDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
  }, [blocker, onConfirmLeave]);

  const cancelLeave = useCallback(() => {
    setShowDialog(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  return {
    showDialog,
    setShowDialog,
    confirmLeave,
    cancelLeave,
  };
}
