import React from "react";
import { CD } from "./cd";
import { Microphone } from "./microphone";
import { NotePaper } from "./note-paper";
import { Pencil } from "./pencil";
import { Polaroid } from "./polaroid";

interface ToolbarProps {
  onAddPhoto: () => void;
  onAddNote: (color: string) => void;
  onRecordVoice: () => void;
  onAddSpotify: (url: string) => void;
  onAddDoodle: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddPhoto,
  onAddNote,
  onRecordVoice,
  onAddSpotify,
  onAddDoodle,
}) => {
  return (
    <div className="pt-20 mx-auto w-full max-w-4xl overflow-x-auto overflow-y-hidden px-4 pb-0 mb-4">
      <div className="bg-white rounded-2xl h-40 px-4 sm:px-12 relative flex justify-start gap-12 md:justify-between items-end min-w-max mx-4">
        <div className="-mt-20">
          <Polaroid onClick={onAddPhoto} />
        </div>
        <div className="-mt-20">
          <NotePaper onAddNote={onAddNote} />
        </div>
        <div className="-mt-20">
          <Microphone onClick={onRecordVoice} />
        </div>
        <div className="-mt-20">
          <CD onAddSpotify={onAddSpotify} />
        </div>
        <div className="-mt-20">
          <Pencil onClick={onAddDoodle} />
        </div>
      </div>
    </div>
  );
};
