import { type EmailOtpType } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function safeNextPath(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const successUrl = new URL(safeNextPath(searchParams.get("next")), request.url);
  const errorUrl = new URL("/login", request.url);

  // A route-handler response is deliberately created first so the SSR client
  // can attach the new auth cookies to the same response that redirects home.
  const response = NextResponse.redirect(successUrl);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const error = code
    ? (await supabase.auth.exchangeCodeForSession(code)).error
    : tokenHash && type
      ? (await supabase.auth.verifyOtp({ type, token_hash: tokenHash })).error
      : new Error("This confirmation link is missing a valid code.");

  if (error) {
    errorUrl.searchParams.set("error", "That confirmation link is invalid or has expired. Request a fresh one and try again.");
    return NextResponse.redirect(errorUrl);
  }

  return response;
}
