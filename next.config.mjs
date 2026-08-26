/** @type {import('next').NextConfig} */

const INSFORGE_URL =
  process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://59y4evms.ap-southeast.insforge.app';

/**
 * InsForge API prefixes proxied through this origin.
 *
 * The SDK talks to a handful of `/api/*` namespaces; ours are `/api/orders`,
 * `/api/razorpay`, `/api/shiprocket` and `/api/upload`, so the two sets do not
 * overlap. Listing the upstream prefixes explicitly keeps it that way even if
 * a new route lands on either side.
 */
const INSFORGE_API_PREFIXES = [
  'auth',
  'database',
  'storage',
  'ai',
  'email',
  'payments',
  'custom-endpoint',
  'insforge-token',
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  /**
   * Proxy InsForge through our own origin.
   *
   * The session lives in an HttpOnly `insforge_refresh_token` cookie that the
   * backend sets with `SameSite=None` and no `Domain`. Called cross-origin that
   * is a third-party cookie — which browsers are phasing out and Lighthouse
   * flags — so we forward the same paths from this origin instead and the
   * cookie is set host-only on our own domain. Proxying also drops the CORS
   * preflight that fronted every SDK call.
   *
   * The upstream sets `Path=/api/auth`, so the paths have to be mirrored
   * exactly rather than nested under a prefix of our own.
   */
  async rewrites() {
    return INSFORGE_API_PREFIXES.map((prefix) => ({
      source: `/api/${prefix}/:path*`,
      destination: `${INSFORGE_URL}/api/${prefix}/:path*`,
    }));
  },
};

export default nextConfig;
