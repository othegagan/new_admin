import type { NextConfig } from 'next';

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
    }
};

export default nextConfig;
