/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['rejoin-spleen-coyness.ngrok-free.dev'],
  experimental: {
    // any existing config
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ]
  },
}

export default nextConfig;