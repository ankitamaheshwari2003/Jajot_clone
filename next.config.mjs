/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "images.unsplash.com",
    },
    {
      protocol: "https",
      hostname: "randomuser.me",
    },
    {
      protocol: "https",
      hostname: "yourcdn.com",
    },
  ],
},
};

export default nextConfig;
