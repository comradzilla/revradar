/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable the new App Router
  experimental: {
    appDir: true,
  },
  // Configure the page extensions
  pageExtensions: ['tsx', 'ts', 'js', 'jsx'],
}

export default nextConfig
