import { useAppContext } from "./AppContext";
import { Button } from "./ui/button";

export const Header = () => {
  const { saveCanvas } = useAppContext();
  return (
    <div className="bg-white rounded-full h-10 pl-4 pr-1 relative flex justify-between items-center gap-4">
      <div className="flex items-center gap-2">
        {saveCanvas.isPending && (
          <span className="text-sm text-gray-500 animate-pulse">Saving...</span>
        )}
        {!saveCanvas.isPending && (
          <span className="text-sm text-gray-500">Saved</span>
        )}
      </div>

      <Button size="sm">Share</Button>
    </div>
  );
};
