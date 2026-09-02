import "server-only";
import type { CommitteeFeed, CommitteeProfile } from "@/lib/committee-data";

export type CommitteeUpdate = { title: string; url: string; publishedAt: string; source: string; direct: boolean };
type FeedItem = Omit<CommitteeUpdate, "direct"> & { description: string };
type FeedConfig = { url: string; source: string; baseUrl: string; allowedHosts: string[] };

const FEEDS: Record<CommitteeFeed, FeedConfig[]> = {
  "un-geneva": [
    { url: "https://www.ungeneva.org/news-media/meeting-summaries-list/rss.xml", source: "UN Geneva", baseUrl: "https://www.ungeneva.org", allowedHosts: ["www.ungeneva.org"] },
    { url: "https://www.ungeneva.org/news-media/press-items-list/rss.xml", source: "UN Geneva", baseUrl: "https://www.ungeneva.org", allowedHosts: ["www.ungeneva.org"] },
  ],
  "un-news": [
    { url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml", source: "UN News", baseUrl: "https://news.un.org", allowedHosts: ["news.un.org"] },
  ],
  who: [
    { url: "https://www.who.int/rss-feeds/news-english.xml", source: "World Health Organization", baseUrl: "https://www.who.int", allowedHosts: ["www.who.int", "who.int"] },
  ],
  india: [
    { url: "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", source: "Press Information Bureau, India", baseUrl: "https://www.pib.gov.in", allowedHosts: ["pib.gov.in", "www.pib.gov.in", "static.pib.gov.in"] },
  ],
};

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x2F;/gi, "/")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string) {
  return decodeXml(block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"))?.[1] ?? "");
}

function safeLink(rawLink: string, feed: FeedConfig) {
  try {
    const url = new URL(rawLink, feed.baseUrl);
    return url.protocol === "https:" && feed.allowedHosts.includes(url.hostname) ? url.toString() : "";
  } catch {
    return "";
  }
}

async function readFeed(feed: FeedConfig): Promise<FeedItem[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "MUNlocked Committee Intelligence/1.0" },
    next: { revalidate: 3600 },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`${feed.source} feed returned ${response.status}`);
  const xml = await response.text();
  const blocks = [...xml.matchAll(/<(?:item|entry)(?:\s[^>]*)?>([\s\S]*?)<\/(?:item|entry)>/gi)];

  return blocks.map((match) => {
    const rawLink = tag(match[1], "link") || tag(match[1], "guid") || match[1].match(/<link[^>]+href=["']([^"']+)["']/i)?.[1] || "";
    const url = safeLink(rawLink, feed);
    const publishedAt = tag(match[1], "pubDate") || tag(match[1], "published") || tag(match[1], "updated") || tag(match[1], "dc:date");
    return { title: tag(match[1], "title"), url, publishedAt, description: tag(match[1], "description") || tag(match[1], "summary"), source: feed.source };
  }).filter((item) => Boolean(item.title && item.url));
}

export async function getCommitteeUpdates(committees: CommitteeProfile[]) {
  const requestedGroups = [...new Set(committees.flatMap((committee) => committee.feedGroups))];
  const requestedFeeds = requestedGroups.flatMap((group) => FEEDS[group].map((feed) => ({ group, feed })));
  const settled = await Promise.allSettled(requestedFeeds.map(async ({ group, feed }) => ({ group, items: await readFeed(feed) })));
  const byGroup = new Map<CommitteeFeed, FeedItem[]>();

  for (const result of settled) {
    if (result.status !== "fulfilled") continue;
    const current = byGroup.get(result.value.group) ?? [];
    current.push(...result.value.items);
    byGroup.set(result.value.group, current);
  }

  return Object.fromEntries(committees.map((committee) => {
    const seen = new Set<string>();
    const available = committee.feedGroups
      .flatMap((group) => byGroup.get(group) ?? [])
      .filter((item) => !seen.has(item.url) && seen.add(item.url))
      .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0));
    const matched = available.filter((item) => {
      const searchable = `${item.title} ${item.description}`.toLowerCase();
      return committee.keywords.some((keyword) => searchable.includes(keyword));
    }).slice(0, 3);
    const selected = matched.length ? matched : available.slice(0, 3);

    return [committee.code, selected.map((item) => ({
      title: item.title,
      url: item.url,
      publishedAt: Number.isFinite(Date.parse(item.publishedAt)) ? item.publishedAt : "",
      source: item.source,
      direct: matched.length > 0,
    })) satisfies CommitteeUpdate[]];
  })) as Record<string, CommitteeUpdate[]>;
}
