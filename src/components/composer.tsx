import { useRef } from "react";

import { useState } from "react";

import { LetterItem } from "@/lib/type";
import { useAppContext } from "./AppContext";
import { DoodleDrawer } from "./doodle-drawer";
import { DottedBackground } from "./dotted-background";
import { LetterCanvas } from "./letter-canvas";
import { PhotoUploader } from "./photo-uploader";
import { Toolbar } from "./toolbar";
import { VoiceRecorder } from "./voice-recorder";

export default function DigitalLetterComposer({
  isEditable,
}: {
  isEditable: boolean;
}) {
  const { items, setItems } = useAppContext();
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isDoodleDrawerOpen, setIsDoodleDrawerOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  interface DraggableItem extends LetterItem {
    offsetX: number;
    offsetY: number;
  }

  const [currentItem, setCurrentItem] = useState<DraggableItem | null>(null);

  const getViewportPosition = () => {
    if (!canvasRef.current) return { x: 100, y: 100 };
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    // Add items slightly offset from the top-left of the viewport
    const x = scrollLeft + 100;
    const y = scrollTop + 100;

    return { x, y };
  };

  const addItem = (item: LetterItem) => {
    setItems((prevItems) => [...prevItems, item]);
  };

  const updateItemPosition = (
    id: string,
    position: { x: number; y: number }
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === id ? { ...item, position } : item))
    );
  };

  const updateItemContent = (
    id: string,
    content: string,
    field: string = "content"
  ) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: content } : item
      )
    );
  };

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleDragStart = (
    e: React.MouseEvent | React.TouchEvent,
    item: LetterItem
  ) => {
    const position = "touches" in e ? e.touches[0] : e;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const offsetX = position.clientX - rect.left;
    const offsetY = position.clientY - rect.top;

    setIsDragging(true);
    setCurrentItem({
      ...item,
      position: {
        x: item.position.x,
        y: item.position.y,
      },
      offsetX,
      offsetY,
    });
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !currentItem || !canvasRef.current) return;

    const position = "touches" in e ? e.touches[0] : e;
    const rect = canvasRef.current.getBoundingClientRect();
    const scrollLeft = canvasRef.current.scrollLeft;
    const scrollTop = canvasRef.current.scrollTop;

    // Calculate the new position in canvas coordinates
    const touchX = position.clientX - rect.left + scrollLeft;
    const touchY = position.clientY - rect.top + scrollTop;

    // Subtract the initial offset to maintain the grab point
    const x = touchX - currentItem.offsetX;
    const y = touchY - currentItem.offsetY;

    updateItemPosition(currentItem.id, { x, y });
  };

  const handleDragEnd = () => {
    if (canvasRef.current) {
      canvasRef.current.style.overflow = "auto";
    }
    setIsDragging(false);
    setCurrentItem(null);
  };

  const addNote = (color: string) => {
    const pos = getViewportPosition();
    addItem({
      id: Date.now().toString(),
      type: "note",
      content: "",
      position: {
        x: pos.x + Math.random() * 100,
        y: pos.y + Math.random() * 100,
      },
      rotation: (Math.random() - 0.5) * 10,
      color: color,
    });
  };

  const addSpotifyPlayer = (spotifyUrl: string) => {
    const pos = getViewportPosition();
    addItem({
      id: Date.now().toString(),
      type: "spotify",
      content: spotifyUrl,
      position: {
        x: pos.x + Math.random() * 100,
        y: pos.y + Math.random() * 100,
      },
      rotation: (Math.random() - 0.5) * 10,
    });
  };

  const addDoodle = (doodleUrl: string) => {
    const pos = getViewportPosition();
    addItem({
      id: Date.now().toString(),
      type: "doodle",
      content: doodleUrl,
      position: {
        x: pos.x + Math.random() * 100,
        y: pos.y + Math.random() * 100,
      },
      rotation: (Math.random() - 0.5) * 10,
    });
  };

  return (
    <div className="h-screen bg-stone-200 flex flex-col relative">
      <DottedBackground />
      <main
        className="flex-1 relative z-20 h-screen w-screen overflow-auto"
        ref={canvasRef}
        onMouseMove={isEditable ? handleDragMove : undefined}
        onTouchMove={(e) => {
          if (isDragging && isEditable) {
            e.preventDefault();
            handleDragMove(e);
          }
        }}
        onMouseUp={isEditable ? handleDragEnd : undefined}
        onTouchEnd={isEditable ? handleDragEnd : undefined}
        onMouseLeave={isEditable ? handleDragEnd : undefined}
      >
        <LetterCanvas
          items={items}
          updateItemPosition={updateItemPosition}
          updateItemContent={updateItemContent}
          deleteItem={deleteItem}
          handleDragStart={(e, item) => {
            e.stopPropagation();
            handleDragStart(e, item);
          }}
          isDragging={isDragging}
          currentItem={currentItem}
          isEditable={isEditable}
        />
      </main>
      {isEditable && (
        <div className="fixed bottom-0 left-0 right-0 z-30">
          <Toolbar
            onAddPhoto={() => setIsPhotoUploaderOpen(true)}
            onAddNote={addNote}
            onRecordVoice={() => setIsVoiceRecorderOpen(true)}
            onAddSpotify={addSpotifyPlayer}
            onAddDoodle={() => setIsDoodleDrawerOpen(true)}
          />
        </div>
      )}
      {isPhotoUploaderOpen && (
        <PhotoUploader
          onClose={() => setIsPhotoUploaderOpen(false)}
          onPhotoAdd={(photoUrl) => {
            const pos = getViewportPosition();
            addItem({
              id: Date.now().toString(),
              type: "photo",
              content: photoUrl,
              position: {
                x: pos.x + Math.random() * 100,
                y: pos.y + Math.random() * 100,
              },
              rotation: (Math.random() - 0.5) * 10,
              caption: "",
            });
            setIsPhotoUploaderOpen(false);
          }}
        />
      )}
      {isVoiceRecorderOpen && (
        <VoiceRecorder
          onClose={() => setIsVoiceRecorderOpen(false)}
          onVoiceAdd={(audioBlob) => {
            const pos = getViewportPosition();
            addItem({
              id: Date.now().toString(),
              type: "voice",
              content: audioBlob,
              position: {
                x: pos.x + Math.random() * 100,
                y: pos.y + Math.random() * 100,
              },
              rotation: (Math.random() - 0.5) * 10,
            });
            setIsVoiceRecorderOpen(false);
          }}
        />
      )}
      {isDoodleDrawerOpen && (
        <DoodleDrawer
          onClose={() => setIsDoodleDrawerOpen(false)}
          onDoodleAdd={(doodleUrl) => {
            addDoodle(doodleUrl);
            setIsDoodleDrawerOpen(false);
          }}
        />
      )}
    </div>
  );
}
