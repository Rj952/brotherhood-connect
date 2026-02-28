import "./globals.css";

export const metadata = {
  title: "Brotherhood Connect — Wellness for Black & Brown Men",
  description: "A research-powered wellness and connection platform for Black and brown men, built on decades of research. Created by Dr. Rohan Jowallah.",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="app-bg min-h-screen">
        {children}
      </body>
    </html>
  );
}
