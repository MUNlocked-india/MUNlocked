import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import AppChrome from "@/components/AppChrome";

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
      <body>
        <AppChrome>{children}</AppChrome>
        <ChatWidget />
      </body>
    </html>
  );
}
