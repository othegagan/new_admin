import type NextConfig from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.unsplash.com',
                port: ''
            },
            {
                protocol: 'https',
                hostname: '**.pexels.com',
                port: ''
            },
            {
                protocol: 'https',
                hostname: '**.tshaonline.org',
                port: ''
            },
            {
                protocol: 'https',
                hostname: '**.istockphoto.com',
                port: ''
            },
            {
                protocol: 'https',
                hostname: '**.b-cdn.net',
                port: ''
            },
            {
                protocol: 'https',
                hostname: '**.fs1.hubspotusercontent-na1.net',
                port: ''
            }
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        formats: ['image/webp']
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '20mb'
        }
    },
    async headers() {
        return [
            {
                // matching all API routes
                source: '/:path*',
                headers: [
                    { key: 'Access-Control-Allow-Credentials', value: 'true' },
                    { key: 'Access-Control-Allow-Origin', value: '*' }, // replace with your domain
                    { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
                    {
                        key: 'Access-Control-Allow-Headers',
                        value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
                    }
                ]
            }
        ];
    },
    webpack: (config) => {
        config.externals.push({ canvas: 'commonjs canvas' });
        return config;
    }
};

export default nextConfig;
