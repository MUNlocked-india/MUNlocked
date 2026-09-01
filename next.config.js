/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "nilfajcbazaslkjnshfp.supabase.co" }],
  },
};

module.exports = nextConfig;
