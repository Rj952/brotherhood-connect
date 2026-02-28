import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Brotherhood Connect \u2014 Wellness for Black & Brown Men",
  description:
    "A research-powered wellness and connection platform for Black and brown men, built on decades of research. Created by Dr. Rohan Jowallah.",
  manifest: "/manifest.json",
  themeColor: "#d4af37",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Brotherhood",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/api/icon/180",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/api/icon/180" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="theme-color" content="#d4af37" />
      </head>
      <body className="app-bg min-h-screen">
        {children}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      console.log('SW registered:', reg.scope);
                    })
                    .catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
