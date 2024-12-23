import { generateNewId } from "@/lib/utils";
import { MailOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppContext } from "./AppContext";
import Share from "./share-menu";
import { Button } from "./ui/button";

export const Header = () => {
  const { isEditable, removeIsLetterShowed } = useAppContext();
  const router = useRouter();
  return (
    <div className="w-full p-4 flex justify-between items-center absolute top-0 left-0 z-30">
      <Button
        size="sm"
        onClick={() => {
          const id = generateNewId();
          router.push(`/${id}`);
        }}
      >
        +
      </Button>
      <div className="flex gap-2 items-center flex-row">
        <Button
          size="sm"
          onClick={() => {
            removeIsLetterShowed();
          }}
        >
          <MailOpen className="w-4 h-4" />
        </Button>
        {isEditable && <Share />}
      </div>
    </div>
  );
};
