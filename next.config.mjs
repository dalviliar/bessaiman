/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Self-hosted uploads served straight from /public/uploads via nginx.
    // Next's built-in optimizer re-fetches each image through an internal
    // request to resize/convert it, and that internal fetch was failing
    // (getting an HTML error page back instead of the image) - breaking
    // every uploaded product photo on the public catalog. Serving the
    // original file as-is avoids that broken code path entirely.
    unoptimized: true,
  },
  // The type check after "Compiled successfully" needs more memory than the
  // VPS has - a deploy sat there for 12+ hours. Types are checked locally
  // (npx tsc --noEmit) before pushing, so the server build skips it.
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
