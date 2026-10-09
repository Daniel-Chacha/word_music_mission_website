import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
    ],
  },
  // TV was folded into the Gallery; keep old links and shared video URLs working.
  redirects() {
    return [
      { source: '/tv', destination: '/gallery', permanent: true },
      { source: '/tv/:slug', destination: '/gallery/videos/:slug', permanent: true },
    ]
  },
}

export default nextConfig
