"use client";

import { saveCanvasState } from "@/lib/action";
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
}: {
  children: ReactNode;
  giftId: string;
  restoredState: LetterItem[] | null;
}) => {
  const value = useInternalGetAppContext(giftId, restoredState);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

function useInternalGetAppContext(
  giftId: string,
  restoredState: LetterItem[] | null
) {
  const [items, setItems] = useState<LetterItem[]>(restoredState ?? []);

  const saveCanvas = useMutation({
    mutationFn: async (items: LetterItem[]) => {
      return saveCanvasState(giftId, items);
    },
    onSuccess: () => {},
  });

  const [, cancel] = useDebounce(
    async () => {
      cancel();
      console.log("saving a new state in redis for", giftId, items);
      await saveCanvas.mutateAsync(items);
    },
    1000,
    [items]
  );

  const value = {
    items,
    setItems,
    giftId,
    saveCanvas: {
      isPending: saveCanvas.isPending,
    },
  } as const;

  return value;
}
