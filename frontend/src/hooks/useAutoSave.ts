import { useEffect, useRef, useCallback, useState } from 'react';

export interface UseAutoSaveOptions {
  debounceMs?: number;
  onSave: (content: string) => Promise<void>;
}

export interface UseAutoSaveReturn {
  save: (content: string) => void;
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
}

/**
 * Hook for auto-saving content with debouncing
 * Automatically saves content after user stops typing for specified time
 */
export function useAutoSave({ debounceMs = 2000, onSave }: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const pendingContentRef = useRef<string>();
  const savingRef = useRef(false);

  // Keep savingRef in sync with isSaving state
  useEffect(() => {
    savingRef.current = isSaving;
  }, [isSaving]);

  const performSave = useCallback(async (content: string) => {
    try {
      savingRef.current = true;
      setIsSaving(true);
      setError(null);
      await onSave(content);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Save failed'));
      console.error('Auto-save failed:', err);
    } finally {
      savingRef.current = false;
      setIsSaving(false);
      pendingContentRef.current = undefined;
    }
  }, [onSave]);

  const save = useCallback((content: string) => {
    // Store pending content
    pendingContentRef.current = content;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (pendingContentRef.current !== undefined) {
        performSave(pendingContentRef.current);
      }
    }, debounceMs);
  }, [debounceMs, performSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Save any pending content before unmount if not currently saving
      // Use ref to avoid race condition with state
      if (pendingContentRef.current !== undefined && !savingRef.current) {
        void performSave(pendingContentRef.current);
      }
    };
  }, [performSave]);

  return { save, isSaving, lastSaved, error };
}
