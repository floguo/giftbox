"use client";

import { AppContextProvider } from "@/components/AppContext";
import DigitalLetterComposer from "@/components/composer";
import Letter from "@/components/letter";
import { LetterItem } from "@/lib/type";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import { SpotifyPlayer } from '@/components/spotify-player'

export default function MainContent({
  id,
  restoredState,
  to,
  from,
  isEditable,
}: {
  id: string;
  restoredState: LetterItem[] | null;
  to: string;
  from: string;
  isEditable: boolean;
}) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider giftId={id} restoredState={restoredState}>
        <DndProvider backend={HTML5Backend}>
          <div className="relative w-full h-full">
            <Letter to={to} from={from} />
            <DigitalLetterComposer isEditable={isEditable} />
          </div>
        </DndProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}
