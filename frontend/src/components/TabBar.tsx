import { X, FileText } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useUIStore } from '../stores/uiStore'
import { useNoteStore } from '../stores/noteStore'
import { cn } from '../lib/utils'
import { Tab } from '../lib/types'

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, removeTab, reorderTabs } = useUIStore()
  const { notes, setCurrentNote } = useNoteStore()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tabs.findIndex(tab => tab.id === active.id)
      const newIndex = tabs.findIndex(tab => tab.id === over.id)
      reorderTabs(oldIndex, newIndex)
    }
  }

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab.id)
    const note = notes.find(n => n.id === tab.noteId)
    if (note) {
      setCurrentNote(note)
    }
  }

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeTab(tabId)

    // If closing active tab, switch to the next available tab
    if (tabId === activeTabId) {
      const currentIndex = tabs.findIndex(t => t.id === tabId)
      const nextTab = tabs[currentIndex + 1] || tabs[currentIndex - 1]
      if (nextTab) {
        const note = notes.find(n => n.id === nextTab.noteId)
        if (note) {
          setCurrentNote(note)
        }
      } else {
        setCurrentNote(null)
      }
    }
  }

  if (tabs.length === 0) {
    return null
  }

  return (
    <div className="h-10 bg-surface border-b border-border flex items-center overflow-x-auto scrollbar-thin">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={tabs.map(t => t.id)}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex items-center h-full">
            {tabs.map(tab => (
              <TabItem
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                onClick={() => handleTabClick(tab)}
                onClose={(e) => handleCloseTab(tab.id, e)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

interface TabItemProps {
  tab: Tab
  isActive: boolean
  onClick: () => void
  onClose: (e: React.MouseEvent) => void
}

function TabItem({ tab, isActive, onClick, onClose }: TabItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tab.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "group relative h-full min-w-[120px] max-w-[200px] px-4 flex items-center gap-2",
        "border-r border-border cursor-pointer select-none",
        "transition-colors",
        isActive
          ? "bg-background text-foreground border-b-2 border-b-accent"
          : "bg-surface text-foreground-muted hover:bg-surface-elevated",
        isDragging && "opacity-50"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <FileText className="w-4 h-4 flex-shrink-0" />

      {/* Title */}
      <span className="flex-1 text-sm truncate">
        {tab.title || 'Untitled'}
      </span>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={cn(
          "w-4 h-4 rounded flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "hover:bg-surface-elevated",
          isActive && "opacity-100"
        )}
        aria-label="Close tab"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
