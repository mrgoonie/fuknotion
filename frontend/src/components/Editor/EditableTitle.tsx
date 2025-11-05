import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface EditableTitleProps {
  title: string;
  onSave: (newTitle: string) => Promise<void>;
}

export function EditableTitle({ title, onSave }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(title);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update value when title prop changes
  useEffect(() => {
    setValue(title);
  }, [title]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = async () => {
    const trimmedValue = value.trim();

    // Don't save if empty or unchanged
    if (!trimmedValue || trimmedValue === title) {
      setValue(title); // Reset to original
      setIsEditing(false);
      return;
    }

    try {
      await onSave(trimmedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save title:', error);
      setValue(title); // Reset on error
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(title);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="text-3xl font-semibold bg-transparent border-none outline-none focus:ring-0 text-text-primary w-full px-0"
        placeholder="Untitled"
      />
    );
  }

  return (
    <h1
      onClick={() => setIsEditing(true)}
      className="text-3xl font-semibold text-text-primary cursor-text hover:opacity-80 transition-opacity"
      title="Click to edit"
    >
      {title || 'Untitled'}
    </h1>
  );
}
