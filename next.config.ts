import type {NextConfig} from "next";

const nextConfig: NextConfig = {
    /* config options here */
    // 1. 开启静态导出：生成纯 HTML/CSS/JS 到 out 文件夹
    output: 'export',

    // 2. 关闭图片优化：因为没有 Node.js 服务器处理图片压缩
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
