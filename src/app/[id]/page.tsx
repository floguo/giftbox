import { getCanvasState } from "@/lib/action";
import InnerComponent from "./InnerComponent";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ to: string; from: string; isEditable?: string }>;
}) {
  const id = (await params).id;
  if (!id) throw new Error("No id provided");
  const { to, from, isEditable } = await searchParams;
  const restoredState = await getCanvasState(id);
  return (
    <InnerComponent
      id={id}
      restoredState={restoredState}
      to={to}
      from={from}
      isEditable={isEditable ? isEditable === "true" : true}
    />
  );
}
