import type { Metadata } from "next";
import AboutRace from "@/components/AboutRace";

export const metadata: Metadata = {
  title: "Why MUNlocked Exists",
  description: "Follow the MUNlocked circuit through five problems we are designing out of the MUN experience.",
};

export default function AboutPage() {
  return <AboutRace />;
}
