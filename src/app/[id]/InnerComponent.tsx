"use client";

import { AppContextProvider, useAppContext } from "@/components/AppContext";
import DigitalLetterComposer from "@/components/composer";
import { Header } from "@/components/Header";
import Letter from "@/components/letter";
import { savedState } from "@/lib/action";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export default function MainContent({
  id,
  restoredState,
  isEditable,
  letterShown,
}: {
  id: string;
  restoredState: savedState | null;
  isEditable: boolean;
  letterShown: boolean;
}) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider
        giftId={id}
        restoredState={restoredState}
        isEditable={isEditable}
        letterShown={letterShown}
      >
        <DndProvider backend={HTML5Backend}>
          <Main isEditable={isEditable} />
        </DndProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

const Main = ({ isEditable }: { isEditable: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const { isLetterShowed } = useAppContext();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until we're mounted
  if (!mounted) {
    return null;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <Header />
      {!isLetterShowed && <Letter />}
      <DigitalLetterComposer isEditable={isEditable} />
    </div>
  );
};
