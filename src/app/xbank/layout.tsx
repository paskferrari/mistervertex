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
      <div className="min-h-screen w-full overflow-hidden bg-primary text-primary">
        <main className="h-screen w-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </PWAManager>
  )
}