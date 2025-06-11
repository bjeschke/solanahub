import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import Layout from "../components/Layout";
import "../styles/globals.css";
require("@solana/wallet-adapter-react-ui/styles.css");

import { getNetworkFromLocalStorage } from "../utils/networkConfig";

const RPC_URL_ALCHEMY = process.env.NEXT_PUBLIC_ALCHEMY;

function MyApp({ Component, pageProps }) {
  const network = getNetworkFromLocalStorage();
  console.log(network);

  // Correctly define endpoint using useMemo
  const endpoint = useMemo(() => {
    if (network === "mainnet-beta") {
      return RPC_URL_ALCHEMY;
    }
    return clusterApiUrl(network);
  }, [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ThemeProvider>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default MyApp;
