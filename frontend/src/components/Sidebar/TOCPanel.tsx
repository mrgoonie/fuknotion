import { useMemo, useState } from 'react';

interface TOCPanelProps {
  content: string;
}

interface Heading {
  level: number;
  text: string;
  id: string;
}

export function TOCPanel({ content }: TOCPanelProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Extract headings from markdown content
  const headings = useMemo(() => {
    if (!content) return [];

    const lines = content.split('\n');
    const extracted: Heading[] = [];

    lines.forEach((line, index) => {
      // Match markdown headings (# to ######)
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        // Create a simple ID from the text
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        extracted.push({ level, text, id });
      }
    });

    return extracted;
  }, [content]);

  const handleHeadingClick = (id: string) => {
    setActiveId(id);
    // TODO: Implement scroll-to-heading functionality
    // Requires editor ref integration from BlockNote
  };

  if (headings.length === 0) {
    return (
      <div className="p-4">
        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Table of Contents</h4>
        <div className="text-sm text-gray-500">No headings found</div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Table of Contents</h4>

      <div className="space-y-1">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => handleHeadingClick(heading.id)}
            className={`
              w-full text-left text-sm px-2 py-1.5 rounded hover:bg-gray-100 transition-colors
              ${activeId === heading.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}
            `}
            style={{
              paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
            }}
          >
            <span className="truncate block">{heading.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
