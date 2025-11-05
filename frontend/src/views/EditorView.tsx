import { useAppStore } from '../stores/appStore';

export function EditorView() {
  const { currentNote } = useAppStore();

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-8">
        {currentNote ? (
          <div>
            <h1 className="text-3xl font-bold mb-4">{currentNote.title}</h1>
            <div className="prose max-w-none">
              {currentNote.content || 'Start writing...'}
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-xl mb-2">No note selected</p>
              <p className="text-sm">
                Select a note from the sidebar or create a new one
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
