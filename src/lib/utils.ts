import { createId } from "@paralleldrive/cuid2";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateNewId() {
  const id = createId();
  window.localStorage.setItem(`${id}_letter_showed`, "true");
  return id;
}
