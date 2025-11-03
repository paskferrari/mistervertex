'use client'

import { useState, useEffect, useRef } from 'react'
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


export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const navRef = useRef<HTMLElement | null>(null)
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

  // Navbar luxury statica: nessuna palette dinamica

  // Aggiorna variabile CSS --nav-height per offset dinamico contenuto
  useEffect(() => {
    const updateNavHeight = () => {
      const h = navRef.current?.offsetHeight || 64
      document.documentElement.style.setProperty('--nav-height', `${h}px`)
    }
    updateNavHeight()
    window.addEventListener('resize', updateNavHeight)
    return () => window.removeEventListener('resize', updateNavHeight)
  }, [])

  // Aggiorna altezza al variare dello stato di scroll o apertura menu
  useEffect(() => {
    const h = navRef.current?.offsetHeight || 64
    document.documentElement.style.setProperty('--nav-height', `${h}px`)
  }, [isScrolled, isMobileMenuOpen])

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
          lux-nav
          transition-all duration-500 ease-out
          safe-area-top safe-area-sides
          nav-container touch-optimized
          border-b border-white/10
          ${isScrolled ? 'backdrop-blur-2xl shadow-2xl' : 'backdrop-blur-xl'}
        `} 
        ref={navRef}
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
                  bg-white/10 backdrop-blur-sm
                  rounded-xl flex items-center justify-center 
                  shadow-lg group-hover:scale-110 
                  transition-all duration-300 ease-out
                  group-hover:shadow-xl
                  border-2 border-white/20
                `}>
                  <Image 
                    src="/media/logoBianco.svg" 
                    alt="Logo Mister Vertex" 
                    width={isScrolled ? 32 : 40} 
                    height={isScrolled ? 32 : 40} 
                    className="transition-all duration-300 drop-shadow-sm"
                  />
                </div>
                <span className={`
                  ${isScrolled ? 'text-lg' : 'text-xl'} 
                  font-bold brand-gradient 
                  group-hover:opacity-80 
                  transition-all duration-300
                  hidden sm:block
                `}>Mister Vertex</span>
                <span className={`
                  text-sm font-bold brand-gradient 
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
                    lux-link ${isActive(item.href) ? 'active' : ''}
                    flex items-center space-x-2 
                    ${isScrolled ? 'px-3 py-2' : 'px-4 py-2.5'} 
                    text-sm font-medium 
                    transition-all duration-300 ease-out
                    hover:scale-105 active:scale-95
                    touch-optimized touch-target
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
                lux-link
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
          bg-primary 
          border-t border-white/10 
          shadow-lg 
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
                    lux-link ${isActive(item.href) ? 'active' : ''}
                    flex items-center space-x-4 px-4 py-4 
                    text-base font-medium 
                    transition-all duration-300 ease-out
                    hover:scale-105 active:scale-95
                    transform touch-optimized touch-target
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
                    ${isActive(item.href) ? 'bg-accent-gold-weak' : 'bg-white/10'}
                  `}>
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{item.name}</div>
                    {item.description && (
                      <div className={`text-sm text-secondary opacity-70 mt-1`}>{item.description}</div>
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