/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove or comment out this line:
  // output: 'export',
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;
