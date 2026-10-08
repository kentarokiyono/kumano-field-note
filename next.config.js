/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // ビルド時の型エラーによる強制停止を無効化
    ignoreBuildErrors: true,
  },
  eslint: {
    // ビルド時のESLint警告による停止を無効化
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
