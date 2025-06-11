import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export default function WalletTokens() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!publicKey) return;

      setLoading(true);
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const tokenList = tokenAccounts.value.map((account) => ({
          mint: account.account.data.parsed.info.mint,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
          decimals: account.account.data.parsed.info.tokenAmount.decimals,
        }));

        setTokens(tokenList);
      } catch (error) {
        console.error("Error fetching tokens:", error);
      }
      setLoading(false);
    };

    fetchTokens();
  }, [connection, publicKey]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Wallet Tokens
      </h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No tokens found in wallet
            </p>
          ) : (
            tokens.map((token, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Token Mint
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      {token.mint}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Balance
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {token.amount}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
