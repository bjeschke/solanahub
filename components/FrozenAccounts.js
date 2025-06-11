import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAccount } from "@solana/spl-token";

export default function FrozenAccounts({ mintAddress }) {
  const { connection } = useConnection();
  const [frozenAccounts, setFrozenAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copiedAddress, setCopiedAddress] = useState("");

  const fetchFrozenAccounts = async () => {
    if (!mintAddress) return;

    setLoading(true);
    setError("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);

      // Get all token accounts for this mint
      const accounts = await connection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {
          filters: [
            {
              dataSize: 165, // size of token account
            },
            {
              memcmp: {
                offset: 0,
                bytes: mintPublicKey.toBase58(),
              },
            },
          ],
        }
      );

      // Filter for frozen accounts
      const frozen = accounts
        .filter(
          (account) => account.account.data.parsed.info.state === "frozen"
        )
        .map((account) => ({
          address: account.pubkey.toString(),
          owner: account.account.data.parsed.info.owner,
          amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        }));

      setFrozenAccounts(frozen);
    } catch (err) {
      console.error("Error fetching frozen accounts:", err);
      setError("Failed to fetch frozen accounts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  useEffect(() => {
    if (mintAddress) {
      fetchFrozenAccounts();
    }
  }, [mintAddress]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Frozen Accounts
        </h3>
        <button
          onClick={fetchFrozenAccounts}
          disabled={loading || !mintAddress}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 text-sm"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : frozenAccounts.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          No frozen accounts found
        </p>
      ) : (
        <div className="space-y-4">
          {frozenAccounts.map((account, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Token Account
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                      {account.address}
                    </p>
                    <button
                      onClick={() => copyToClipboard(account.address)}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {copiedAddress === account.address ? (
                        <CheckIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <CopyIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    Balance
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {account.amount}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Owner: {account.owner}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Icons remain the same
const CopyIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
