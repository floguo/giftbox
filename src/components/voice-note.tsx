import { Pause, Play } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

interface VoiceNoteProps {
  audioUrl: string;
}

export const VoiceNote: React.FC<VoiceNoteProps> = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const context = new (window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).webkitAudioContext)();
    setAudioContext(context);

    const loadAudio = async () => {
      try {
        // Fetch the audio file from the URL without specific headers
        const response = await fetch(audioUrl);

        if (!response.ok) {
          throw new Error("Failed to fetch audio");
        }

        // Convert the response to ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();

        if (!arrayBuffer || arrayBuffer.byteLength === 0) {
          throw new Error("Empty audio data received");
        }

        try {
          // Decode the audio data with promise-based approach
          const buffer = await new Promise<AudioBuffer>((resolve, reject) => {
            context.decodeAudioData(
              arrayBuffer,
              (decodedBuffer) => resolve(decodedBuffer),
              (err) =>
                reject(new Error(err?.message || "Failed to decode audio"))
            );
          });

          setAudioBuffer(buffer);
          setDuration(buffer.duration);
          setError(null);
          drawWaveform(buffer);
        } catch (decodeError) {
          console.error("Decode error:", decodeError);
          setError(
            "Unable to decode audio data. Please check the file format."
          );
        }
      } catch (error) {
        console.error("Error loading audio data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load audio"
        );
      }
    };

    loadAudio();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
      }
      context.close();
    };
  }, [audioUrl]);

  const drawWaveform = useCallback(
    (buffer?: AudioBuffer | null) => {
      const canvas = canvasRef.current;
      if (!canvas || !buffer) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const data = buffer.getChannelData(0);
      const step = Math.ceil(data.length / width);
      const amp = height / 2;

      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      ctx.moveTo(0, amp);

      // Draw the waveform
      for (let i = 0; i < width; i++) {
        let min = 1.0;
        let max = -1.0;

        for (let j = 0; j < step; j++) {
          const datum = data[i * step + j];
          if (datum < min) min = datum;
          if (datum > max) max = datum;
        }

        // Calculate progress for gradient
        const progress = currentTime / duration;
        const x = i;

        ctx.fillStyle = i / width <= progress ? "#EC4899" : "#E5E7EB";
        ctx.fillRect(x, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
      }
    },
    [currentTime, duration]
  );

  useEffect(() => {
    drawWaveform(audioBuffer);
  }, [currentTime, audioBuffer, drawWaveform]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const updatePlaybackTime = useCallback(() => {
    if (!audioContext || !startTimeRef.current) return;

    setCurrentTime(audioContext.currentTime - startTimeRef.current);
    animationFrameRef.current = requestAnimationFrame(updatePlaybackTime);
  }, [audioContext]);

  const togglePlayPause = async () => {
    if (!audioContext || !audioBuffer) return;

    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    } else {
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      sourceNodeRef.current = source;

      startTimeRef.current = audioContext.currentTime - currentTime;
      source.start(0, currentTime);
      setIsPlaying(true);

      source.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      updatePlaybackTime();
    }
  };

  return (
    <div className="bg-white rounded-full shadow-lg hover:shadow-2xl p-3 flex items-center gap-4 border-stone-300 w-[300px] z-50">
      <button
        onClick={togglePlayPause}
        disabled={!!error || !audioBuffer}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
          ${
            isPlaying
              ? "bg-pink-500 text-white hover:bg-pink-600"
              : "bg-pink-500 text-white hover:bg-pink-600"
          }
          ${!!error || !audioBuffer ? "opacity-50 cursor-not-allowed" : ""}
          `}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>

      <div className="flex-1">
        {error ? (
          <div className="text-sm text-red-500 px-2">{error}</div>
        ) : (
          <canvas ref={canvasRef} width={160} height={40} className="w-full" />
        )}
      </div>

      <div className="text-sm text-gray-500 p-2 tabular-nums">
        {formatTime(duration)}
      </div>
    </div>
  );
};
