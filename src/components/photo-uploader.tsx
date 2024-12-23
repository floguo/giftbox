import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";
import { Camera, Loader2, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { useAppContext } from "./AppContext";

interface PhotoUploaderProps {
  onClose: () => void;
  onPhotoAdd: (photoUrl: string) => void;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  onClose,
  onPhotoAdd,
}) => {
  const { giftId } = useAppContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const fileName = `${Date.now()}-${file.name}`;
      const photoUrl = await upload(`${giftId}/${fileName}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });
      return photoUrl;
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const photoUrl = (await uploadPhoto.mutateAsync(file)).url;
      onPhotoAdd(photoUrl);
    } catch (error) {
      console.error("Error handling file:", error);
    }
  };

  const stopVideoStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setShowVideo(false);
  };

  const handleCameraCapture = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        fileInputRef.current?.click();
        return;
      }

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = streamRef.current;
        setShowVideo(true);
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      fileInputRef.current?.click();
    }
  };

  const capturePhoto = async () => {
    try {
      if (!videoRef.current || !streamRef.current) return;

      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create image blob"));
          },
          "image/jpeg",
          0.8
        );
      });

      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const photoUrl = (await uploadPhoto.mutateAsync(file)).url;
      onPhotoAdd(photoUrl);
      stopVideoStream();
    } catch (error) {
      console.error("Error capturing photo:", error);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      stopVideoStream();
    };
  }, []);

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          stopVideoStream();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a photo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {showVideo ? (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <Button
                variant="default"
                onClick={capturePhoto}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
              >
                Capture
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="light"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col gap-2 h-auto py-4 rounded-xl"
                disabled={uploadPhoto.isPending}
              >
                {uploadPhoto.isPending ? (
                  <Loader2 className="h-8 w-8 text-stone-400 animate-spin" />
                ) : (
                  <Upload className="h-8 w-8 text-stone-400" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    uploadPhoto.isPending && "text-stone-400"
                  )}
                >
                  Choose file
                </span>
              </Button>
              <Button
                variant="light"
                onClick={handleCameraCapture}
                className="flex flex-col gap-2 h-auto py-6 rounded-xl"
                disabled={uploadPhoto.isPending}
              >
                {uploadPhoto.isPending ? (
                  <Loader2 className="h-8 w-8 text-stone-400 animate-spin" />
                ) : (
                  <Camera className="h-8 w-8 text-stone-400" />
                )}
                <span
                  className={cn(
                    "text-sm",
                    uploadPhoto.isPending && "text-stone-400"
                  )}
                >
                  Take photo
                </span>
              </Button>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
