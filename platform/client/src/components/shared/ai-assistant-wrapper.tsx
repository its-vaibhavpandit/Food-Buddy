"use client";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled for client-side loading
const DynamicAiAssistant = dynamic(
  () => import("./ai-assistant").then((mod) => mod.AiAssistant),
  { ssr: false }
);

export function AiAssistantWrapper() {
  return <DynamicAiAssistant />;
}
