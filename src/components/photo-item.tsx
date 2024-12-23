import { Input } from "@/components/ui/input";
import React from "react";

interface PhotoItemProps {
  url: string;
  caption: string;
  onCaptionChange: (caption: string) => void;
}

export const PhotoItem: React.FC<PhotoItemProps> = ({
  url,
  caption,
  onCaptionChange,
}) => {
  return (
    <div className="bg-white p-4 shadow-md rounded-lg w-60 border border-stone-300 relative z-10 transition-all duration-300 ease-in-out hover:shadow-2xl">
      <img
        src={url}
        alt="User uploaded image"
        className="w-full h-auto pointer-events-none border border-stone-200 rounded-sm shadow-inner"
        draggable="false"
      />
      <div className="mt-2">
        <Input
          type="text"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Add a caption..."
          className="w-full text-sm text-center border-none"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};
