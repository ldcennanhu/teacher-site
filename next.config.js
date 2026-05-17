/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    outputFileTracingIncludes: {
      "/*": [
        "*.html",
        "articles/**",
        "assets/**",
        "css/**",
        "data/**",
        "js/**",
        "pages/**"
      ]
    }
  }
};

module.exports = nextConfig;
