/** @type {import('next').NextConfig} */
const nextConfig = {
  // API Routesを使用するため、output: 'export'を削除
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
