"use client";

const TEMPLATES = [
  {
    label: "Chair invitation",
    subject: "Chair invitation — [Conference name]",
    body: "Hello,\n\nI’m writing on behalf of [Conference name] to invite you to serve as [role] for [committee]. The conference is scheduled for [dates] in [city / online].\n\nYour experience in [area] stood out to us. The expected responsibilities and honorarium (if applicable) are [details].\n\nPlease let us know if you would be interested, and we can share the full briefing note.\n\nBest regards,\n[Your name]",
  },
  {
    label: "Availability check",
    subject: "Availability for [committee] — [Conference name]",
    body: "Hello,\n\nWe are finalising our Executive Board for [Conference name] and would love to know whether you are available for [role] in [committee] on [dates].\n\nCould you please share your availability and any committee preferences?\n\nRegards,\n[Your name]",
  },
  {
    label: "Dais collaboration",
    subject: "Dais collaboration inquiry — [Conference name]",
    body: "Hello,\n\nWe are assembling a balanced dais for [committee] at [Conference name]. Your profile looks like a strong fit alongside our proposed chairing team.\n\nThe conference will take place on [dates]. Would you be open to a short call to discuss the role, workflow and expectations?\n\nBest,\n[Your name]",
  },
];

export default function InquiryTemplates() {
  function useTemplate(subject: string, body: string) {
    const subjectInput = document.getElementById("subject") as HTMLInputElement | null;
    const bodyInput = document.getElementById("body") as HTMLTextAreaElement | null;
    if (subjectInput) subjectInput.value = subject;
    if (bodyInput) {
      bodyInput.value = body;
      bodyInput.dispatchEvent(new Event("input", { bubbles: true }));
      bodyInput.focus();
    }
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <p className="mono" style={{ fontSize: 10, letterSpacing: 1, color: "rgba(7,7,7,.58)", textTransform: "uppercase", marginBottom: 8 }}>
        Start with a template
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {TEMPLATES.map((template) => (
          <button
            key={template.label}
            type="button"
            onClick={() => useTemplate(template.subject, template.body)}
            className="mono"
            style={{ cursor: "pointer", border: "1px solid rgba(7,7,7,.22)", background: "transparent", color: "var(--ink)", borderRadius: 99, padding: "7px 10px", fontSize: 10, textTransform: "uppercase" }}
          >
            {template.label}
          </button>
        ))}
      </div>
    </div>
  );
}
