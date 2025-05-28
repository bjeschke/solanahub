import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    env: {
        PUBLIC_SOLANA_RPC: process.env.PUBLIC_SOLANA_RPC,
    },
};

export default nextConfig;
