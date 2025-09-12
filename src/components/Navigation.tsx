'use client'

import { useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X, BarChart3, Wallet, Home, Users } from 'lucide-react'
import Image from 'next/image'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    description: 'Pagina principale'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Dashboard utente'
  },
  {
    name: 'XBank',
    href: '/xbank',
    icon: Wallet,
    description: 'Gestione bankroll'
  },
  {
    name: 'Community',
    href: '/welcome',
    icon: Users,
    description: 'Benvenuto nella community'
  }
]

interface ColorPalette {
  background: string
  border: string
  text: string
  textHover: string
  activeBackground: string
  activeText: string
  mobileBackground: string
  mobileBorder: string
  logoGradient: string
  buttonHover: string
  shadow: string
}

const palettes: Record<string, ColorPalette> = {
  home: {
    background: 'bg-slate-900/96 backdrop-blur-xl',
    border: 'border-purple-400/40',
    text: 'text-purple-50',
    textHover: 'hover:text-purple-200 hover:bg-purple-500/10',
    activeBackground: 'bg-gradient-to-r from-purple-500/25 to-pink-500/25',
    activeText: 'text-purple-200',
    mobileBackground: 'bg-slate-900/98 backdrop-blur-xl',
    mobileBorder: 'border-purple-400/30',
    logoGradient: 'from-purple-400 to-pink-400',
    buttonHover: 'hover:bg-purple-500/20 hover:border-purple-400/60',
    shadow: 'shadow-lg shadow-purple-500/10'
  },
  dashboard: {
    background: 'bg-white/96 backdrop-blur-xl',
    border: 'border-blue-300/50',
    text: 'text-blue-900',
    textHover: 'hover:text-blue-700 hover:bg-blue-50/80',
    activeBackground: 'bg-gradient-to-r from-blue-100/90 to-indigo-100/90',
    activeText: 'text-blue-800',
    mobileBackground: 'bg-white/98 backdrop-blur-xl',
    mobileBorder: 'border-blue-300/40',
    logoGradient: 'from-blue-600 to-indigo-600',
    buttonHover: 'hover:bg-blue-50/80 hover:border-blue-400/60',
    shadow: 'shadow-lg shadow-blue-500/10'
  },
  xbank: {
    background: 'bg-gradient-to-r from-amber-50/96 to-orange-50/96 backdrop-blur-xl',
    border: 'border-amber-400/50',
    text: 'text-amber-900',
    textHover: 'hover:text-amber-700 hover:bg-amber-100/60',
    activeBackground: 'bg-gradient-to-r from-amber-200/90 to-orange-200/90',
    activeText: 'text-amber-800',
    mobileBackground: 'bg-gradient-to-br from-amber-50/98 to-orange-50/98 backdrop-blur-xl',
    mobileBorder: 'border-amber-400/40',
    logoGradient: 'from-amber-600 to-orange-600',
    buttonHover: 'hover:bg-amber-100/70 hover:border-amber-500/60',
    shadow: 'shadow-lg shadow-amber-500/15'
  },
  welcome: {
    background: 'bg-gradient-to-r from-emerald-50/96 to-green-50/96 backdrop-blur-xl',
    border: 'border-emerald-400/50',
    text: 'text-emerald-900',
    textHover: 'hover:text-emerald-700 hover:bg-emerald-100/60',
    activeBackground: 'bg-gradient-to-r from-emerald-200/90 to-green-200/90',
    activeText: 'text-emerald-800',
    mobileBackground: 'bg-gradient-to-br from-emerald-50/98 to-green-50/98 backdrop-blur-xl',
    mobileBorder: 'border-emerald-400/40',
    logoGradient: 'from-emerald-600 to-green-600',
    buttonHover: 'hover:bg-emerald-100/70 hover:border-emerald-500/60',
    shadow: 'shadow-lg shadow-emerald-500/15'
  },
  login: {
    background: 'bg-slate-900/96 backdrop-blur-xl',
    border: 'border-purple-400/40',
    text: 'text-purple-50',
    textHover: 'hover:text-purple-200 hover:bg-purple-500/10',
    activeBackground: 'bg-gradient-to-r from-purple-500/25 to-pink-500/25',
    activeText: 'text-purple-200',
    mobileBackground: 'bg-slate-900/98 backdrop-blur-xl',
    mobileBorder: 'border-purple-400/30',
    logoGradient: 'from-purple-400 to-pink-400',
    buttonHover: 'hover:bg-purple-500/20 hover:border-purple-400/60',
    shadow: 'shadow-lg shadow-purple-500/10'
  },
  admin: {
    background: 'bg-red-950/96 backdrop-blur-xl',
    border: 'border-red-400/50',
    text: 'text-red-50',
    textHover: 'hover:text-red-200 hover:bg-red-500/10',
    activeBackground: 'bg-gradient-to-r from-red-500/25 to-rose-500/25',
    activeText: 'text-red-200',
    mobileBackground: 'bg-red-950/98 backdrop-blur-xl',
    mobileBorder: 'border-red-400/30',
    logoGradient: 'from-red-400 to-rose-400',
    buttonHover: 'hover:bg-red-500/20 hover:border-red-400/60',
    shadow: 'shadow-lg shadow-red-500/15'
  }
}

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  // Gestione scroll per effetti dinamici
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Chiudi menu mobile quando si cambia pagina
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Determina la palette di colori in base al percorso corrente
  const currentPalette = useMemo(() => {
    if (pathname === '/') return palettes.home
    if (pathname.startsWith('/dashboard')) return palettes.dashboard
    if (pathname.startsWith('/xbank')) return palettes.xbank
    if (pathname.startsWith('/welcome')) return palettes.welcome
    if (pathname.startsWith('/login')) return palettes.login
    if (pathname.startsWith('/admin')) return palettes.admin
    return palettes.home
  }, [pathname])

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* PWA Safe Area Support & Native App Optimizations */}
      <style jsx global>{`
        :root {
          --safe-area-inset-top: env(safe-area-inset-top);
          --safe-area-inset-right: env(safe-area-inset-right);
          --safe-area-inset-bottom: env(safe-area-inset-bottom);
          --safe-area-inset-left: env(safe-area-inset-left);
        }
        .safe-area-top {
          padding-top: max(var(--safe-area-inset-top), 0px);
        }
        .safe-area-sides {
          padding-left: max(var(--safe-area-inset-left), 0px);
          padding-right: max(var(--safe-area-inset-right), 0px);
        }
        /* Native App Touch Optimizations */
        .touch-optimized {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        /* Prevent bounce scroll on navigation */
        .nav-container {
          overscroll-behavior: contain;
          -webkit-overflow-scrolling: touch;
        }
      `}</style>
      
      <nav 
        className={`
          ${currentPalette.background} 
          ${currentPalette.shadow} 
          border-b ${currentPalette.border} 
          sticky top-0 z-50 
          transition-all duration-500 ease-out
          safe-area-top safe-area-sides
          nav-container touch-optimized
          ${isScrolled ? 'backdrop-blur-2xl bg-opacity-98 shadow-2xl' : 'backdrop-blur-xl'}
        `} 
        role="navigation" 
        aria-label="Menu principale"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between transition-all duration-300 ${isScrolled ? 'h-14' : 'h-16'}`}>
            {/* Logo e brand */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className={`
                  ${isScrolled ? 'w-12 h-12' : 'w-14 h-14'} 
                  bg-white 
                  rounded-xl flex items-center justify-center 
                  shadow-lg group-hover:scale-110 
                  transition-all duration-300 ease-out
                  group-hover:shadow-xl
                  border-2 border-white/20
                `}>
                  <Image 
                    src="/logoVertex.png" 
                    alt="Logo Vertex" 
                    width={isScrolled ? 32 : 40} 
                    height={isScrolled ? 32 : 40} 
                    className="transition-all duration-300 drop-shadow-sm"
                  />
                </div>
                <span className={`
                  ${isScrolled ? 'text-lg' : 'text-xl'} 
                  font-bold ${currentPalette.text} 
                  group-hover:opacity-80 
                  transition-all duration-300
                  hidden sm:block
                `}>Mister Vertex</span>
                <span className={`
                  text-sm font-bold ${currentPalette.text} 
                  group-hover:opacity-80 
                  transition-all duration-300
                  block sm:hidden
                `}>MV</span>
              </Link>
            </div>

          {/* Menu desktop */}
          <div className="hidden md:flex md:items-center md:space-x-2 lg:space-x-4">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 
                    ${isScrolled ? 'px-3 py-2' : 'px-4 py-2.5'} 
                    rounded-xl text-sm font-medium 
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    border border-transparent
                    hover:scale-105 active:scale-95
                    touch-optimized touch-target
                    ${
                      isActive(item.href)
                        ? `${currentPalette.activeBackground} ${currentPalette.activeText} shadow-lg scale-105 border-opacity-50`
                        : `${currentPalette.text} ${currentPalette.textHover} ${currentPalette.buttonHover} border-transparent`
                    }
                  `}
                  title={item.description}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <Icon className={`${isScrolled ? 'w-4 h-4' : 'w-4 h-4'} transition-all duration-300`} aria-hidden="true" />
                  <span className="hidden lg:block">{item.name}</span>
                </Link>
              )
            })}
          </div>

          {/* Pulsante menu mobile */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`
                ${currentPalette.text} ${currentPalette.buttonHover} 
                focus:outline-none focus:ring-2 focus:ring-offset-2 
                rounded-xl transition-all duration-300 
                border border-transparent
                hover:scale-110 active:scale-95
                touch-optimized touch-target
                ${isScrolled ? 'p-2' : 'p-3'}
              `}
              aria-label={isMobileMenuOpen ? 'Chiudi menu' : 'Apri menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-300`} />
              ) : (
                <Menu className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-all duration-300`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile con animazioni */}
      <div className={`
        md:hidden overflow-hidden transition-all duration-300 ease-out
        ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className={`
          ${currentPalette.mobileBackground} 
          border-t ${currentPalette.mobileBorder} 
          ${currentPalette.shadow} 
          backdrop-blur-xl
          safe-area-sides
        `} id="mobile-menu">
          <div className="px-4 pt-4 pb-6 space-y-2" role="menu">
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-4 px-4 py-4 
                    rounded-2xl text-base font-medium 
                    transition-all duration-300 ease-out
                    focus:outline-none focus:ring-2 focus:ring-offset-2 
                    border border-transparent
                    hover:scale-105 active:scale-95
                    transform touch-optimized touch-target
                    ${
                      isActive(item.href)
                        ? `${currentPalette.activeBackground} ${currentPalette.activeText} shadow-xl scale-105`
                        : `${currentPalette.text} ${currentPalette.textHover} ${currentPalette.buttonHover}`
                    }
                  `}
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isMobileMenuOpen ? 'slideInUp 0.3s ease-out forwards' : 'none'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  <div className={`
                    p-2 rounded-xl 
                    ${isActive(item.href) ? currentPalette.activeBackground : 'bg-opacity-20'}
                  `}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    {item.description && (
                      <div className={`text-sm ${currentPalette.text} opacity-70 mt-1`}>{item.description}</div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
    
    {/* Animazioni CSS */}
    <style jsx>{`
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
  </>
  )
}