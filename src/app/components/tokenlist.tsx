"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

// Type für Token mit Metadaten
interface TokenWithMeta {
    mint: string;
    amount: number;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
}

// Hauptfunktion: Tokens mit Metadaten > 1 SOL
async function getTokensOverOne(
    connection: Connection,
    walletAddress: PublicKey
): Promise<TokenWithMeta[]> {
    try {
        const tokenListRes = await fetch(
            "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json"
        );
        const tokenListJson = await tokenListRes.json();
        const tokenList: any[] = tokenListJson.tokens;

        const knownTokens = tokenList.filter(
            (t) => t.chainId === 101 && t.name && t.symbol
        );

        const parsedAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const result: TokenWithMeta[] = [];

        for (const accountInfo of parsedAccounts.value) {
            const info = accountInfo.account.data.parsed.info;
            const amount = parseFloat(info.tokenAmount.uiAmountString);
            const mint = info.mint;

            if (amount > 1) {
                const tokenMeta = knownTokens.find((t) => t.address === mint);
                if (!tokenMeta) continue;

                result.push({
                    mint,
                    amount,
                    decimals: info.tokenAmount.decimals,
                    name: tokenMeta.name,
                    symbol: tokenMeta.symbol,
                    logoURI: tokenMeta.logoURI,
                });
            }
        }

        return result;
    } catch (error) {
        console.error("❌ Fehler beim Abrufen der Tokenliste oder Tokenaccounts:", error);
        return [];
    }
}

// Komponente für das UI
export default function TokenList() {
    const { connection } = useConnection();
    const { publicKey } = useWallet();
    const [tokens, setTokens] = useState<TokenWithMeta[] | null>(null);

    useEffect(() => {
        if (!publicKey) return;

        getTokensOverOne(connection, publicKey).then(setTokens);
    }, [publicKey, connection]);

    if (!publicKey) return <p className="text-gray-500">Wallet nicht verbunden.</p>;
    if (!tokens) return <p className="text-gray-500">Lade Token-Daten…</p>;
    if (tokens.length === 0) return <p className="text-gray-500">Keine gültigen Token mit Balance &gt; 1 gefunden.</p>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Token-Liste</h2>
            <table className="min-w-full table-auto border-collapse border border-gray-200 rounded-xl overflow-hidden">
                <thead>
                <tr className="bg-gray-100">
                    <th className="text-left p-3 border-b">Name</th>
                    <th className="text-left p-3 border-b">Symbol</th>
                    <th className="text-left p-3 border-b">Balance</th>
                </tr>
                </thead>
                <tbody>
                {tokens.map((token) => (
                    <tr key={token.mint} className="hover:bg-gray-50">
                        <td className="p-3 text-sm flex items-center gap-2">
                            {token.logoURI && (
                                <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 rounded-full" />
                            )}
                            {token.name}
                        </td>
                        <td className="p-3 text-sm">{token.symbol}</td>
                        <td className="p-3 text-sm">{token.amount.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}