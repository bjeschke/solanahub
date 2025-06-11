import { useWallet } from "@solana/wallet-adapter-react";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import TokenCreator from "../components/TokenCreator";
import TokenOverview from "../components/TokenOverview";
import WalletTokens from "../components/WalletTokens";
import TransactionHistory from "../components/TransactionHistory";
import TokenAuthority from "../components/TokenAuthority";
import AuthorityManagement from "../components/AuthorityManagement";
import TokenList from "../components/TokenList";
import TokenMetadataViewer from "../components/TokenMetadataViewer";
import RevokeAuthority from "../components/RevokeAuthority";
import Sidebar from "../components/Layout/Sidebar";
import Header from "../components/Layout/Header";
import Head from "next/head";

// Dynamic import of WalletMultiButton to prevent SSR issues
const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

// Network selection icon components
const NetworkIcon = ({ network }) => {
  return (
    <div className="mr-2">
      <div
        className={`w-2 h-2 rounded-full ${
          network === "mainnet-beta" ? "bg-green-500" : "bg-yellow-500"
        }`}
      />
    </div>
  );
};

export default function Home() {
  const { connected } = useWallet();
  const [network, setNetwork] = useState("devnet");
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Head>
        <title>Solana Token Creator | Create SPL Tokens</title>
        <meta
          name="description"
          content="Create your own SPL tokens on Solana blockchain"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Mobile menu toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg z-50"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="lg:pl-64">
          <Header network={network} setNetwork={setNetwork} />

          <main className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
            {!connected ? (
              <div className="max-w-7xl mx-auto text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="inline-flex items-center space-x-2 text-yellow-600 dark:text-yellow-400">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <span>Please connect your wallet to continue</span>
                </div>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                  {activeTab === "create" && <TokenCreator network={network} />}
                  {activeTab === "overview" && <TokenOverview />}
                  {activeTab === "tokens" && <WalletTokens />}
                  {activeTab === "history" && (
                    <TransactionHistory network={network} />
                  )}
                  {activeTab === "authority" && <TokenAuthority />}
                  {activeTab === "manage" && <AuthorityManagement />}
                  {activeTab === "tokenList" && <TokenList />}
                  {activeTab === "metadataViewer" && <TokenMetadataViewer />}
                  {activeTab === "revokeAuthority" && <RevokeAuthority />}
                </div>
              </div>
            )}
          </main>

          <footer className="border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                Make sure you have enough SOL to cover the transaction fees.{" "}
                {network === "devnet" && (
                  <a
                    href="https://beta.solpg.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
                  >
                    Get Devnet SOL
                  </a>
                )}
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
