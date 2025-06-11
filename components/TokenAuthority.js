import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

import {
  TOKEN_PROGRAM_ID,
  createMintToInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
  getAccount,
  getMint,
  createFreezeAccountInstruction,
  createThawAccountInstruction,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import FrozenAccounts from "./FrozenAccounts";

export default function TokenAuthority() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const [accountToFreeze, setAccountToFreeze] = useState("");
  const [newAuthority, setNewAuthority] = useState("");

  // Fetch token info
  const fetchTokenInfo = async () => {
    if (!mintAddress) return;

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const mintInfo = await getMint(connection, mintPublicKey);
      setTokenInfo({
        mintAuthority: mintInfo.mintAuthority?.toBase58(),
        freezeAuthority: mintInfo.freezeAuthority?.toBase58(),
        supply: mintInfo.supply.toString(),
        decimals: mintInfo.decimals,
      });
    } catch (err) {
      setError("Error fetching token info: " + err.message);
    }
  };

  // Mint new tokens
  const mintTokens = async (e) => {
    e.preventDefault();
    if (!publicKey || !mintAddress || !recipientAddress || !amount) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const recipientPublicKey = new PublicKey(recipientAddress);

      // Get mint info to verify authority
      const mintInfo = await getMint(connection, mintPublicKey);

      if (mintInfo.mintAuthority?.toBase58() !== publicKey.toBase58()) {
        throw new Error("You don't have mint authority for this token");
      }

      // Get or create associated token account
      const associatedTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        publicKey,
        mintPublicKey,
        recipientPublicKey,
        sendTransaction // Pass sendTransaction here
      );

      // Create mint instruction
      const mintInstruction = createMintToInstruction(
        mintPublicKey,
        associatedTokenAccount.address,
        publicKey,
        BigInt(Math.floor(amount * 10 ** mintInfo.decimals)),
        [],
        TOKEN_PROGRAM_ID
      );

      // Create and send transaction
      const transaction = new Transaction().add(mintInstruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(`Successfully minted ${amount} tokens to ${recipientAddress}`);
      fetchTokenInfo(); // Refresh token info
    } catch (err) {
      console.error("Mint error:", err);
      setError("Error minting tokens: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Freeze/Thaw account
  const toggleFreeze = async (accountAddress, shouldFreeze) => {
    if (!publicKey || !mintAddress) {
      setError("Please connect wallet and enter mint address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const walletToFreeze = new PublicKey(accountAddress);

      // Get mint info to verify authority
      const mintInfo = await getMint(connection, mintPublicKey);

      if (
        !mintInfo.freezeAuthority ||
        mintInfo.freezeAuthority.toBase58() !== publicKey.toBase58()
      ) {
        throw new Error("You don't have freeze authority for this token");
      }

      // Get the ATA address
      const tokenAccountAddress = await getAssociatedTokenAddress(
        mintPublicKey,
        walletToFreeze
      );

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash();

      // Create freeze/thaw instruction
      const instruction = shouldFreeze
        ? createFreezeAccountInstruction(
            tokenAccountAddress,
            mintPublicKey,
            publicKey,
            [],
            TOKEN_PROGRAM_ID
          )
        : createThawAccountInstruction(
            tokenAccountAddress,
            mintPublicKey,
            publicKey,
            [],
            TOKEN_PROGRAM_ID
          );

      const transaction = new Transaction({
        feePayer: publicKey,
        blockhash,
        lastValidBlockHeight,
      }).add(instruction);

      try {
        const signature = await sendTransaction(transaction, connection, {
          maxRetries: 5,
        });

        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash,
          lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error("Transaction failed to confirm");
        }

        setSuccess(
          `Successfully ${
            shouldFreeze ? "frozen" : "thawed"
          } account ${accountAddress}`
        );
        fetchTokenInfo();
      } catch (txError) {
        console.error("Transaction error:", txError);
        throw new Error(`Transaction failed: ${txError.message}`);
      }
    } catch (err) {
      console.error("Freeze/Thaw error:", err);
      setError(
        `Error ${shouldFreeze ? "freezing" : "thawing"} account: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Transfer authority (Mint or Freeze)
  const transferAuthority = async (authorityType, newAuthority) => {
    if (!publicKey || !mintAddress || !newAuthority) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);
      const newAuthorityPublicKey = new PublicKey(newAuthority);

      // Create transfer authority instruction
      const instruction = createSetAuthorityInstruction(
        mintPublicKey,
        publicKey,
        AuthorityType[authorityType],
        newAuthorityPublicKey
      );

      // Create and send transaction
      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(
        `Successfully transferred ${authorityType} authority to ${newAuthority}`
      );
      fetchTokenInfo(); // Refresh token info
    } catch (err) {
      setError(`Error transferring authority: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
        Token Authority Management
      </h2>

      {/* Token Info Section */}
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Token Mint Address
            </label>
            <input
              type="text"
              value={mintAddress}
              onChange={(e) => setMintAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
              text-gray-900 dark:text-white bg-white dark:bg-gray-700
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter token mint address"
            />
          </div>
          <button
            onClick={fetchTokenInfo}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Fetch Info
          </button>
        </div>

        {tokenInfo && (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">
                  Mint Authority
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white break-all">
                  {tokenInfo.mintAuthority || "None"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">
                  Freeze Authority
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white break-all">
                  {tokenInfo.freezeAuthority || "None"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">
                  Supply
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {Number(tokenInfo.supply) / Math.pow(10, tokenInfo.decimals)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-gray-500 dark:text-gray-400">
                  Decimals
                </dt>
                <dd className="text-sm text-gray-900 dark:text-white">
                  {tokenInfo.decimals}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {/* Mint Tokens Section */}
      <form onSubmit={mintTokens} className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Mint Tokens
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
            text-gray-900 dark:text-white bg-white dark:bg-gray-700
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter recipient address"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Amount
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
            text-gray-900 dark:text-white bg-white dark:bg-gray-700
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter amount to mint"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Mint Tokens"}
        </button>
      </form>

      {/* Freeze/Thaw Account Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Freeze/Thaw Account
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Token Account Address (ATA)
          </label>
          <input
            type="text"
            value={accountToFreeze}
            onChange={(e) => setAccountToFreeze(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
            text-gray-900 dark:text-white bg-white dark:bg-gray-700
            focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter token account address (ATA) to freeze/thaw"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => toggleFreeze(accountToFreeze, true)}
            disabled={loading || !accountToFreeze}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </div>
            ) : (
              "Freeze Account"
            )}
          </button>
          <button
            onClick={() => toggleFreeze(accountToFreeze, false)}
            disabled={loading || !accountToFreeze}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Thaw Account"}
          </button>
        </div>
      </div>

      {mintAddress && (
        <div className="mt-8">
          <FrozenAccounts mintAddress={mintAddress} />
        </div>
      )}

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
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
        <div className="rounded-md bg-green-50 dark:bg-green-900/50 p-4">
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
  );
}

// Helper function to get or create associated token account
async function getOrCreateAssociatedTokenAccount(
  connection,
  payer,
  mint,
  owner,
  sendTransaction
) {
  try {
    const associatedTokenAddress = await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Check if account exists
    const account = await getAccount(connection, associatedTokenAddress);
    return { address: associatedTokenAddress, ...account };
  } catch (error) {
    if (error.name === "TokenAccountNotFoundError") {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        owner,
        false,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          payer,
          associatedTokenAddress,
          owner,
          mint,
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      const account = await getAccount(connection, associatedTokenAddress);
      return { address: associatedTokenAddress, ...account };
    }
    throw error;
  }
}
