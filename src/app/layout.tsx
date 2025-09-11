import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navigation from "../components/Navigation"

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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <Navigation />
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
