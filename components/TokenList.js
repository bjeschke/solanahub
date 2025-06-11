import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function TokenList() {
  const { publicKey } = useWallet();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, devnet, mainnet-beta

  useEffect(() => {
    loadTokens();
  }, [publicKey]);

  const loadTokens = () => {
    if (!publicKey) return;

    try {
      const savedTokens = localStorage.getItem(
        `tokens_${publicKey.toString()}`
      );
      if (savedTokens) {
        setTokens(JSON.parse(savedTokens));
      }
    } catch (error) {
      console.error("Error loading tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTokens = tokens
    .filter((token) => {
      if (filter !== "all" && token.network !== filter) return false;
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        token.name.toLowerCase().includes(searchLower) ||
        token.symbol.toLowerCase().includes(searchLower) ||
        token.mintAddress.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          No tokens created yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Your Created Tokens
      </h2>
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
            text-gray-900 dark:text-white bg-white dark:bg-gray-700
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="all">All Networks</option>
            <option value="devnet">Devnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>
        </div>
      </div>
      <div className="space-y-4">
        {tokens.map((token, index) => (
          <div
            key={token.mintAddress}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {token.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {token.symbol}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Mint Address:</span>{" "}
                    {token.mintAddress}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Decimals:</span>{" "}
                    {token.decimals}
                  </p>
                  {token.metadataUri && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      <span className="font-medium">Metadata:</span>{" "}
                      <a
                        href={token.metadataUri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                      >
                        View Metadata
                      </a>
                    </p>
                  )}
                </div>
              </div>
              {token.imageUri && (
                <div className="ml-4">
                  <img
                    src={token.imageUri}
                    alt={token.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
