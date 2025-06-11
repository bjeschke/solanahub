import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import {
  TOKEN_PROGRAM_ID,
  createSetAuthorityInstruction,
  AuthorityType,
  getMint,
} from "@solana/spl-token";
import { Transaction, PublicKey } from "@solana/web3.js";

export default function RevokeAuthority() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Function to verify mint authority
  const verifyAuthority = async (mintPublicKey, authorityType) => {
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
  };

  // Function to revoke authority
  const revokeAuthority = async (authorityType) => {
    if (!publicKey || !mintAddress) {
      setError("Please provide a mint address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);

      // Verify authority before revoking
      await verifyAuthority(mintPublicKey, authorityType);

      // Create instruction to revoke authority (set to null)
      const instruction = createSetAuthorityInstruction(
        mintPublicKey,
        publicKey,
        AuthorityType[authorityType],
        null, // Setting to null effectively revokes the authority
        [],
        TOKEN_PROGRAM_ID
      );

      // Send transaction
      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(`Successfully revoked ${authorityType} authority`);
      setMintAddress(""); // Clear input after successful revocation
    } catch (err) {
      setError(`Error revoking authority: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Revoke Authority
        </h3>

        <div className="space-y-6">
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

          <div className="flex space-x-4">
            <button
              onClick={() => revokeAuthority("MintTokens")}
              disabled={loading || !publicKey}
              className={`flex-1 py-3 px-4 border rounded-md shadow-sm text-sm font-medium
                ${
                  loading || !publicKey
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                }`}
            >
              {loading ? "Processing..." : "Revoke Mint Authority"}
            </button>
            <button
              onClick={() => revokeAuthority("FreezeAccount")}
              disabled={loading || !publicKey}
              className={`flex-1 py-3 px-4 border rounded-md shadow-sm text-sm font-medium
                ${
                  loading || !publicKey
                    ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                    : "border-red-300 dark:border-red-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50"
                }`}
            >
              {loading ? "Processing..." : "Revoke Freeze Authority"}
            </button>
          </div>
        </div>

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

      {/* Warning Information Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Important Information
        </h3>
        <div className="prose dark:prose-invert dark:text-white">
          <p className="text-red-600 dark:text-red-400 font-medium">
            Warning: Revoking authorities is permanent and cannot be undone!
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-4">
            <li>
              <strong>Revoking Mint Authority:</strong> You will no longer be
              able to mint new tokens
            </li>
            <li>
              <strong>Revoking Freeze Authority:</strong> You will no longer be
              able to freeze token accounts
            </li>
          </ul>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Make sure you want to permanently revoke these authorities before
            proceeding. This action cannot be reversed.
          </p>
        </div>
      </div>
    </div>
  );
}
