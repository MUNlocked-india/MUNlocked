import type { Metadata } from "next";
import FounderStory from "@/components/FounderStory";

export const metadata: Metadata = {
  title: "Rishi Sahni — Founder of MUNlocked",
  description: "Meet Rishi Sahni and read the story, principles and purpose behind MUNlocked.",
};

export default function FounderPage() {
  return <FounderStory />;
}
