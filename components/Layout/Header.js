import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import {
  getNetworkFromLocalStorage,
  setNetworkToLocalStorage,
} from "../../utils/networkConfig";
import NetworkStatus from "../NetworkStatus";
import { useTheme } from "../../context/ThemeContext";

const WalletMultiButton = dynamic(
  () =>
    import("@solana/wallet-adapter-react-ui").then(
      (mod) => mod.WalletMultiButton
    ),
  { ssr: false }
);

export default function Header({ network, setNetwork }) {
  const { connection } = useConnection();
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    // Get saved network preference
    const savedNetwork = getNetworkFromLocalStorage();
    if (savedNetwork && savedNetwork !== network) {
      setNetwork(savedNetwork);
    }
  }, []);

  const handleNetworkChange = (selectedNetwork) => {
    setNetwork(selectedNetwork);
    setNetworkToLocalStorage(selectedNetwork);

    // Force page reload to update connection
    window.location.reload();
  };
  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-gray-800 shadow-sm z-10 border-b border-gray-200 dark:border-gray-700">
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left side - Network Selection */}
        <div className="flex items-center space-x-4">
          <select
            value={network}
            onChange={(e) => handleNetworkChange(e.target.value)}
            className="px-4 py-2 border  pr-10 py-2.5 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          >
            <option value="devnet">Devnet</option>
            <option value="mainnet-beta">Mainnet</option>
          </select>

          <div className="hidden sm:block">
            <NetworkStatus network={network} />
          </div>
        </div>

        {/* Right side - Theme Toggle and Wallet Button */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <WalletMultiButton className="!bg-indigo-600 hover:!bg-indigo-700 !rounded-lg !py-2 !px-4 !h-auto !text-sm !font-medium transition-colors" />
        </div>
      </div>
    </header>
  );
}
