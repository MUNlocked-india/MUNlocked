import "./globals.css";

export const metadata = {
  title: "MUNlocked",
  description: "India's Model United Nations ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
