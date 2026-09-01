import Link from "next/link";
import "./landing.css";
import ColorBends from "@/components/ColorBends";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Reveal from "@/components/Reveal";
import BlurText from "@/components/BlurText";
import { createClient } from "@/lib/supabase/server";
import EbDepthCarousel, { type EbShowcaseItem } from "@/components/EbDepthCarousel";

const FEATURES = [
  { number: "01", title: "Find the right room", label: "Conference Directory", copy: "Dates, committees, fees and registration details in one clean record. Spend less time searching and more time preparing.", href: "/conferences", className: "feature-conference" },
  { number: "02", title: "Earn trust in public", label: "EB Marketplace", copy: "Real photos, real CVs, reviews and direct enquiries. Executive Boards get discovered through their work, not their circles.", href: "/hire-eb", className: "feature-eb" },
  { number: "03", title: "Walk in prepared", label: "Open Research", copy: "Background guides and articles stay free, credited and searchable so every delegate gets a serious first step.", href: "/research", className: "feature-research" },
  { number: "04", title: "Run the room live", label: "Digital Dais", copy: "A shared marksheet, award tracking and dual speech timers keep the whole dais on the same page.", href: "/committees", className: "feature-dais" },
];

export default async function Home() {
  const supabase = await createClient();
  const [{ count: confCount }, { count: ebCount }, { count: researchCount }, { data: latestResearch }, { data: latestEbs }] = await Promise.all([
    supabase.from("conferences").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("eb_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("research_papers").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("research_papers").select("id, title, committee, agenda, author_name").eq("status", "approved").order("created_at", { ascending: false }).limit(3),
    supabase.from("eb_applications").select("id, display_name, experience, areas_of_expertise, photo_path").eq("status", "approved").order("created_at", { ascending: false }).limit(3),
  ]);

  const featuredEbs: EbShowcaseItem[] = await Promise.all((latestEbs ?? []).map(async (eb) => {
    const photo = eb.photo_path ? await supabase.storage.from("eb-profiles").createSignedUrl(eb.photo_path, 600) : { data: null };
    return { id: eb.id, name: eb.display_name ?? "Executive Board", experience: eb.experience ?? "MUNlocked profile", expertise: eb.areas_of_expertise ?? [], photoUrl: photo.data?.signedUrl ?? null };
  }));

  return <main className="landing-page">
    <ColorBends className="color-bends-background" />
    <div className="landing-vignette" aria-hidden />
    <div className="landing-content">
      <div className="session-rail"><span><i /> India&apos;s MUN circuit, in session</span><span>Open access · Public records · Better rooms</span></div>
      <SiteHeader />

      <section className="lp-hero-v2">
        <div className="hero-copy-v2">
          <div className="hero-kicker"><span>Introducing MUNlocked</span><span>Est. 2026 · India</span></div>
          <h1><span>MUN.</span><em>Unlocked.</em></h1>
          <p className="hero-lede">The digital home for the people who make committee happen—from the first research tab to the final gavel.</p>
          <div className="hero-actions"><Link href="/signup" className="pill-primary">Enter the circuit <span>↗</span></Link><Link href="#platform" className="pill-secondary">See how it works <span>↓</span></Link></div>
          <div className="hero-proof"><span>Built for delegates</span><span>Built for chairs</span><span>Built for organisers</span></div>
        </div>
        <div className="hero-object" aria-label="MUNlocked platform preview">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-core"><span className="core-label">LIVE ECOSYSTEM</span><strong>M</strong><span className="core-status"><i /> All systems ready</span></div>
          <div className="float-card float-conference"><small>DISCOVER</small><b>Next committee</b><span>UNHRC · New Delhi</span></div>
          <div className="float-card float-research"><small>PREPARE</small><b>Research, open</b><span>Guides made to use</span></div>
          <div className="float-card float-dais"><small>RUN LIVE</small><b>01:30</b><span>Speaker clock</span></div>
          <div className="float-chip chip-one">POI ready</div><div className="float-chip chip-two">CV on record</div>
        </div>
      </section>

      <div className="kinetic-strip" aria-hidden><div>RESEARCH WITHOUT PAYWALLS · EBs WITHOUT GATEKEEPING · COMMITTEES WITHOUT CHAOS ·&nbsp;</div><div>RESEARCH WITHOUT PAYWALLS · EBs WITHOUT GATEKEEPING · COMMITTEES WITHOUT CHAOS ·&nbsp;</div></div>

      <section className="numbers-band">
        {[{ value: confCount ?? 0, label: "Conferences listed" }, { value: ebCount ?? 0, label: "EB profiles live" }, { value: researchCount ?? 0, label: "Open resources" }, { value: "24/7", label: "MUNlocked guidance" }].map((item) => <Reveal key={item.label}><div className="number-item"><strong>{item.value}</strong><span>{item.label}</span></div></Reveal>)}
      </section>

      <section id="platform" className="platform-section">
        <Reveal><div className="section-intro"><span className="section-index">01 / THE PLATFORM</span><BlurText as="h2" text="Everything the circuit was missing." /><p>Four connected tools. One public record. Less chaos between discovery, preparation and committee.</p></div></Reveal>
        <div className="feature-bento">{FEATURES.map((feature, index) => <Reveal key={feature.number} delay={index * 80}><Link href={feature.href} className={`feature-card ${feature.className}`}><div className="feature-top"><span>{feature.number}</span><span>{feature.label}</span><span>↗</span></div><div className="feature-visual" aria-hidden><span /><span /><span /></div><div><h3>{feature.title}</h3><p>{feature.copy}</p></div></Link></Reveal>)}</div>
      </section>

      <section className="story-section">
        <div className="story-sticky"><span className="section-index">02 / WHY IT EXISTS</span><h2>A better circuit is a design problem.</h2><p>Every feature removes one small piece of uncertainty from the room.</p></div>
        <div className="story-steps">
          {[['01','Discover without the group-chat maze.','Clear conference information makes access feel normal, not exclusive.'],['02','Prepare without paying to begin.','Open research gives first-timers the confidence to enter debate with substance.'],['03','Hire from evidence, not proximity.','Public EB profiles move opportunity toward credibility and real experience.'],['04','Chair from one source of truth.','Live scoring and timers let the dais focus on delegates instead of spreadsheet friction.'],['05','Leave with a record that lasts.','Messages, reviews, work and recognition stay attached to the people who earned them.']].map(([number,title,copy]) => <Reveal key={number}><article className="story-step"><span>{number}</span><h3>{title}</h3><p>{copy}</p></article></Reveal>)}
        </div>
      </section>

      <section className="live-section">
        <Reveal><div className="section-intro compact"><span className="section-index">03 / LIVE NOW</span><h2>The circuit, moving.</h2><p>Fresh work and discoverable people—not placeholder content.</p></div></Reveal>
        <div className="live-grid">
          <Reveal><div className="live-panel"><div className="live-panel-head"><span>Latest from the library</span><Link href="/research">View all ↗</Link></div>{latestResearch?.length ? <div className="research-stack">{latestResearch.map((paper, index) => <Link key={paper.id} href={`/research/${paper.id}`}><span>0{index + 1}</span><div><strong>{paper.title}</strong><small>{paper.committee} · {paper.agenda} · {paper.author_name}</small></div><b>↗</b></Link>)}</div> : <p className="empty-copy">The library is ready for its first published guide.</p>}</div></Reveal>
          <Reveal delay={100}><div className="live-panel"><div className="live-panel-head"><span>Executive Boards, on record</span><Link href="/hire-eb">Marketplace ↗</Link></div>{featuredEbs.length ? <EbDepthCarousel items={featuredEbs} /> : <p className="empty-copy">The marketplace is ready for its first profile.</p>}</div></Reveal>
        </div>
      </section>

      <section className="principles-section"><span className="section-index">04 / THE STANDARD</span><h2>Open by default.<br /><em>Serious by design.</em></h2><div className="principle-row">{[['01','No closed rooms','Opportunity should be visible.'],['02','Research stays free','Preparation should be accessible.'],['03','Records stay credible','Trust should be earned in public.']].map(([n,t,c]) => <div key={n}><span>{n}</span><h3>{t}</h3><p>{c}</p></div>)}</div></section>

      <section className="final-call"><div className="final-orb" aria-hidden /><span className="section-index">THE FLOOR IS OPEN</span><h2>Your next committee<br />starts here.</h2><p>Join the platform built to make the entire MUN journey clearer, fairer and much better looking.</p><div className="hero-actions"><Link href="/signup" className="pill-primary">Create your account <span>↗</span></Link><Link href="/conferences" className="pill-secondary">Explore conferences</Link></div></section>
      <SiteFooter />
    </div>
  </main>;
}
