import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    // `fallback` rewrites run only when no Route Handler (app/api/**) matches.
    // This lets mock routes in app/api/ intercept requests during dev,
    // while unmatched routes are proxied to the real backend.
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}/api/:path*`,
        },
      ],
    }
  },
}

export default nextConfig
