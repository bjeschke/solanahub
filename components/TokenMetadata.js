import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
  createCreateMetadataAccountV3Instruction,
  createUpdateMetadataAccountV2Instruction,
} from "@metaplex-foundation/mpl-token-metadata";
import { uploadToPinata } from "../utils/pinata";

export default function TokenMetadata() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [mintAddress, setMintAddress] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [decimals, setDecimals] = useState("9");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const findMetadataAccount = async (mint) => {
    const [metadataAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
    return metadataAddress;
  };

  const createMetadata = async (e) => {
    e.preventDefault();
    if (!publicKey || !mintAddress || !file) {
      setError("Please connect wallet, enter mint address and select an image");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);

      // Upload to Pinata
      const pinataResponse = await uploadToPinata(file, {
        name: tokenName,
        symbol: symbol,
        description: description,
        decimals: Number(decimals),
      });

      if (!pinataResponse) {
        throw new Error("Failed to upload to Pinata");
      }

      // Get metadata account address
      const metadataAddress = await findMetadataAccount(mintPublicKey);

      // Create metadata instruction
      const createMetadataIx = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataAddress,
          mint: mintPublicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: tokenName,
              symbol: symbol,
              uri: pinataResponse.metadataUri,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      );

      const transaction = new Transaction();
      const latestBlockhash = await connection.getLatestBlockhash();

      transaction.add(createMetadataIx);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(`Metadata created successfully! Transaction: ${signature}`);
    } catch (err) {
      console.error("Error creating metadata:", err);
      setError(`Error creating metadata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateMetadata = async (e) => {
    e.preventDefault();
    if (!publicKey || !mintAddress || !file) {
      setError("Please connect wallet, enter mint address and select an image");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const mintPublicKey = new PublicKey(mintAddress);

      // Upload to Pinata
      const pinataResponse = await uploadToPinata(file, {
        name: tokenName,
        symbol: symbol,
        description: description,
        decimals: Number(decimals),
      });

      if (!pinataResponse) {
        throw new Error("Failed to upload to Pinata");
      }

      // Get metadata account address
      const metadataAddress = await findMetadataAccount(mintPublicKey);

      // Create update instruction
      const updateMetadataIx = createUpdateMetadataAccountV2Instruction(
        {
          metadata: metadataAddress,
          updateAuthority: publicKey,
        },
        {
          updateMetadataAccountArgsV2: {
            data: {
              name: tokenName,
              symbol: symbol,
              uri: pinataResponse.metadataUri,
              sellerFeeBasisPoints: 0,
              creators: null,
              collection: null,
              uses: null,
            },
            updateAuthority: publicKey,
            primarySaleHappened: null,
            isMutable: true,
          },
        }
      );

      const transaction = new Transaction();
      const latestBlockhash = await connection.getLatestBlockhash();

      transaction.add(updateMetadataIx);
      transaction.recentBlockhash = latestBlockhash.blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "confirmed");

      setSuccess(`Metadata updated successfully! Transaction: ${signature}`);
    } catch (err) {
      console.error("Error updating metadata:", err);
      setError(`Error updating metadata: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Token Metadata Manager
      </h2>

      <form className="space-y-6">
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
            Token Name
          </label>
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Symbol
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Decimals
          </label>
          <input
            type="number"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Token Image
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700"
          />
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={createMetadata}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                     bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                     disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center justify-center">
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
              "Create Metadata"
            )}
          </button>

          <button
            type="button"
            onClick={updateMetadata}
            disabled={loading}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                     bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                     disabled:bg-gray-400"
          >
            {loading ? (
              <div className="flex items-center justify-center">
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
              "Update Metadata"
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/50 p-4">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-md bg-green-50 dark:bg-green-900/50 p-4">
          <p className="text-sm text-green-700 dark:text-green-300">
            {success}
          </p>
        </div>
      )}
    </div>
  );
}
