/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["geist"],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'flagsapi.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.akamai.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.akamai.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'avatars.steamstatic.com',
            },
            {
                protocol: 'https',
                hostname: 'cdn.cloudflare.steamstatic.com',
            }
        ]
    },
    async headers() {
        return [
            {
                source: "/api/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "false" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
                    { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization" },
                ]
            }
        ]
    }
};

export default nextConfig;