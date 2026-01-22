/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Previne clickjacking
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          // Previne MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Controla informações de referrer
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Desabilita recursos não utilizados
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.upstash.io",
              "frame-src 'self' https://www.youtube.com https://youtube.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          // Força HTTPS (apenas em produção)
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ];
  },
};

module.exports = nextConfig;
