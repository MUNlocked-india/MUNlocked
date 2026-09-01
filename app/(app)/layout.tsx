import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function AppGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <SiteHeader />
      <div className="app-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
