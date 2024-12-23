"use client";

import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

interface SpotifyPlayerProps {
  spotifyUrl: string;
}

export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({ spotifyUrl }) => {
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOembed = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://open.spotify.com/oembed?url=${encodeURIComponent(
            spotifyUrl
          )}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch Spotify embed");
        }
        const data = await response.json();

        // Extract iframe src from HTML string
        const srcMatch = data.html.match(/src="([^"]+)"/);
        if (!srcMatch) throw new Error("Could not find iframe src");
        setIframeSrc(srcMatch[1]);
      } catch (err) {
        setError("Error loading Spotify embed");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOembed();
  }, [spotifyUrl]);

  if (isLoading) {
    return (
      <div className="bg-white p-4 shadow-md rounded-lg w-[300px] h-[152px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-4 shadow-md rounded-lg w-[300px] h-[152px] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 shadow-md rounded-lg w-[300px] transform-gpu">
      {iframeSrc && (
        <iframe
          src={iframeSrc}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      )}
    </div>
  );
};
