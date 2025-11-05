/** @type {import('next').NextConfig} */
const baseConfig = {
  // Ottimizzazioni PWA
  experimental: {
    optimizeCss: false,
  },

  // Forza il root corretto per Turbopack (evita selezione /Users/piero)
  turbopack: {
    root: __dirname,
  },

  // Compressione e ottimizzazioni
  compress: true,
  poweredByHeader: false,
  
  // Ottimizzazioni per le immagini
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 anno
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers per performance e sicurezza
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/icons/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ]
  },

  // Nota: impostazioni Webpack applicate solo in produzione (vedi export condizionale sotto)

  // Configurazione per il build
  output: 'standalone',
  
  // Ottimizzazioni per il bundle analyzer (development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      if (typeof require !== 'undefined') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }
      return config
    },
  }),

  // Rewrite per PWA
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/sw.js',
      },
      {
        source: '/manifest.json',
        destination: '/manifest.json',
      },
    ]
  },

  // Configurazione per il deployment
  trailingSlash: false,
  
  // Ottimizzazioni per il rendering
  reactStrictMode: true,
  
  // Configurazione ESLint
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Configurazione TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Pacchetti esterni lato server
  serverExternalPackages: ['jsonwebtoken'],
}

const { PHASE_DEVELOPMENT_SERVER } = require('next/constants')

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // In dev non esponiamo la chiave `webpack` per consentire Turbopack
    return { ...baseConfig }
  }

  // In prod: aggiungiamo le personalizzazioni Webpack e l'analizzatore (se richiesto)
  const prodConfig = {
    ...baseConfig,
    webpack: (config, { dev, isServer }) => {
      // Fallback per moduli Node nel bundle client
      if (!isServer) {
        config.resolve = config.resolve || {}
        config.resolve.fallback = {
          ...(config.resolve.fallback || {}),
          fs: false,
          net: false,
          tls: false,
          crypto: false,
        }
      }

      if (!dev && !isServer) {
        config.optimization.splitChunks = {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        }

        config.optimization.usedExports = true
        config.optimization.sideEffects = false
      }

      // Supporto per SVG come componenti
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      // Plugin analyzer opzionale
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
          })
        )
      }

      return config
    },
  }

  return prodConfig
}