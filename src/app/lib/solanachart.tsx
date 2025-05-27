"use client";

import { useEffect, useRef } from "react";

export default function SolanaChart() {
    const container = useRef<HTMLDivElement>(null);

    useEffect(() => {
        container.current!.innerHTML = "";

        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
        script.type = "text/javascript";
        script.async = true;
        script.innerHTML = JSON.stringify({
            symbol: "BINANCE:SOLUSDT",
            width: "50%",
            height: 220,
            locale: "de",
            dateRange: "1D",
            colorTheme: "dark",
            isTransparent: false,
            autosize: true,
        });

        container.current?.appendChild(script);

        return () => {
            container.current && (container.current.innerHTML = "");
        };
    }, []);

    return <div ref={container} className="w-full" />;
}