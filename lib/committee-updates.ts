import "server-only";
import type { CommitteeProfile } from "@/lib/committee-data";

export type CommitteeUpdate = { title: string; url: string; publishedAt: string; source: string; direct: boolean };

const FEEDS = [
  "https://www.ungeneva.org/news-media/meeting-summaries-list/rss.xml",
  "https://www.ungeneva.org/news-media/press-items-list/rss.xml",
];

function decodeXml(value: string) {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
}

function tag(block: string, name: string) {
  return decodeXml(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "");
}

async function readFeed(url: string) {
  const response = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(6500) });
  if (!response.ok) throw new Error(`Official feed returned ${response.status}`);
  const xml = await response.text();
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map((match) => {
    const link = tag(match[1], "link");
    if (!link.startsWith("https://www.ungeneva.org/")) return null;
    return { title: tag(match[1], "title"), url: link, publishedAt: tag(match[1], "pubDate"), description: tag(match[1], "description") };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item?.title && item.url));
}

export async function getCommitteeUpdates(committees: CommitteeProfile[]) {
  const settled = await Promise.allSettled(FEEDS.map(readFeed));
  const latest = settled.flatMap((result) => result.status === "fulfilled" ? result.value : []).sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt)).slice(0, 20);
  return Object.fromEntries(committees.map((committee) => {
    const matched = latest.filter((item) => committee.keywords.some((keyword) => `${item.title} ${item.description}`.toLowerCase().includes(keyword))).slice(0, 3);
    const selected = matched.length ? matched : latest.slice(0, 3);
    return [committee.code, selected.map((item) => ({ title: item.title, url: item.url, publishedAt: item.publishedAt, source: "UN Geneva", direct: matched.length > 0 })) satisfies CommitteeUpdate[]];
  })) as Record<string, CommitteeUpdate[]>;
}
