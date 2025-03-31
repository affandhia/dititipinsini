const {
  PHASE_DEVELOPMENT_SERVER,
  PHASE_PRODUCTION_BUILD,
} = require('next/constants');

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: process.env.ENV === 'development' ? '/dev' : '',
};

module.exports = (phase) => {
  if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) {
    const withPWA = require('@ducanh2912/next-pwa').default({
      dest: 'public',
      cacheOnFrontEndNav: true,
      aggressiveFrontEndNavCaching: true,
      reloadOnOnline: true,
      swcMinify: true,
      disable: process.env.NODE_ENV === 'development',
      workboxOptions: {
        disableDevLogs: true,
      },
    });
    return withPWA(nextConfig);
  }
  return nextConfig;
};
