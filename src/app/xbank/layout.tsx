import type { Metadata } from "next"
import PWAManager from "../../components/PWAManager"

export const metadata: Metadata = {
  title: "X-Bank - Gestione Bankroll | Mister Vertex",
  description: "Gestisci il tuo bankroll, pronostici e scalate con X-Bank di Mister Vertex.",
  keywords: "bankroll, gestione, pronostici, scalate, betting, mister vertex",
}

export default function XBankLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <PWAManager>
      <div className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] w-full bg-primary text-primary no-horizontal-scroll">
        <main className="min-h-screen supports-[height:100dvh]:min-h-[100dvh] w-full overflow-y-auto mobile-scroll safe-area-bottom">
          {children}
        </main>
      </div>
    </PWAManager>
  )
}