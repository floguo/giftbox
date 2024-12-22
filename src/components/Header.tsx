import { createId } from "@paralleldrive/cuid2";
import { useRouter } from "next/navigation";
import { useAppContext } from "./AppContext";
import Share from "./share-menu";
import { Button } from "./ui/button";

export const Header = () => {
  const { isEditable } = useAppContext();
  const router = useRouter();
  return (
    <div className="w-full p-4 flex justify-between items-center absolute top-0 left-0 z-30">
      <Button
        size="sm"
        onClick={() => {
          const id = createId();
          router.push(`/${id}?letterShown=true`);
        }}
      >
        +
      </Button>
      {isEditable && <Share />}
    </div>
  );
};
