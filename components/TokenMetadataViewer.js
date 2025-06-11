import { useState, useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";
import {
  createCreateMetadataAccountV3Instruction as createMetadataInstruction,
  PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID,
} from "@metaplex-foundation/mpl-token-metadata";

export default function TokenMetadataViewer() {
  const { connection } = useConnection();
  const [activeTab, setActiveTab] = useState("search");
  const [mintAddress, setMintAddress] = useState("");
  const [metadata, setMetadata] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load search history on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("metadataSearchHistory");
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (mintAddress, metadata) => {
    const historyItem = {
      mintAddress: mintAddress.toString(),
      metadata: {
        ...metadata,
        updateAuthority: metadata.updateAuthority.toString(),
        mint: metadata.mint.toString(),
      },
      timestamp: new Date().toISOString(),
    };

    const newHistory = [historyItem, ...searchHistory].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem("metadataSearchHistory", JSON.stringify(newHistory));
  };

  // const fetchMetadata = async (address) => {
  //   if (!address) return;

  //   setLoading(true);
  //   setError("");
  //   setMetadata(null);

  //   try {
  //     const mintPublicKey = new PublicKey(address);
  //     const [metadataAddress] = PublicKey.findProgramAddressSync(
  //       [
  //         Buffer.from("metadata"),
  //         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
  //         mintPublicKey.toBuffer(),
  //       ],
  //       TOKEN_METADATA_PROGRAM_ID
  //     );

  //     const metadataAccount = await connection.getAccountInfo(metadataAddress);

  //     if (!metadataAccount) {
  //       throw new Error("Metadata not found for this token");
  //     }

  //     const tokenMetadata = Metadata.deserialize(metadataAccount.data)[0];
  //     let additionalMetadata = {};

  //     if (tokenMetadata.data.uri) {
  //       try {
  //         const response = await fetch(tokenMetadata.data.uri);
  //         additionalMetadata = await response.json();
  //       } catch (error) {
  //         console.error("Error fetching additional metadata:", error);
  //       }
  //     }

  //     const fullMetadata = {
  //       ...tokenMetadata.data,
  //       ...additionalMetadata,
  //       updateAuthority: tokenMetadata.updateAuthority,
  //     };

  //     setMetadata(fullMetadata);
  //     saveToHistory(address, fullMetadata);
  //   } catch (err) {
  //     console.error("Error fetching metadata:", err);
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchMetadata = async (address) => {
    if (!address) return;

    setLoading(true);
    setError("");
    setMetadata(null);

    try {
      const mintPublicKey = new PublicKey(address);
      const [metadataAddress] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintPublicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      const metadataAccount = await connection.getAccountInfo(metadataAddress);

      if (!metadataAccount) {
        throw new Error("Metadata not found for this token");
      }

      const tokenMetadata = Metadata.deserialize(metadataAccount.data)[0];
      let additionalMetadata = {};

      if (tokenMetadata.data.uri) {
        try {
          const response = await fetch(tokenMetadata.data.uri);
          additionalMetadata = await response.json();
        } catch (error) {
          console.error("Error fetching additional metadata:", error);
        }
      }

      const fullMetadata = {
        ...tokenMetadata.data,
        ...additionalMetadata,
        updateAuthority: tokenMetadata.updateAuthority.toString(), // Convert to string here
        mint: mintPublicKey.toString(), // Also convert mint address
      };

      setMetadata(fullMetadata);
      saveToHistory(address, fullMetadata);
    } catch (err) {
      console.error("Error fetching metadata:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    fetchMetadata(mintAddress);
  };

  const MetadataDisplay = ({ metadata }) => (
    <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Basic Information
          </h3>
          <dl className="mt-2 space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Name
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {metadata.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Symbol
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white">
                {metadata.symbol}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                URI
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white break-all">
                <a
                  href={metadata.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {metadata.uri}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Update Authority
              </dt>
              <dd className="text-sm text-gray-900 dark:text-white break-all">
                {metadata.updateAuthority.toString()}{" "}
                {/* Convert PublicKey to string */}
              </dd>
            </div>
          </dl>
        </div>

        {metadata.image && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Token Image
            </h3>
            <img
              src={metadata.image}
              alt={metadata.name}
              className="rounded-lg max-h-48 object-contain"
            />
          </div>
        )}
      </div>

      {metadata.description && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Description
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            {metadata.description}
          </p>
        </div>
      )}

      {metadata.attributes && metadata.attributes.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Attributes
          </h3>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {metadata.attributes.map((attr, index) => (
              <div key={index} className="text-sm">
                <dt className="font-medium text-gray-500 dark:text-gray-400">
                  {attr.trait_type}
                </dt>
                <dd className="text-gray-900 dark:text-white">{attr.value}</dd>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl">
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab("search")}
            className={`${
              activeTab === "search"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Search Metadata
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`${
              activeTab === "history"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Search History
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === "search" ? (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Token Mint Address
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    value={mintAddress}
                    onChange={(e) => setMintAddress(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 
                             text-gray-900 dark:text-white bg-white dark:bg-gray-700
                             focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter token mint address"
                  />
                  <button
                    type="submit"
                    disabled={loading || !mintAddress}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                             bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                             disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? "Loading..." : "Fetch Metadata"}
                  </button>
                </div>
              </div>
            </form>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/50 p-4 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            )}

            {metadata && <MetadataDisplay metadata={metadata} />}
          </>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Searches
            </h3>
            {searchHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No search history yet
              </p>
            ) : (
              searchHistory.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => {
                    setActiveTab("search");
                    setMintAddress(item.mintAddress);
                    setMetadata(item.metadata);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.metadata.name}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.mintAddress}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
