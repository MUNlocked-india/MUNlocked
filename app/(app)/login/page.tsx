import Link from "next/link";
import Image from "next/image";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap" style={{ flexDirection: "column", gap: 22 }}>
      <Image src="/logo.png" alt="MUNlocked" width={72} height={65} style={{ objectFit: "contain" }} priority />
      <form action={loginAction} className="auth-card">
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/ACCESS
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, marginBottom: 20 }}>
          Welcome Back
        </h1>

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
    </div>
  );
}
