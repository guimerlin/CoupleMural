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
  output: 'export',
  distDir: '.vercel/output/static',
  experimental: {
    // Reduz o tamanho do cache
    turbotrace: {
      logLevel: 'error'
    }
  },
  // Configuração para Cloudflare Pages
  trailingSlash: true,
  // Otimizações de build
  swcMinify: true,
  compress: true,
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Limita o tamanho dos chunks para evitar arquivos muito grandes
      config.optimization.splitChunks = {
        chunks: 'all',
        maxSize: 244000, // ~240KB por chunk
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            maxSize: 244000,
          },
        },
      };
    }
    return config;
  },
}

export default nextConfig
