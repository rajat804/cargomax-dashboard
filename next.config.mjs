/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,   // ✅ Build ke time linting skip karega
  },
  // Prevent server-side rendering for specific packages
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude client-only packages from server bundle
      config.externals = [
        ...config.externals,
        'html2pdf.js',
        'html2canvas',
        'jspdf'
      ];
    }
    return config;
  },
};

export default nextConfig;