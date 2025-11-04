// Evita dipendenze di build su '@capacitor/cli' in ambienti come Vercel
// Definiamo un tipo locale minimale per la configurazione di Capacitor
type CapacitorConfig = {
  appId?: string
  appName?: string
  webDir?: string
  server?: {
    url?: string
    androidScheme?: string
    allowNavigation?: string[]
    cleartext?: boolean
  }
  plugins?: Record<string, unknown>
}

// Usa CAP_URL per puntare a un server custom (es. Android emulator 10.0.2.2:3000)
// Usa CAP_DEV=1 per abilitare la modalità dev di default su localhost:3000
const isDev = process.env.CAP_DEV === '1'
const defaultDevUrl = 'http://localhost:3000'
const url = process.env.CAP_URL || (isDev ? defaultDevUrl : defaultDevUrl)

const config: CapacitorConfig = {
  appId: 'com.mistervertex.app',
  appName: 'Mister Vertex',
  // Nota: non usiamo webDir perché carichiamo da server.url in dev/test.
  server: {
    url,
    androidScheme: 'https',
    // In dev, permettiamo navigazione a host comuni
    allowNavigation: ['localhost', '127.0.0.1', '10.0.2.2'],
    // cleartext è rilevante su Android: in dev può essere http
    cleartext: url.startsWith('http://'),
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
}

export default config