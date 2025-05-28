import { Connection, PublicKey } from "@solana/web3.js";

export interface TokenWithMeta {
    mint: string;
    amount: number;
    decimals: number;
    name: string;
    symbol: string;
    logoURI?: string;
}

export async function getTokensOverOne(
    connection: Connection,
    walletAddress: PublicKey
): Promise<TokenWithMeta[]> {
    try {
        const tokenListRes = await fetch(
            "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json"
        );
        const tokenListJson = await tokenListRes.json();
        const tokens: any[] = tokenListJson.tokens;

        const parsedTokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
            programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const result: TokenWithMeta[] = [];

        for (const accountInfo of parsedTokenAccounts.value) {
            const info = accountInfo.account.data.parsed.info;
            const amount = parseFloat(info.tokenAmount.uiAmountString);
            const mint = info.mint;

            if (amount > 1) {
                const metadata = tokens.find((t) => t.address === mint);
                if (!metadata) continue; // nur bekannte Token anzeigen

                result.push({
                    mint,
                    amount,
                    decimals: info.tokenAmount.decimals,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    logoURI: metadata.logoURI,
                });
            }
        }

        return result;
    } catch (err) {
        console.error("Fehler beim Abrufen der Token-Liste:", err);
        return [];
    }
}
