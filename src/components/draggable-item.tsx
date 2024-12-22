import { Button } from "@/components/ui/button";
import { LetterItem } from "@/lib/type";
import { X } from "lucide-react";
import React, { useState } from "react";

interface DraggableItemProps {
  item: LetterItem;
  onDelete: () => void;
  handleDragStart: (
    e: React.MouseEvent | React.TouchEvent,
    item: LetterItem
  ) => void;
  isDragging: boolean;
  children: React.ReactNode;
  isEditable: boolean;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  onDelete,
  handleDragStart,
  isDragging,
  children,
  isEditable,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const style: React.CSSProperties = {
    position: "absolute",
    left: item.position.x,
    top: item.position.y,
    transform: `rotate(${item.rotation}deg)`,
    opacity: isDragging ? 0.5 : 1,
    cursor: isEditable ? "move" : "default",
    transition: isDragging ? "none" : "all 0.3s ease-out",
    userSelect: "none",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (
      !isEditable ||
      (e.target as HTMLElement).tagName === "INPUT" ||
      (e.target as HTMLElement).tagName === "TEXTAREA" ||
      (e.target as HTMLElement).closest("button")
    ) {
      return;
    }
    e.preventDefault();
    handleDragStart(e, item);
  };

  return (
    <div
      style={style}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group touch-none"
    >
      {children}
      {isEditable && isHovered && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity p-1 h-6 w-6 hover:bg-red-600 z-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <X className="h-3 w-3 text-white" />
        </Button>
      )}
    </div>
  );
};
