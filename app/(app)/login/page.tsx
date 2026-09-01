import Link from "next/link";
import Image from "next/image";
import { loginAction, resendConfirmationAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; resent?: string }>;
}) {
  const params = await searchParams;
  const isUnconfirmed = params.error?.toLowerCase().includes("confirm");

  return (
    <div className="auth-wrap" style={{ padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 920, display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(320px,420px)", gap: 48, alignItems: "center" }}>
      <div style={{ color: "var(--ink)" }}>
        <Image src="/logo.png" alt="MUNlocked" width={72} height={65} style={{ objectFit: "contain", marginBottom: 24 }} priority />
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--mauve)", textTransform: "uppercase", marginBottom: 12 }}>Your next committee starts here</div>
        <h1 style={{ fontFamily: "Anton, sans-serif", fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(38px,5vw,64px)", lineHeight: .95, marginBottom: 18 }}>Enter the<br />MUNlocked circuit.</h1>
        <p style={{ maxWidth: 410, fontSize: 15, lineHeight: 1.7, color: "rgba(7,7,7,.68)" }}>Find verified conferences, speak with Executive Boards, build research, and run a committee from one place.</p>
      </div>
      <div>
      <form action={loginAction} className="auth-card" style={{ boxShadow: "10px 12px 0 rgba(156,110,130,.24)" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/ACCESS
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, marginBottom: 20 }}>
          Welcome Back
        </h1>

        {params.resent && <p className="success-text">Confirmation email resent — check your inbox.</p>}
        {params.error && <p className="error-text">{params.error}</p>}

        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />

        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />

        <button type="submit" className="submit">Log In</button>

        <p className="mono" style={{ fontSize: 11, textAlign: "center", marginTop: 16, color: "rgba(7,7,7,0.5)" }}>
          New here? <Link href="/signup" style={{ textDecoration: "underline" }}>Create an account</Link>
        </p>
      </form>

      {isUnconfirmed && (
        <form action={resendConfirmationAction} className="auth-card" style={{ maxWidth: 420, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(7,7,7,0.7)", marginBottom: 14 }}>
            Your account exists but the email isn&apos;t confirmed yet. Enter it again below to resend the confirmation link.
          </p>
          <input name="email" type="email" required placeholder="you@school.edu" />
          <button type="submit" className="submit">Resend Confirmation Email</button>
        </form>
      )}
      </div></div>
    </div>
  );
}
