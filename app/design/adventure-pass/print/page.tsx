import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { AdventurePass } from "@/components/adventure-pass/adventure-pass";
import { readAdventurePassRenderToken } from "@/lib/adventure-pass-token";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Adventure Pass",
};

export default async function AdventurePassPrintPage() {
  const token = (await headers()).get("x-asl-adventure-pass-render");
  const data = token ? readAdventurePassRenderToken(token) : null;
  if (!data) notFound();
  return (
    <main className="adventure-pass-page min-h-screen bg-white">
      <AdventurePass data={data} />
    </main>
  );
}
