import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamUp! — Le sport, en équipe",
  description: "PWA d'événements sportifs locaux. Crée, rejoins, joue.",
  manifest: "/icons/manifest.json",
  applicationName: "TeamUp!",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TeamUp!",
  },
  icons: {
    icon: [
      { url: "/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-180.png", sizes: "180x180" },
      { url: "/icons/icon-167.png", sizes: "167x167" },
      { url: "/icons/icon-152.png", sizes: "152x152" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#FF6B35",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Splash screens iOS — non supportés par l'API metadata Next.js */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/splash-1290x2796.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/splash-1179x2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
