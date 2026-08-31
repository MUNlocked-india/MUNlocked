"use client";

export default function RenameColumnInput({
  action,
  columnId,
  defaultLabel,
}: {
  action: (formData: FormData) => void;
  columnId: string;
  defaultLabel: string;
}) {
  return (
    <form action={action} style={{ display: "flex", flex: 1 }}>
      <input type="hidden" name="column_id" value={columnId} />
      <input
        type="text"
        name="label"
        defaultValue={defaultLabel}
        onBlur={(e) => e.currentTarget.form?.requestSubmit()}
        style={{
          background: "transparent",
          border: "none",
          color: "rgba(234,217,222,0.5)",
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 10.5,
          textTransform: "uppercase",
          width: "100%",
          padding: 0,
        }}
      />
    </form>
  );
}
