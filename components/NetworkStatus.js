import { useConnection } from "@solana/wallet-adapter-react";
import { useState, useEffect } from "react";

export default function NetworkStatus({ network }) {
  const { connection } = useConnection();
  const [status, setStatus] = useState({ ok: true, ping: null });

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const startTime = Date.now();
        await connection.getVersion();
        const endTime = Date.now();
        setStatus({ ok: true, ping: endTime - startTime });
      } catch (error) {
        setStatus({ ok: false, ping: null });
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => clearInterval(interval);
  }, [connection]);

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`w-2 h-2 rounded-full ${
          status.ok ? "bg-green-500" : "bg-red-500"
        }`}
      />
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {network} {status.ping && `(${status.ping}ms)`}
      </span>
    </div>
  );
}
