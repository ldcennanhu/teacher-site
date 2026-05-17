/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
};

module.exports = nextConfig;
