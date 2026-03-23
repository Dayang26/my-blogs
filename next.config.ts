import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // 1. 开启静态导出：生成纯 HTML/CSS/JS 到 out 文件夹
    output: 'export',
    distDir: 'out',

    // 2. 关闭图片优化：因为没有 Node.js 服务器处理图片压缩
    images: {
        unoptimized: true,
    },

    // 3. 性能优化
    compress: true,
    poweredByHeader: false,

    // 4. 安全头 (用于静态导出，middleware 不可用)
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
