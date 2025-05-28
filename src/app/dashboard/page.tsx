"use client";

import React, {useEffect, useState} from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import SolanaChart from "@/app/lib/solanachart";
import TokenList from "@/app/components/tokenlist";

export default function Dashboard() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [balance, setBalance] = useState<number>(0);

    useEffect(() => {
        let balanceInterval: NodeJS.Timeout;

        const fetchInitialData = async () => {

            if (publicKey) {
                const updateBalance = async () => {
                    const newBalance = await connection.getBalance(publicKey);
                    setBalance(newBalance / LAMPORTS_PER_SOL);
                };

                await updateBalance(); // sofort laden
                balanceInterval = setInterval(updateBalance, 10000); // alle 10s
            }
        };

        fetchInitialData();

        return () => {
            if (balanceInterval) clearInterval(balanceInterval);
        };
    }, [publicKey, connection]);

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stat-Karten */}
                <div className="bg-grey p-6 rounded-2xl shadow-md border">
                    <h2 className="text-lg font-semibold mb-2">Gesamtbalance</h2>
                    <p className="text-2xl font-bold">{ balance } SOL</p>
                </div>

                <div className="bg-grey p-6 rounded-2xl shadow-md border">
                    <h2 className="text-lg font-semibold mb-2">Erstellte Coins</h2>
                    <p className="text-2xl font-bold">0</p>
                </div>

                <div className="bg-grey p-6 rounded-2xl shadow-md border">
                    <h2 className="text-lg font-semibold mb-2">Netzwerk</h2>
                    <p className="text-2xl font-bold">Devnet</p>
                </div>
            </div>

            <TokenList />

            {/* Platz für weitere Inhalte */}
            <div className="mt-10">
                <h2 className="text-2xl font-semibold mb-4">Letzte Aktionen</h2>
                <div className="bg-grey p-4 rounded-xl shadow border">
                    <p className="text-gray-500">Noch keine Aktivitäten</p>
                </div>
            </div>


            <SolanaChart />
        </div>
    );
}
