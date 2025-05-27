'use client'

import React, { useState } from 'react';

interface TokenForm {
    name: string;
    symbol: string;
    decimals: number;
    initial_supply: number;
    recipient: string;
}

interface TokenResponse {
    mint?: string;
    message?: string;
    error?: string;
}

export default function CreateCoin() {
    const [form, setForm] = useState<TokenForm>({
        name: '',
        symbol: '',
        decimals: 6,
        initial_supply: 1000000,
        recipient: '',
    });

    const [result, setResult] = useState<TokenResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: name === 'decimals' || name === 'initial_supply' ? Number(value) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/create-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data: TokenResponse = await res.json();
            setResult(data);
        } catch (err) {
            setResult({ error: 'Fehler beim Erstellen des Tokens: ' + err });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="p-4 max-w-xl">
            <h1 className="text-2xl font-bold mb-4">Solana Token Creator</h1>
            <div className="content mx-auto">
                <form onSubmit={handleSubmit} className="mx-auto space-y-4 max-w-xl">
                    <div className="line flex flex-col space-y-1 mb-8">
                        <label htmlFor="name" className="font-medium">Token Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Token Name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>

                    <div className="line flex flex-col space-y-1">
                        <label htmlFor="symbol" className="font-medium">Token Symbol</label>
                        <input
                            type="text"
                            id="symbol"
                            name="symbol"
                            placeholder="Token Symbol"
                            value={form.symbol}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>

                    <div className="line flex flex-col space-y-1">
                        <label htmlFor="decimals" className="font-medium">Dezimalstellen</label>
                        <input
                            type="number"
                            id="decimals"
                            name="decimals"
                            placeholder="z. B. 6"
                            value={form.decimals}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>

                    <div className="line flex flex-col space-y-1">
                        <label htmlFor="initial_supply" className="font-medium">Anfangsmenge (Supply)</label>
                        <input
                            type="number"
                            id="initial_supply"
                            name="initial_supply"
                            placeholder="z. B. 1000000"
                            value={form.initial_supply}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>

                    <div className="line flex flex-col space-y-1">
                        <label htmlFor="recipient" className="font-medium">Empfänger-Adresse (Wallet)</label>
                        <input
                            type="text"
                            id="recipient"
                            name="recipient"
                            placeholder="Wallet-Adresse (z. B. Phantom)"
                            value={form.recipient}
                            onChange={handleChange}
                            className="w-full border border-gray-300 p-2 rounded"
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
                        disabled={loading}
                    >
                        {loading ? 'Erstelle Token...' : 'Token erstellen'}
                    </button>
                </form>

            </div>

            {result && (
                <div className="mt-6 bg-gray-100 p-4 rounded">
                    {result.error ? (
                        <p className="text-red-600">{result.error}</p>
                    ) : (
                        <>
                            <p className="text-green-700 font-semibold">✅ Token erfolgreich erstellt!</p>
                            <p><strong>Mint:</strong> {result.mint}</p>
                            <p><strong>Tx:</strong> {result.message}</p>
                        </>
                    )}
                </div>
            )}
        </main>
    );
}
