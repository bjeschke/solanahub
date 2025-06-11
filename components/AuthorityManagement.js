import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  TOKEN_PROGRAM_ID,
  createSetAuthorityInstruction,
  AuthorityType,
  getMint,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

export default function AuthorityManagement() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [newAuthority, setNewAuthority] = useState("");
  const [authorityType, setAuthorityType] = useState("MintTokens");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Transfer Authority Function
  const transferAuthority = async (e) => {
    e.preventDefault();
    if (!publicKey || !mintAddress || !newAuthority) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const newAuthorityPublicKey = new PublicKey(newAuthority);

      // Get mint info to verify current authority
      const mintInfo = await getMint(connection, mintPublicKey);
      const currentAuthority =
        authorityType === "MintTokens"
          ? mintInfo.mintAuthority
          : mintInfo.freezeAuthority;

      if (
        !currentAuthority ||
        currentAuthority.toBase58() !== publicKey.toBase58()
      ) {
        throw new Error(
          `You don't have ${authorityType} authority for this token`
        );
      }

      // Create instruction to transfer authority
      const instruction = createSetAuthorityInstruction(
        mintPublicKey,
        publicKey,
        AuthorityType[authorityType],
        newAuthorityPublicKey,
        [],
        TOKEN_PROGRAM_ID
      );

      // Send transaction
      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(
        `Successfully transferred ${authorityType} authority to ${newAuthority}`
      );

      // Clear form
      setNewAuthority("");
    } catch (err) {
      setError(`Error transferring authority: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Transfer Authority
        </h3>

        <form onSubmit={transferAuthority} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Token Mint Address
            </label>
            <input
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter token mint address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Authority Type
            </label>
            <select
              value={authorityType}
              onChange={(e) => setAuthorityType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="MintTokens">Mint Authority</option>
              <option value="FreezeAccount">Freeze Authority</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              New Authority Address
            </label>
            <input
              type="text"
              value={newAuthority}
              onChange={(e) => setNewAuthority(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                       text-gray-900 dark:text-white bg-white dark:bg-gray-700
                       focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter new authority address"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !publicKey}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
              ${
                loading || !publicKey
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              }`}
          >
            {loading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Transfer Authority"
            )}
          </button>
        </form>

        {/* Error and Success Messages */}
        {error && (
          <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Success
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  {success}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Info Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Authority Information
        </h3>
        <div className="prose dark:prose-invert  dark:text-white">
          <p>
            Token authorities allow you to control various aspects of your
            token:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Mint Authority:</strong> Controls the ability to create
              new tokens
            </li>
            <li>
              <strong>Freeze Authority:</strong> Controls the ability to freeze
              token accounts
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Note: Once you transfer an authority, you won't be able to perform
            those actions unless you're given the authority back. Make sure
            you're transferring to the correct address.
          </p>
        </div>
      </div>
    </div>
  );
}

// Add this to your existing TokenAuthority.js

// Function to revoke authority
const revokeAuthority = async (authorityType) => {
  if (!publicKey || !mintAddress) return;

  setLoading(true);
  setError("");
  setSuccess("");

  try {
    const mintPublicKey = new PublicKey(mintAddress);

    // Create instruction to revoke authority (set to null)
    const instruction = createSetAuthorityInstruction(
      mintPublicKey,
      publicKey,
      AuthorityType[authorityType],
      null,
      [],
      TOKEN_PROGRAM_ID
    );

    // Send transaction
    const transaction = new Transaction().add(instruction);
    const signature = await sendTransaction(transaction, connection);
    await connection.confirmTransaction(signature, "confirmed");

    setSuccess(`Successfully revoked ${authorityType} authority`);
    fetchTokenInfo(); // Refresh token info
  } catch (err) {
    setError(`Error revoking authority: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

// Add these buttons to your TokenAuthority component UI
<div className="space-y-4 mt-6">
  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
    Revoke Authorities
  </h3>
  <div className="flex space-x-4">
    <button
      onClick={() => revokeAuthority("MintTokens")}
      className="flex-1 py-2 px-4 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50"
    >
      Revoke Mint Authority
    </button>
    <button
      onClick={() => revokeAuthority("FreezeAccount")}
      className="flex-1 py-2 px-4 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/50"
    >
      Revoke Freeze Authority
    </button>
  </div>
</div>;
