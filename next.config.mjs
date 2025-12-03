/** @type {import('next').NextConfig} */

const nextConfig = {
	cacheComponents: true,
	output: 'standalone',
	htmlLimitedBots: /.*/,
};

export default nextConfig;
