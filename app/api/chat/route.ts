import { NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are the MUNlocked Assistant, embedded on the MUNlocked website (India's Model United Nations platform). You help delegates, chairs, and first-timers understand Model UN: rules of procedure, points and motions (Point of Order, Point of Inquiry, Point of Personal Privilege, motions to caucus, etc.), how to write and deliver speeches (GSL, position papers), diplomacy and negotiation basics, and how to use MUNlocked itself (conference directory, Hire an EB, research library). Be concise, practical, and encouraging — many users are first-time delegates who feel intimidated. Use MUN vocabulary correctly and give concrete examples (e.g. sample phrasing for raising a point). Keep answers under ~150 words unless asked for more detail.`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to your environment variables." },
      { status: 500 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages provided." }, { status: 400 });
  }
  // Basic guardrails: cap history length and message size so one client
  // can't run up an unbounded bill against your key.
  const trimmed = messages.slice(-20).map((m) => ({
    role: m.role,
    content: String(m.content).slice(0, 4000),
  }));

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${errText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply =
      (data.content || [])
        .map((block: { text?: string }) => block.text || "")
        .filter(Boolean)
        .join("\n") || "Sorry, I couldn't process that — try asking again.";

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "Failed to reach the Anthropic API." },
      { status: 502 }
    );
  }
}
