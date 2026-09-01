/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "nilfajcbazaslkjnshfp.supabase.co" }],
  },
};

module.exports = nextConfig;
