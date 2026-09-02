import CommitteeCarousel from "@/components/CommitteeCarousel";
import { COMMITTEES } from "@/lib/committee-data";
import { getCommitteeUpdates } from "@/lib/committee-updates";

export const revalidate = 3600;

export default async function TopicsPage() {
  const updates = await getCommitteeUpdates(COMMITTEES);
  return <div style={{ minHeight: "100vh", padding: "clamp(54px,8vw,110px) 0 80px" }}>
    <header style={{ width: "min(960px,calc(100% - 40px))", margin: "0 auto clamp(38px,6vw,68px)", textAlign: "center" }}>
      <div className="mono" style={{ fontSize: 9, letterSpacing: 2.2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 18 }}>MUNLOCKED / COMMITTEE INTELLIGENCE</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(54px,8.5vw,116px)", lineHeight: .85, letterSpacing: "-.075em", textTransform: "uppercase" }}>Know the room<br />before you enter.</h1>
      <p style={{ color: "rgba(244,237,240,.57)", fontSize: 15, lineHeight: 1.65, maxWidth: 630, margin: "28px auto 0" }}>Open a committee file for its mandate, real scope of power and a live signal desk connected to official sources. Use the arrows, dots or your keyboard to explore.</p>
    </header>
    <CommitteeCarousel committees={COMMITTEES} updates={updates} />
  </div>;
}
