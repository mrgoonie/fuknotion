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

  const performSave = useCallback(async (content: string) => {
    try {
      setIsSaving(true);
      setError(null);
      await onSave(content);
      setLastSaved(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Save failed'));
      console.error('Auto-save failed:', err);
    } finally {
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
      // Save any pending content before unmount
      if (pendingContentRef.current !== undefined && !isSaving) {
        performSave(pendingContentRef.current);
      }
    };
  }, [performSave, isSaving]);

  return { save, isSaving, lastSaved, error };
}
