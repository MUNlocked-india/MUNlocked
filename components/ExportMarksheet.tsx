"use client";

type Props = {
  fileName: string;
  headers: string[];
  rows: Array<Array<string | number>>;
};

function csvCell(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

export default function ExportMarksheet({ fileName, headers, rows }: Props) {
  function download() {
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName || "munlocked-marksheet"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button type="button" onClick={download} className="marksheet-export-button">
      Download CSV <span aria-hidden="true">↓</span>
    </button>
  );
}
