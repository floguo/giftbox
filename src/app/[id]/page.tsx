import { getCanvasState } from "@/lib/action";
import InnerComponent from "./InnerComponent";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    isEditable?: string;
    letterShown?: string;
  }>;
}) {
  const id = (await params).id;
  if (!id) throw new Error("No id provided");
  const { isEditable, letterShown } = await searchParams;
  const restoredState = await getCanvasState(id);
  return (
    <InnerComponent
      id={id}
      restoredState={restoredState}
      isEditable={isEditable ? isEditable === "true" : true}
      letterShown={letterShown ? letterShown === "true" : false}
    />
  );
}
