import { getCanvasState } from "@/lib/action";
import InnerComponent from "./InnerComponent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const baseUrl = `https://friendsgift.ing`;
  const id = (await params).id;
  if (!id) throw new Error("No id provided");
  const session = await getCanvasState(id);

  const customTitle = session?.letter?.from
    ? `${session.letter.from} has a gift for you!`
    : "Your friend has a gift for you!";

  return {
    title: "Friendsgifting",
    description: customTitle,
    openGraph: {
      title: `Friendsgifting`,
      description: customTitle,
      url: `${baseUrl}/${id}`,
      type: "website",
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(customTitle)}`],
      logo: `${baseUrl}/logo.png`,
    },
    twitter: {
      card: "summary_large_image",
      title: `Friendsgifting`,
      description: customTitle,
      images: [`${baseUrl}/api/og?title=${encodeURIComponent(customTitle)}`],
    },
  };
}

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
