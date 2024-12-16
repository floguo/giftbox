import { getCanvasState } from "@/lib/action";
import InnerComponent from "./InnerComponent";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;
  if (!id) throw new Error("No id provided");
  const restoredState = await getCanvasState(id);
  return <InnerComponent id={id} restoredState={restoredState} />;
}
