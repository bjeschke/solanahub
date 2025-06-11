import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  CreateMetadataAccountArgsV3,
  createCreateMetadataAccountV3Instruction as createMetadataInstruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createMint,
  createInitializeMintInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useState, useRef, useEffect } from "react";
import { uploadToPinata } from "../utils/pinata";
import { saveToken } from "../utils/tokenStorage";

export default function TokenCreator({ network }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [decimals, setDecimals] = useState(9);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [userBalance, setUserBalance] = useState(null);

  // Add this effect to check balance
  useEffect(() => {
    const checkBalance = async () => {
      if (publicKey) {
        const balance = await connection.getBalance(publicKey);
        setUserBalance(balance / LAMPORTS_PER_SOL);
      }
    };

    checkBalance();
    const interval = setInterval(checkBalance, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const checkWalletBalance = async () => {
    try {
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error("Error checking balance:", error);
      throw new Error("Failed to check wallet balance");
    }
  };

  // Update the createToken function
  // const createToken = async (e) => {
  //   e.preventDefault();
  //   if (!publicKey) {
  //     setError("Please connect your wallet");
  //     return;
  //   }

  //   setLoading(true);
  //   setError("");
  //   setSuccess("");

  //   try {
  //     // Check wallet balance
  //     const balance = await connection.getBalance(publicKey);
  //     const FEE_COLLECTOR = new PublicKey(process.env.NEXT_PUBLIC_FEE_RECEVIED);
  //     const CREATION_FEE =
  //       process.env.NEXT_PUBLIC_FEE_AMOUNT * LAMPORTS_PER_SOL;

  //     if (balance < CREATION_FEE) {
  //       throw new Error(
  //         "Insufficient balance. You need at least 0.05 SOL to create a token"
  //       );
  //     }

  //     // Upload to Pinata
  //     const pinataResponse = await uploadToPinata(file, {
  //       name: tokenName,
  //       symbol: tokenSymbol,
  //       description,
  //       decimals,
  //     });

  //     // Generate the mint
  //     const mintKeypair = Keypair.generate();
  //     const lamportsForMint = await getMinimumBalanceForRentExemptMint(
  //       connection
  //     );

  //     // Create fee transfer instruction
  //     const feeTransferIx = SystemProgram.transfer({
  //       fromPubkey: publicKey,
  //       toPubkey: FEE_COLLECTOR,
  //       lamports: CREATION_FEE,
  //     });

  //     // Create mint account instruction
  //     const createAccountIx = SystemProgram.createAccount({
  //       fromPubkey: publicKey,
  //       newAccountPubkey: mintKeypair.publicKey,
  //       space: MINT_SIZE,
  //       lamports: lamportsForMint,
  //       programId: TOKEN_PROGRAM_ID,
  //     });

  //     // Initialize mint instruction
  //     const initializeMintIx = createInitializeMintInstruction(
  //       mintKeypair.publicKey,
  //       decimals,
  //       publicKey,
  //       publicKey,
  //       TOKEN_PROGRAM_ID
  //     );

  //     // Combine all instructions in a single transaction
  //     const transaction = new Transaction().add(
  //       feeTransferIx,
  //       createAccountIx,
  //       initializeMintIx
  //     );

  //     const { blockhash } = await connection.getLatestBlockhash();
  //     transaction.recentBlockhash = blockhash;
  //     transaction.feePayer = publicKey;

  //     // Send transaction
  //     const signature = await sendTransaction(transaction, connection, {
  //       signers: [mintKeypair],
  //     });

  //     await connection.confirmTransaction(signature, "confirmed");

  //     setSuccess(
  //       `Token created successfully!\nMint address: ${mintKeypair.publicKey.toString()}\nMetadata URI: ${
  //         pinataResponse.metadataUri
  //       }\nFee paid: 0.05 SOL`
  //     );

  //     const tokenData = {
  //       name: tokenName,
  //       symbol: tokenSymbol,
  //       mintAddress: mintKeypair.publicKey.toString(),
  //       decimals,
  //       metadataUri: pinataResponse.metadataUri,
  //       imageUri: pinataResponse.imageUri,
  //       createdAt: new Date().toISOString(),
  //       network,
  //     };

  //     saveToken(publicKey, tokenData);
  //   } catch (err) {
  //     console.error("Error creating token:", err);
  //     setError("Error creating token: " + err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const createToken = async (e) => {
    e.preventDefault();
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check wallet balance
      const balance = await connection.getBalance(publicKey);
      const FEE_COLLECTOR = new PublicKey(process.env.NEXT_PUBLIC_FEE_RECEVIED);
      const CREATION_FEE =
        process.env.NEXT_PUBLIC_FEE_AMOUNT * LAMPORTS_PER_SOL;

      if (balance < CREATION_FEE) {
        throw new Error(
          `Insufficient balance. You need at least ${process.env.NEXT_PUBLIC_FEE_AMOUNT} SOL to create a token`
        );
      }

      // Upload to Pinata
      const pinataResponse = await uploadToPinata(file, {
        name: tokenName,
        symbol: tokenSymbol,
        description,
        decimals,
      });

      // Generate the mint
      const mintKeypair = Keypair.generate();
      const lamportsForMint = await getMinimumBalanceForRentExemptMint(
        connection
      );

      // Derive the metadata account address
      const seeds = [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintKeypair.publicKey.toBuffer(),
      ];
      const [metadataAccount] = PublicKey.findProgramAddressSync(
        seeds,
        TOKEN_METADATA_PROGRAM_ID
      );

      // Create fee transfer instruction
      const feeTransferIx = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: FEE_COLLECTOR,
        lamports: CREATION_FEE,
      });

      // Create mint account instruction
      const createAccountIx = SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: MINT_SIZE,
        lamports: lamportsForMint,
        programId: TOKEN_PROGRAM_ID,
      });

      // Initialize mint instruction with update authority
      const initializeMintIx = createInitializeMintInstruction(
        mintKeypair.publicKey,
        decimals,
        publicKey, // mintAuthority
        publicKey, // freezeAuthority
        TOKEN_PROGRAM_ID
      );

      // Create metadata instruction with update authority
      const metadataData = {
        name: tokenName,
        symbol: tokenSymbol,
        uri: pinataResponse.metadataUri,
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      };

      const createMetadataIx = createMetadataInstruction(
        {
          metadata: metadataAccount,
          mint: mintKeypair.publicKey,
          mintAuthority: publicKey,
          payer: publicKey,
          updateAuthority: publicKey, // Set update authority to the creator
        },
        {
          createMetadataAccountArgsV3: {
            data: metadataData,
            isMutable: true, // Allow future updates
            collectionDetails: null,
          },
        }
      );

      // Create transaction
      const transaction = new Transaction();
      transaction.add(feeTransferIx);
      transaction.add(createAccountIx);
      transaction.add(initializeMintIx);
      transaction.add(createMetadataIx);

      // Get latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Send and confirm transaction
      const signature = await sendTransaction(transaction, connection, {
        signers: [mintKeypair],
      });

      await connection.confirmTransaction(signature, "confirmed");

      // Update success message to include all authorities
      setSuccess(
        `Token created successfully!\n
      Mint address: ${mintKeypair.publicKey.toString()}\n
      Metadata URI: ${pinataResponse.metadataUri}\n
      Fee paid: ${process.env.NEXT_PUBLIC_FEE_AMOUNT} SOL\n
      Mint Authority: ${publicKey.toString()}\n
      Freeze Authority: ${publicKey.toString()}\n
      Update Authority: ${publicKey.toString()}`
      );

      // Save token data with all authorities
      const tokenData = {
        name: tokenName,
        symbol: tokenSymbol,
        mintAddress: mintKeypair.publicKey.toString(),
        decimals,
        metadataUri: pinataResponse.metadataUri,
        imageUri: pinataResponse.imageUri,
        createdAt: new Date().toISOString(),
        network,
        mintAuthority: publicKey.toString(),
        freezeAuthority: publicKey.toString(),
        updateAuthority: publicKey.toString(),
      };

      saveToken(publicKey, tokenData);

      // Reset form
      setTokenName("");
      setTokenSymbol("");
      setDecimals(9);
      setDescription("");
      setFile(null);
    } catch (err) {
      console.error("Error creating token:", err);
      setError("Error creating token: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    tokenName && tokenSymbol && description && file && !loading && publicKey;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
      <div className="mt-4 mb-4 space-y-2">
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Creation Fee
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              A fee of 0.05 SOL will be charged to create your token.
            </p>
          </div>
          {userBalance !== null && (
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Balance
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {userBalance.toFixed(4)} SOL
              </p>
            </div>
          )}
        </div>
        {userBalance !== null && userBalance < 0.05 && (
          <div className="text-sm text-red-600 dark:text-red-400">
            Insufficient balance. You need at least 0.05 SOL to create a token.
          </div>
        )}
      </div>

      <form onSubmit={createToken} className="space-y-6">
        {/* Form fields remain the same */}
        <div>
          <label
            htmlFor="tokenName"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Token Name
          </label>
          <input
            id="tokenName"
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter token name"
          />
        </div>

        <div>
          <label
            htmlFor="tokenSymbol"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Token Symbol
          </label>
          <input
            id="tokenSymbol"
            type="text"
            value={tokenSymbol}
            onChange={(e) => setTokenSymbol(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter token symbol"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter token description"
          />
        </div>

        <div>
          <label
            htmlFor="decimals"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Decimals
          </label>
          <input
            id="decimals"
            type="text"
            value={decimals}
            onChange={(e) => setDecimals(Number(e.target.value))}
            min="0"
            max="9"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                     text-gray-900 dark:text-white bg-white dark:bg-gray-700
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="token decimals (Default 9)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Token Image
          </label>
          <div className="mt-1 flex items-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                       text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                       hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Upload Image
            </button>
            {file && (
              <span className="ml-4 text-sm text-gray-500 dark:text-gray-400">
                {file.name}
              </span>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${
              !isFormValid
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
              Creating Token...
            </div>
          ) : (
            "Create Token"
          )}
        </button>

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
                <div className="mt-2 text-sm text-green-700 dark:text-green-300 break-all">
                  {success}
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
