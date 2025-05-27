import axios from "axios";

export async function getSolPrice(): Promise<number | null> {
    try {
        const response = await axios.get(
            "https://api.coingecko.com/api/v3/simple/price",
            {
                params: {
                    ids: "solana",
                    vs_currencies: "usd",
                },
            }
        );
        return response.data.solana.usd;
    } catch (error) {
        console.error("Fehler beim Abrufen des Solana-Preises:", error);
        return null;
    }
}