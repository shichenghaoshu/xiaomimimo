import { useRef, useEffect, useState } from "react";

interface ArtifactEditorProps {
  content: string;
  language?: string;
  readOnly?: boolean;
  onChange?: (value: string) => void;
}

export default function ArtifactEditor({
  content,
  language,
  readOnly = true,
  onChange,
}: ArtifactEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLineCount(content.split("\n").length);
  }, [content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLineCount(val.split("\n").length);
    onChange?.(val);
  };

  return (
    <div className="h-full flex bg-[#0f1115] overflow-hidden">
      {/* Line numbers gutter */}
      <div
        className="flex-shrink-0 bg-[#171a21] border-r border-[#2a2f3a] select-none"
      >
        <div className="py-3 pl-3 pr-2 text-right text-xs text-[#4a4f5a] font-mono leading-[1.7]">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
      </div>

      {/* Editor area */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        readOnly={readOnly}
        spellCheck={false}
        className={`flex-1 p-3 text-xs text-[#e6e6e6] font-mono bg-transparent resize-none outline-none
          leading-[1.7] overflow-auto whitespace-pre-wrap break-all
          ${readOnly ? "cursor-default" : "cursor-text"}
        `}
        placeholder={readOnly ? "" : "Start typing..."}
      />
    </div>
  );
}
