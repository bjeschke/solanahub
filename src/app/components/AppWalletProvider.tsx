"use client"

import React, { useMemo } from "react";
import {
    ConnectionProvider,
    WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
export default function AppWalletProvider({children,}: {
    children: React.ReactNode;
}) {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = process.env.PUBLIC_SOLANA_RPC!;
    console.log("RPC Endpoint:", process.env.PUBLIC_SOLANA_RPC);
    const wallets = useMemo(
        () => [
            // manually add any legacy wallet adapters here
            // new UnsafeBurnerWalletAdapter(),
        ],
        [network],
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}