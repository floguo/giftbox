import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface LetterNoteProps {
  content: string;
  onChange: (content: string) => void;
  color: string;
}

export const LetterNote: React.FC<LetterNoteProps> = ({
  content,
  onChange,
  color,
}) => {
  return (
    <div
      className={`${color} p-4 shadow-lg border border-stone-300 transition-all duration-300 ease-in-out hover:shadow-2xl rounded-md w-48 z-10`}
    >
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your note here..."
        className="w-full h-32 resize-none bg-transparent border-none shadow-none focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 font-mono"
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
};
