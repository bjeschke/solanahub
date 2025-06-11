import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";

export default function TransactionHistory({ network }) {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return;

      setLoading(true);
      try {
        const signatures = await connection.getSignaturesForAddress(publicKey, {
          limit: 10,
        });

        const txDetails = await Promise.all(
          signatures.map(async (sig) => {
            const tx = await connection.getTransaction(sig.signature);
            return {
              signature: sig.signature,
              timestamp: new Date(sig.blockTime * 1000).toLocaleString(),
              status: sig.err ? "Failed" : "Success",
              ...tx,
            };
          })
        );

        setTransactions(txDetails);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [connection, publicKey]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Transaction History
      </h2>
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No transactions found
            </p>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.signature}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {tx.timestamp}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      {tx.signature}
                    </p>
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        tx.status === "Success"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                </div>
                <div className="mt-2">
                  <a
                    href={`${
                      network == "mainnet-beta"
                        ? `https://explorer.solana.com/tx/${tx.signature}`
                        : `https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`
                    } `}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 text-sm"
                  >
                    View on Explorer
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
