"use client";

import { AppContextProvider, useAppContext } from "@/components/AppContext";
import DigitalLetterComposer from "@/components/composer";
import Letter from "@/components/letter";
import { LetterItem } from "@/lib/type";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useLocalStorage } from "react-use";

export default function MainContent({
  id,
  restoredState,
  to,
  from,
  isEditable,
  letterShown,
}: {
  id: string;
  restoredState: LetterItem[] | null;
  to: string;
  from: string;
  isEditable: boolean;
  letterShown: boolean;
}) {
  const queryClient = new QueryClient();
  const [isLetterShowed, setIsLetterShowed, removeIsLetterShowed] =
    useLocalStorage(`${id}_letter_showed`, letterShown);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContextProvider
        giftId={id}
        restoredState={restoredState}
        useLocalStorage={{
          isLetterShowed,
          setIsLetterShowed,
          removeIsLetterShowed,
        }}
      >
        <DndProvider backend={HTML5Backend}>
          <Main to={to} from={from} isEditable={isEditable} />
        </DndProvider>
      </AppContextProvider>
    </QueryClientProvider>
  );
}

const Main = ({
  to,
  from,
  isEditable,
}: {
  to: string;
  from: string;
  isEditable: boolean;
}) => {
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
    <div className="relative w-full h-full">
      {!isLetterShowed && <Letter to={to} from={from} />}
      <DigitalLetterComposer isEditable={isEditable} />
    </div>
  );
};
