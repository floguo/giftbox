"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";
import { AlertCircle, Loader2, Mic, Play, Square } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAppContext } from "./AppContext";
import { WaveformVisualizer } from "./waveform-visualizer";

interface VoiceRecorderProps {
  onClose: () => void;
  onVoiceAdd: (voiceUrl: string) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onClose,
  onVoiceAdd,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [sourceNode, setSourceNode] = useState<
    MediaStreamAudioSourceNode | AudioBufferSourceNode | null
  >(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { giftId } = useAppContext();

  const uploadVoice = useMutation({
    mutationFn: async (audioBlob: Blob) => {
      const fileName = `voice-${Date.now()}.wav`;
      const response = await upload(`${giftId}/${fileName}`, audioBlob, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      return response;
    },
  });

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const newAudioContext = new AudioContext();
      const newSourceNode = newAudioContext.createMediaStreamSource(stream);
      setAudioContext(newAudioContext);
      setSourceNode(newSourceNode);

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Error accessing microphone. Please check your permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (audioBlob && audioContext) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          setSourceNode(source);
          source.start(0);
          source.onended = () => setSourceNode(null);
        } catch (error) {
          console.error("Error playing audio:", error);
          setError("Error playing audio. Please try again.");
        }
      };
      reader.readAsArrayBuffer(audioBlob);
    }
  }, [audioBlob, audioContext]);

  const handleVoiceAdd = async (audioBlob: Blob) => {
    try {
      const response = await uploadVoice.mutateAsync(audioBlob);
      onVoiceAdd(response.url);
      onClose();
    } catch (error) {
      console.error("Error uploading voice note:", error);
      setError("Error uploading voice note. Please try again.");
    }
  };

  useEffect(() => {
    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [audioContext]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Voice Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <WaveformVisualizer
            audioContext={audioContext}
            sourceNode={sourceNode}
            isRecording={isRecording}
          />
          <div className="flex justify-between">
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : "default"}
            >
              {isRecording ? (
                <Square className="mr-2" />
              ) : (
                <Mic className="mr-2" />
              )}
              {isRecording ? "Stop Recording" : "Start Recording"}
            </Button>
            <Button onClick={playRecording} disabled={!audioBlob}>
              <Play className="mr-2" />
              Play Recording
            </Button>
          </div>
          {audioBlob && (
            <Button
              onClick={() => handleVoiceAdd(audioBlob)}
              disabled={uploadVoice.isPending}
            >
              {uploadVoice.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Add Voice Note"
              )}
            </Button>
          )}
          {error && (
            <div className="p-2 bg-red-100 text-red-700 rounded-md flex items-center">
              <AlertCircle className="mr-2" />
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
