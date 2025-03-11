"use client"

import React, { useState, useRef, useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Toolbar } from '@/components/toolbar'
import { LetterCanvas } from '@/components/letter-canvas'
import { PhotoUploader } from '@/components/photo-uploader'
import { VoiceRecorder } from '@/components/voice-recorder'
import { DoodleDrawer } from '@/components/doodle-drawer'
import { DottedBackground } from '@/components/dotted-background'
// import { SpotifyPlayer } from '@/components/spotify-player'

export interface LetterItem {
  id: string
  type: 'photo' | 'note' | 'voice' | 'spotify' | 'doodle'
  content: string | Blob
  position: { x: number; y: number }
  rotation: number
  scale?: number
  color?: string
  caption?: string
  offsetX?: number
  offsetY?: number
  zIndex?: number
}

export default function DigitalLetterComposer() {
  const [items, setItems] = useState<LetterItem[]>([])
  const [isPhotoUploaderOpen, setIsPhotoUploaderOpen] = useState(false)
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false)
  const [isDoodleDrawerOpen, setIsDoodleDrawerOpen] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentItem, setCurrentItem] = useState<LetterItem | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const getRandomPosition = () => {
    return { 
      x: Math.floor(Math.random() * 200), 
      y: Math.floor(Math.random() * 200) 
    }
  }
  
  const getRandomRotation = () => {
    return Math.floor((Math.random() - 0.5) * 10)
  }

  const normalizeZIndices = () => {
    setItems(prevItems => {
      
      const sortedItems = [...prevItems].sort((a, b) => 
        (a.zIndex || 0) - (b.zIndex || 0)
      );
      
      return sortedItems.map((item, index) => ({
        ...item,
        zIndex: index + 1
      }));
    });
  };

  const moveItemForward = (id: string) => {
    setItems(prevItems => {
      
      const sortedItems = [...prevItems].sort((a, b) => 
        (a.zIndex || 0) - (b.zIndex || 0)
      );
      
      const itemIndex = sortedItems.findIndex(item => item.id === id);
      if (itemIndex === -1 || itemIndex === sortedItems.length - 1) {
        return prevItems; 
      }
      
      const nextItem = sortedItems[itemIndex + 1];
      const currentItemZIndex = sortedItems[itemIndex].zIndex || 0;
      const nextItemZIndex = nextItem.zIndex || 0;
      
      return prevItems.map(item => {
        if (item.id === id) {
          return { ...item, zIndex: nextItemZIndex };
        } else if (item.id === nextItem.id) {
          return { ...item, zIndex: currentItemZIndex };
        }
        return item;
      });
    });
  };
  
  const moveItemBackward = (id: string) => {
    setItems(prevItems => {
      
      const sortedItems = [...prevItems].sort((a, b) => 
        (a.zIndex || 0) - (b.zIndex || 0)
      );
      
      const itemIndex = sortedItems.findIndex(item => item.id === id);
      if (itemIndex <= 0) {
        return prevItems; 
      }
      
      const prevItem = sortedItems[itemIndex - 1];
      const currentItemZIndex = sortedItems[itemIndex].zIndex || 0;
      const prevItemZIndex = prevItem.zIndex || 0;
      
      return prevItems.map(item => {
        if (item.id === id) {
          return { ...item, zIndex: prevItemZIndex };
        } else if (item.id === prevItem.id) {
          return { ...item, zIndex: currentItemZIndex };
        }
        return item;
      });
    });
  };
  useEffect(() => {
    normalizeZIndices();
  }, []);

  const addItem = (item: LetterItem) => {
    setItems((prevItems) => {
      
      const highestZIndex = prevItems.length > 0 
        ? Math.max(...prevItems.map(item => item.zIndex || 0)) 
        : 0;
      
      return [...prevItems, {
        ...item,
        zIndex: highestZIndex + 1
      }];
    });
  };

  const updateItemPosition = (id: string, position: { x: number; y: number }) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, position } : item
      )
    )
  }

  const updateItemContent = (id: string, content: string, field: string = 'content') => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, [field]: content } : item
      )
    )
  }

  const deleteItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id))
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, item: LetterItem) => {
    const position = 'touches' in e ? e.touches[0] : e
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    const offsetX = position.clientX - rect.left
    const offsetY = position.clientY - rect.top
    
    setIsDragging(true)
    setCurrentItem({
      ...item,
      position: {
        x: item.position.x,
        y: item.position.y,
      },
      offsetX,
      offsetY,
    } as LetterItem & { offsetX: number; offsetY: number })
  }

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !currentItem || !canvasRef.current) return
    
    const position = 'touches' in e ? e.touches[0] : e
    const rect = canvasRef.current.getBoundingClientRect()
    const x = position.clientX - rect.left - (currentItem?.offsetX ?? 0)
    const y = position.clientY - rect.top - (currentItem?.offsetY ?? 0)

    updateItemPosition(currentItem.id, { x, y })
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setCurrentItem(null)
  }

  const addNote = (color: string) => {
    addItem({
      id: Date.now().toString(),
      type: 'note',
      content: '',
      position: getRandomPosition(),
      rotation: getRandomRotation(),
      color: color
    })
  }

  const addSpotifyPlayer = (spotifyUrl: string) => {
    addItem({
      id: Date.now().toString(),
      type: 'spotify',
      content: spotifyUrl,
      position: getRandomPosition(),
      rotation: getRandomRotation()
    })
  }

  const addDoodle = (doodleUrl: string) => {
    addItem({
      id: Date.now().toString(),
      type: 'doodle',
      content: doodleUrl,
      position: getRandomPosition(),
      rotation: getRandomRotation()
    })
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen overflow-hidden bg-stone-200 flex flex-col relative">
        <DottedBackground />
        <main 
          className="flex-1 relative overflow-hidden z-20"
          ref={canvasRef}
          onMouseMove={handleDragMove}
          onTouchMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <LetterCanvas 
            items={items} 
            updateItemPosition={updateItemPosition}
            updateItemContent={updateItemContent}
            deleteItem={deleteItem}
            handleDragStart={handleDragStart}
            isDragging={isDragging}
            currentItem={currentItem}
            moveItemForward={moveItemForward}
            moveItemBackward={moveItemBackward}
          />
        </main>
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <Toolbar
            onAddPhoto={() => setIsPhotoUploaderOpen(true)}
            onAddNote={addNote}
            onRecordVoice={() => setIsVoiceRecorderOpen(true)}
            onAddSpotify={addSpotifyPlayer}
            onAddDoodle={() => setIsDoodleDrawerOpen(true)}
          />
        </div>
        {isPhotoUploaderOpen && (
          <PhotoUploader
            onClose={() => setIsPhotoUploaderOpen(false)}
            onPhotoAdd={(photoUrl) => {
              addItem({
                id: Date.now().toString(),
                type: 'photo',
                content: photoUrl,
                position: getRandomPosition(),
                rotation: getRandomRotation(),
                caption: ''
              })
              setIsPhotoUploaderOpen(false)
            }}
          />
        )}
        {isVoiceRecorderOpen && (
          <VoiceRecorder
            onClose={() => setIsVoiceRecorderOpen(false)}
            onVoiceAdd={(audioBlob) => {
              addItem({
                id: Date.now().toString(),
                type: 'voice',
                content: audioBlob,
                position: getRandomPosition(),
                rotation: getRandomRotation()
              })
              setIsVoiceRecorderOpen(false)
            }}
          />
        )}
        {isDoodleDrawerOpen && (
          <DoodleDrawer
            onClose={() => setIsDoodleDrawerOpen(false)}
            onDoodleAdd={(doodleUrl) => {
              addDoodle(doodleUrl)
              setIsDoodleDrawerOpen(false)
            }}
          />
        )}
      </div>
    </DndProvider>
  )
}