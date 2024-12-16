"use server";

import { redis } from "@/lib/storage";
import { LetterItem } from "@/lib/type";

export async function saveCanvasState(giftId: string, items: LetterItem[]) {
  try {
    if (!giftId || !items) {
      throw new Error("Missing required fields");
    }

    console.log("saving new state to", `canvas:${giftId}`);

    await redis.set(`canvas:${giftId}`, JSON.stringify(items));
    return { success: true };
  } catch (error) {
    console.error("Failed to save canvas state:", error);
    throw new Error("Failed to save canvas state");
  }
}

export async function getCanvasState(giftId: string) {
  try {
    if (!giftId) {
      throw new Error("Missing giftId parameter");
    }

    console.log("restoring state from", `canvas:${giftId}`);

    const items = await redis.get<LetterItem[]>(`canvas:${giftId}`);
    console.log("restored state", items);
    return items;
  } catch (error) {
    console.error("Failed to fetch canvas state:", error);
    throw new Error("Failed to fetch canvas state");
  }
}
