import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import "../styles/xbank-mobile.css"
import "../styles/pwa-optimizations.css"
import "../styles/luxury.css"
import Navigation from "../components/Navigation"
import PWAManager from "../components/PWAManager"
import BackgroundOrbs from "../components/BackgroundOrbs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mister Vertex - Community di Betting Professionale",
  description: "Unisciti alla community esclusiva di Mister Vertex per ricevere pronostici di betting professionali e analisi approfondite.",
  keywords: "betting, pronostici, scommesse, tipster, mister vertex, community",
  authors: [{ name: "Mister Vertex" }],
  robots: "index, follow",
  openGraph: {
    title: "Mister Vertex - Community di Betting Professionale",
    description: "Unisciti alla community esclusiva di Mister Vertex per ricevere pronostici di betting professionali.",
    type: "website",
    locale: "it_IT",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mister Vertex - Community di Betting Professionale",
    description: "Unisciti alla community esclusiva di Mister Vertex per ricevere pronostici di betting professionali.",
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="it">
      <head>
        {/* manifest, icons, preload ecc. */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Mister Vertex" />
        <meta name="application-name" content="Mister Vertex" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#000000" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/media/logoBianco.svg" as="image" />
        <link rel="preload" href="/media/logoColorato.png" as="image" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} native-app-container no-horizontal-scroll bg-primary text-primary`}>
        <PWAManager>
          <BackgroundOrbs />
          <Navigation />
          <main className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] native-scroll mobile-scroll safe-area-bottom content-offset overflow-y-auto no-horizontal-scroll">
            {children}
          </main>
        </PWAManager>
      </body>
    </html>
  )
}
