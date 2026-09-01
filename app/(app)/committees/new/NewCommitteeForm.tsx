"use client";

import { useState } from "react";

const PRESETS = [
  { code: "UNSC", name: "United Nations Security Council" },
  { code: "DISEC", name: "Disarmament & International Security Committee" },
  { code: "UNHRC", name: "UN Human Rights Council" },
  { code: "ECOSOC", name: "Economic and Social Council" },
  { code: "UNEP", name: "UN Environment Programme" },
  { code: "WHO", name: "World Health Organization" },
];

export default function NewCommitteeForm({
  createCommittee,
  errorMessage,
}: {
  createCommittee: (formData: FormData) => void;
  errorMessage?: string;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");

  return (
    <form action={createCommittee} className="auth-card" style={{ maxWidth: 460 }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
        File No. IN/MUN/COMMITTEE-NEW
      </div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 6 }}>Create a Committee</h1>
      <p style={{ fontSize: 13, color: "rgba(7,7,7,0.6)", marginBottom: 18 }}>
        You&apos;ll be the chair. Add co-chairs and build the roster on the next screen.
      </p>

      {errorMessage && <p className="error-text">Error: {errorMessage}</p>}

      <label>Quick Presets</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {PRESETS.map((p) => (
          <button
            key={p.code}
            type="button"
            className="mono"
            onClick={() => {
              setCode(p.code);
              setName(p.name);
            }}
            style={{ fontSize: 11, border: "1px solid rgba(7,7,7,0.25)", background: "none", padding: "6px 10px", borderRadius: 20, cursor: "pointer", color: "rgba(7,7,7,0.7)" }}
          >
            {p.code}
          </button>
        ))}
      </div>

      <label htmlFor="code">Committee Code</label>
      <input id="code" name="code" type="text" required placeholder="e.g. HRC" value={code} onChange={(e) => setCode(e.target.value)} />

      <label htmlFor="name">Full Committee Name</label>
      <input id="name" name="name" type="text" required placeholder="e.g. Human Rights Council" value={name} onChange={(e) => setName(e.target.value)} />

      <label htmlFor="conference_name">Conference (optional)</label>
      <input id="conference_name" name="conference_name" type="text" placeholder="e.g. Aethris MUN 2026" />

      <label style={{ display: "flex", gap: 9, alignItems: "center", marginBottom: 18, textTransform: "none", letterSpacing: 0, fontSize: 13 }}>
        <input type="checkbox" name="sis_marksheet" defaultChecked />
        Use the SIS/HCC marksheet preset (GSL, MOD 1/2, POI, chits, documentation, decorum, awards)
      </label>

      <button type="submit" className="submit">Create Committee</button>
    </form>
  );
}
