"use client";

import { saveCanvasState, savedState } from "@/lib/action";
import {
  DEFAULT_LETTER_MESSAGE,
  DEFAULT_LETTER_SIGNATURE,
  DEFAULT_LETTER_TO,
} from "@/lib/constant";
import { LetterItem } from "@/lib/type";
import { useMutation } from "@tanstack/react-query";
import { createContext, ReactNode, useContext, useState } from "react";
import { useDebounce } from "react-use";

type ContextValue = ReturnType<typeof useInternalGetAppContext>;

const AppContext = createContext<ContextValue | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
};

export const AppContextProvider = ({
  children,
  giftId,
  restoredState,
  useLocalStorage,
  isEditable,
}: {
  children: ReactNode;
  giftId: string;
  restoredState: savedState | null;
  useLocalStorage: {
    isLetterShowed: boolean | undefined;
    setIsLetterShowed: (value: boolean) => void;
    removeIsLetterShowed: () => void;
  };
  isEditable: boolean;
}) => {
  const value = useInternalGetAppContext(
    giftId,
    restoredState,
    useLocalStorage,
    isEditable
  );
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

function useInternalGetAppContext(
  giftId: string,
  restoredState: savedState | null,
  useLocalStorage: {
    isLetterShowed: boolean | undefined;
    setIsLetterShowed: (value: boolean) => void;
    removeIsLetterShowed: () => void;
  },
  isEditable: boolean
) {
  const [items, setItems] = useState<LetterItem[]>(restoredState?.items ?? []);
  const [letter, setLetter] = useState(
    restoredState?.letter ?? {
      to: DEFAULT_LETTER_TO,
      from: DEFAULT_LETTER_SIGNATURE,
      message: DEFAULT_LETTER_MESSAGE,
    }
  );

  const saveCanvas = useMutation({
    mutationFn: async (newState: Partial<savedState>) => {
      return saveCanvasState(giftId, {
        items: newState.items ?? items,
        letter: newState.letter ?? letter,
      });
    },
    onSuccess: (data: savedState) => {
      setItems(data.items);
      setLetter(data.letter);
    },
  });

  const [, cancel] = useDebounce(
    async () => {
      cancel();
      console.log("saving a new state in redis for", giftId, items);
      await saveCanvas.mutateAsync({ items });
    },
    1000,
    [items]
  );

  const value = {
    items,
    setItems,
    letter,
    setLetter,
    giftId,
    saveCanvas,
    isLetterShowed: useLocalStorage.isLetterShowed,
    setIsLetterShowed: useLocalStorage.setIsLetterShowed,
    removeIsLetterShowed: useLocalStorage.removeIsLetterShowed,
    isEditable,
  } as const;

  return value;
}
