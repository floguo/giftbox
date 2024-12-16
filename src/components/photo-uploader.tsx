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
import React, { useRef } from "react";
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

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
          },
          "image/jpeg",
          0.8
        );
      });

      // Create a File object from the blob
      const file = new File([blob], `camera-capture-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      // Upload the file using the same mutation as file upload
      const photoUrl = (await uploadPhoto.mutateAsync(file)).url;
      onPhotoAdd(photoUrl);

      // Cleanup
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add a photo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
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
