import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useMutation } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";
import { Eraser, Pencil } from "lucide-react";
import React, { useRef, useState } from "react";
import { useAppContext } from "./AppContext";

interface DoodleDrawerProps {
  onClose: () => void;
  onDoodleAdd: (doodleUrl: string) => void;
}

const colors = [
  "#000000", // Black
  "#4B5563", // Gray
  "#EF4444", // Red
  "#F59E0B", // Orange
  "#10B981", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
];

export const DoodleDrawer: React.FC<DoodleDrawerProps> = ({
  onClose,
  onDoodleAdd,
}) => {
  const { giftId } = useAppContext();
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [isErasing, setIsErasing] = useState(false);
  const [paths, setPaths] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<string>("");
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  const getCoordinates = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;
    const transformedPoint = point.matrixTransform(
      svg.getScreenCTM()?.inverse()
    );

    return {
      x: transformedPoint.x,
      y: transformedPoint.y,
    };
  };

  const startDrawing = (e: React.MouseEvent<SVGSVGElement>) => {
    const point = getCoordinates(e);
    pointsRef.current = [point];
    setCurrentPath(`M ${point.x} ${point.y}`);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing) return;

    const point = getCoordinates(e);
    pointsRef.current.push(point);

    if (pointsRef.current.length > 3) {
      const points = pointsRef.current;
      const lastPoint = points[points.length - 1];
      const controlPoint = points[points.length - 2];
      const endPoint = {
        x: (controlPoint.x + lastPoint.x) / 2,
        y: (controlPoint.y + lastPoint.y) / 2,
      };

      setCurrentPath(
        (prev) =>
          `${prev} Q ${controlPoint.x} ${controlPoint.y}, ${endPoint.x} ${endPoint.y}`
      );
    }
  };

  const stopDrawing = () => {
    if (currentPath) {
      setPaths((prev) => [...prev, currentPath]);
      setCurrentPath("");
    }
    setIsDrawing(false);
    pointsRef.current = [];
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath("");
  };

  const saveDoodle = useMutation({
    mutationFn: async () => {
      const svg = svgRef.current;
      if (!svg) throw new Error("SVG ref is null");

      // Target dimensions (max size in the letter canvas)
      const TARGET_SIZE = 192;
      const viewBox = svg.viewBox.baseVal;
      const aspectRatio = viewBox.width / viewBox.height;

      // Calculate dimensions that maintain aspect ratio within TARGET_SIZE
      let width, height;
      if (aspectRatio > 1) {
        // Wider than tall
        width = TARGET_SIZE;
        height = TARGET_SIZE / aspectRatio;
      } else {
        // Taller than wide
        height = TARGET_SIZE;
        width = TARGET_SIZE * aspectRatio;
      }

      // Create a canvas element with the calculated dimensions
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Failed to get canvas context");

      // Create a Blob from the SVG with correct viewBox
      const svgData = `
        <svg width="${width}" height="${height}" 
             viewBox="${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}"
             xmlns="http://www.w3.org/2000/svg">
          ${svg.innerHTML}
        </svg>
      `;
      const svgBlob = new Blob([svgData], { type: "image/svg+xml" });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image from the SVG and draw it to canvas
      const img = new Image();
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = svgUrl;
      });

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to PNG blob
      const pngBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/png");
      });

      if (!pngBlob) {
        throw new Error("Failed to create PNG blob");
      }

      const file = new File([pngBlob], `doodle-${Date.now()}.png`, {
        type: "image/png",
      });

      // Upload the file
      const response = await upload(`${giftId}/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
      });

      URL.revokeObjectURL(svgUrl);
      return response.url;
    },
    onSuccess: (url: string) => {
      if (url) {
        onDoodleAdd(url);
        onClose();
      }
    },
    onError: (error) => {
      console.error("Error uploading doodle:", error);
    },
  });

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Draw a doodle</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="w-full aspect-[4/3] bg-white rounded-xl border-2 border-stone-200">
            <svg
              ref={svgRef}
              className="w-full h-full cursor-crosshair"
              viewBox="0 0 400 300"
              preserveAspectRatio="xMidYMid meet"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            >
              {paths.map((path, i) => (
                <path
                  key={i}
                  d={path}
                  stroke={isErasing ? "white" : color}
                  strokeWidth={lineWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath && (
                <path
                  d={currentPath}
                  stroke={isErasing ? "white" : color}
                  strokeWidth={lineWidth}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>
          </div>
          <div className="flex gap-4 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <div className="relative w-10 h-10 group cursor-pointer">
                  <div
                    className="w-10 h-10 rounded-full border-2 border-stone-200 transition-transform group-hover:scale-110 shadow-sm"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" sideOffset={5}>
                <div className="grid grid-cols-4 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                        c === color ? "border-stone-900" : "border-stone-200"
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            <div className="relative w-32 group">
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-stone-100 rounded-full appearance-none cursor-pointer accent-stone-900 hover:accent-stone-700"
              />
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white px-2 py-1 rounded text-xs">
                {lineWidth}px
              </div>
            </div>
            <Button
              variant={isErasing ? "secondary" : "outline"}
              size="icon"
              onClick={() => setIsErasing(!isErasing)}
            >
              {isErasing ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Eraser className="h-4 w-4" />
              )}
            </Button>
            <Button onClick={clearCanvas} variant="outline">
              Clear
            </Button>
          </div>
          <Button
            onClick={() => saveDoodle.mutate()}
            disabled={saveDoodle.isPending}
          >
            {saveDoodle.isPending ? "Saving..." : "Add Doodle"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
