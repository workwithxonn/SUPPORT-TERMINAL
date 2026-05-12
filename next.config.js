/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We need this because we use lucide-react and other ESM packages
  transpilePackages: ["lucide-react", "motion"],
};

export default nextConfig;
