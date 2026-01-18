/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      // Adicione aqui também o domínio onde suas fotos de perfil ficam salvas
    ],
  },
};

export default nextConfig;