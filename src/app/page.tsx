"use client";

import { generateNewId } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    const id = generateNewId();
    router.push(`/${id}`);
  }, []);

  return <></>;
}
