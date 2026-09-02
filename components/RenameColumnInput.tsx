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
    <form action={action} className="column-name-form">
      <input type="hidden" name="column_id" value={columnId} />
      <input
        type="text"
        name="label"
        defaultValue={defaultLabel}
        onBlur={(e) => e.currentTarget.form?.requestSubmit()}
        className="column-name-input"
        aria-label={`Rename ${defaultLabel} criterion`}
      />
    </form>
  );
}
