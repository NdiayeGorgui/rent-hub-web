/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",  // ← obligatoire pour le Dockerfile
};

module.exports = nextConfig;