"use client";

import Link from "next/link";
import {WalletMultiButton} from "@solana/wallet-adapter-react-ui";
import {motion} from "framer-motion";
import {usePathname} from "next/navigation";

const routes= [
    {
        name: "Dashboard",
        path: "/dashboard",
    },
    {
        name: "Create Coin",
        path: "/createcoin",

    }

];

export default function Header() {
    return (
        <header className="w-full px-4 py-2 flex justify-between items-center border-b shadow-sm">
            <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center space-x-2">
                    <span className="font-semibold text-lg">Solana Hub</span>
                </Link>

                <nav>
                    <ul className="flex gap-x-6 ml-8 text-sm">
                        {
                            routes.map((route) => (
                                <li key={route.path} className="text-white/50 hover:text-white transition relative">
                                    <Link
                                        href={route.path}
                                        className="h-12 flex items-center relative"
                                    >
                                        {route.name}
                                    </Link>
                                    <motion.div className="bg-green h-1 w-full absolute bottom-2"></motion.div>
                                </li>
                            ))
                        }
                    </ul>
                </nav>
            </div>
            <div>
                <WalletMultiButton style={{}} />
            </div>
        </header>
    );
}