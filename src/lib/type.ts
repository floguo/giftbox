export interface LetterItem {
  id: string;
  type: "photo" | "note" | "voice" | "spotify" | "doodle";
  content: string | Blob;
  position: { x: number; y: number };
  rotation: number;
  scale?: number;
  color?: string;
  caption?: string;
}
