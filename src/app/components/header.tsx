"use client";

import Image from "next/image";
import Link from "next/link";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";

export default function Header() {
    return (
        <header className="w-full px-4 py-2 flex justify-between items-center border-b shadow-sm">
            <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-semibold text-lg">Solana Hub</span>
                </Link>

                {/* Navigation */}
                <nav className="flex space-x-6 ml-8">
                    <Link
                        href="/dashboard"
                        className="text-sm font-medium text-gray-700 hover:text-black transition"
                    >
                        Dashboard
                    </Link>
                    <Link
                        href="/createcoin"
                        className="text-sm font-medium text-gray-700 hover:text-black transition"
                    >
                        Coin erstellen
                    </Link>
                </nav>
            </div>
            <div>
                <WalletMultiButton style={{}} />
            </div>
        </header>
    );
}