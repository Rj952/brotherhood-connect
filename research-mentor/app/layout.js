import "./globals.css";

export const metadata = {
  title: "Research Mentor",
  description: "AI feedback on your research topic, proposal and paradigm alignment.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
