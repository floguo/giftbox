import { DraggableItem } from "@/components/draggable-item";
import { LetterNote } from "@/components/letter-note";
import { PhotoItem } from "@/components/photo-item";
import { SpotifyPlayer } from "@/components/spotify-player";
import { VoiceNote } from "@/components/voice-note";
import { LetterItem } from "@/lib/type";
import React from "react";

interface LetterCanvasProps {
  items: LetterItem[];
  updateItemPosition: (id: string, position: { x: number; y: number }) => void;
  updateItemContent: (id: string, content: string, field?: string) => void;
  deleteItem: (id: string) => void;
  handleDragStart: (
    e: React.MouseEvent | React.TouchEvent,
    item: LetterItem
  ) => void;
  isDragging: boolean;
  currentItem: LetterItem | null;
}

export const LetterCanvas: React.FC<LetterCanvasProps> = ({
  items,
  updateItemContent,
  deleteItem,
  handleDragStart,
  isDragging,
  currentItem,
  // updateItemPosition,
}) => {
  const renderItem = (item: LetterItem) => {
    switch (item.type) {
      case "photo":
        return (
          <PhotoItem
            url={item.content as string}
            caption={item.caption || ""}
            onCaptionChange={(caption) =>
              updateItemContent(item.id, caption, "caption")
            }
          />
        );
      case "note":
        return (
          <LetterNote
            content={item.content as string}
            onChange={(content) => updateItemContent(item.id, content)}
            color={item.color || "bg-white"}
          />
        );
      case "voice":
        return <VoiceNote audioUrl={item.content as string} />;
      case "spotify":
        return <SpotifyPlayer spotifyUrl={item.content as string} />;
      case "doodle":
        return (
          <img
            src={item.content as string}
            alt="Doodle"
            className="w-48 h-48 object-contain"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full relative">
      {items.map((item) => (
        <DraggableItem
          key={item.id}
          item={item}
          onDelete={() => deleteItem(item.id)}
          handleDragStart={handleDragStart}
          isDragging={isDragging && currentItem?.id === item.id}
          updateItemContent={updateItemContent}
        >
          {renderItem(item)}
        </DraggableItem>
      ))}
    </div>
  );
};
